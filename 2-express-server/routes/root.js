const express = require("express");
const router = express.Router();
const path = require("path");

router.get("^/$|index(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/new-page(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "..", "views", "new-page.html"));
});

router.get("/old-page(.html)?", (request, response) => {
  response.redirect(301, "/new-page.html");
});

module.exports = router;
