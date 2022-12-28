const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");

const PORT = process.env.PORT ?? 5500;

app.use(logger);

const corsWhitelist = ["http://localhost:5500"];
const corsOptions = {
  origin: (origin, callback) => {
    if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(express.static(path.join(__dirname, "/public")));

app.get("^/$|index(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/new-page(.html)?", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get("/old-page(.html)?", (request, response) => {
  response.redirect(301, path.join(__dirname, "views", "new-page.html"));
});

app.all("*", (request, response) => {
  response.status(404);
  if (request.accepts("html")) {
    response.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (request.accepts("json")) {
    response.json({ error: "404 not found." });
  } else {
    response.type('txt').send("404 not found.");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
