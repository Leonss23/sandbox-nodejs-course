const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;

const logEvents = require("./logEvents");
const Events = require("events");

class MyEvents extends Events {}

const myEvents = new MyEvents();


myEvents.on("log", (msg,fileName) => {logEvents(msg,fileName);});

const PORT = process.env.PORT ?? 5500;

const server = http.createServer((request, response) => {
  console.log(request.url, request.method);
  myEvents.emit("log", `${request.url}\t${request.method}`, "reqLog.txt");

  const extension = path.extname(request.url);

  const contentType = getContentType(extension);

  // Suffixes .html if no extension is specified
  const filePath =
    !extension && request.url.slice(-1) !== "/"
      ? getFilePath(contentType, request.url) + ".html"
      : getFilePath(contentType, request.url);

  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    switch (path.parse(filePath).base) {
      case "old-page.html":
        response.writeHead(301, { Location: "/new-page.html" });
        response.end();
        break;
      case "www-page.html":
        response.writeHead(301, { Location: "/" });
        response.end();
        break;
      default:
        serveFile(
          path.join(__dirname, "views", "404.html"),
          "text/html",
          response
        );
    }
  } else {
    serveFile(filePath, contentType, response);
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

async function serveFile(filePath, contentType, response) {
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") ? "utf8" : ""
    );
    const data =
      contentType === "application/json" ? JSON.parse(rawData) : rawData;
    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "Content-Type": contentType,
    });
    response.end(
      contentType === "application/json" ? JSON.stringify(data) : data
    );
  } catch (err) {
    console.log(err);
    myEvents.emit("log", `${err.name}\t${err.message}`, "errLog.txt");
    response.statusCode = 500;
    response.end();
  }
}

function getFilePath(contentType, url) {
  return contentType === "text/html" && url === "/"
    ? path.join(__dirname, "views", "index.html")
    : contentType === "text/html" && url.slice(-1) === "/"
    ? path.join(__dirname, "views", url, "index.html")
    : contentType === "text/html"
    ? path.join(__dirname, "views", url)
    : path.join(__dirname, url);
}

function getContentType(extension) {
  switch (extension) {
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".txt":
      return "text/plain";
    default:
      return "text/html";
  }
}
