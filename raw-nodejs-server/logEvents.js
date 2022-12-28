const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

async function logEvents(message,logName) {
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t ${uuid()}\t${message}\n`;
  console.log(logItem);
  try {
    const logsDirPath = path.join(__dirname, "logs");
    const logsDirExists = fs.existsSync(logsDirPath);
    if (!logsDirExists) await fs.promises.mkdir(logsDirPath);

    const logsPath = path.join(__dirname, "logs", logName);
    await fs.promises.appendFile(logsPath, logItem);
  } catch (err) {
    console.error(err);
  }
}

module.exports = logEvents;
