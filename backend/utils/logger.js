const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
  info: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message, data || '');
    appendLog(`${timestamp} INFO: ${message} ${JSON.stringify(data || '')}\n`);
  },

  error: (message, error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, message, error);
    appendLog(
      `${timestamp} ERROR: ${message} ${error?.stack || error?.message || error}\n`
    );
  },

  warn: (message, data) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN:`, message, data || '');
    appendLog(`${timestamp} WARN: ${message} ${JSON.stringify(data || '')}\n`);
  },
};

function appendLog(message) {
  const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, message);
}

module.exports = logger;
