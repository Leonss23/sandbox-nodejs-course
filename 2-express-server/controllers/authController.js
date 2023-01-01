const bcrypt = require("bcrypt");
const { response } = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

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
    const accessToken = jwt.sign(
      { username: foundUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const otherUsers = usersDB.users.filter(
      (user) => user.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    usersDB.users.push(currentUser);
    await fsPromises(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(usersDB.users)
    );
    response.json({ message: `Now logged in as ${username}.` });
  } else response.sendStatus(401);
};

module.exports = { handleLogin };
