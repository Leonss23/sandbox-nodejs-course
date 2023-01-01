const bcrypt = require("bcrypt");
const { response } = require("express");

const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users.push(data);
  },
};

const handleLogin = async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password)
    return response
      .status(400)
      .json({ message: `Username and password are required.` });
  const foundUser = usersDB.users.find((user) => username === user.username);
  if (!foundUser) return response.sendStatus(401);
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    response.json({ message: `Now logged in as ${username}.` });
  } else response.sendStatus(401);
};

module.exports = { handleLogin };
