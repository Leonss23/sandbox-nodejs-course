const data = {
  employees: require("../model/employees.json"),
  addEmployee: function (data) {
    this.employees.push(data);
  },
  getLastId: function () {
    return this.employees.reduce((last, current) => {
      return current.id > last.id ? current : last;
    }).id;
  },
};

// initial incremented id for new employee
let lastId = data.getLastId();

// creates a new employee with incremented id
const newEmployee = (request, response) => {
  const requestEmployee = {
    id: ++lastId,
    firstname: request.body.firstname,
    lastname: request.body.lastname,
  };
  data.addEmployee(requestEmployee);
  response.status(201).json(data.employees);
};

const getAllEmployees = (request, response) => {
  response.json(data.employees);
};

const getEmployee = (request, response) => {
  response.json({ id: request.params.id });
};

const updateEmployee = (request, response) => {
  const employee = data.employees.find(
    (employee) => employee.id === parseInt(request.body.id)
  );
  console.log(employee);
  if (!employee) {
    return response
      .status(400)
      .json({ message: `Employee ID ${request.body.id} not found` });
  }
  if (request.body.firstname) employee.firstname = request.body.firstname;
  if (request.body.lastname) employee.lastname = request.body.lastname;
  response.json(data.employees);
};

const deleteEmployee = (request, response) => {
  let employeeIndex = data.employees.findIndex(
    (employee) => employee.id === parseInt(request.body.id)
  );
  data.employees.splice(parseInt(employeeIndex),1);
  response.json({
    message: `Employee by ID ${request.body.id} deleted`,
    employees: data.employees,
  });
};

module.exports = {
  newEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
