const bcrypt = require("bcrypt");
const path = require("path");
const fsPromises = require("fs").promises;

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users.push(data);
  },
};

const handleNewUser = async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password)
    return response
      .status(400)
      .json({ message: `Username and password are required.` });
  const duplicate = usersDB.users.find((user) => username === user.username);
  if (duplicate) return response.sendStatus(409);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    usersDB.setUsers(newUser);
    await fsPromises.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );
    response.status(201).json({ message: `User ${username} created.` });
    console.log(usersDB.users);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

module.exports = { handleNewUser };
