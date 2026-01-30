import fs from 'fs';
import path from 'path';

export const loggerService = {
    debug(...args) {
        doLog('DEBUG', ...args);
    },
    info(...args) {
        doLog('INFO', ...args);
    },
    warn(...args) {
        doLog('WARN', ...args);
    },
    error(...args) {
        doLog('ERROR', ...args);
    }
};

const logsDir = './logs';
const logFile = path.join(logsDir, 'backend.log');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

function getTime() {
    const now = new Date();
    return now.toLocaleString('he');
}

function isError(e) {
    return e instanceof Error;
}

function doLog(level, ...args) {
    const strs = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (isError(arg)) return arg.stack || arg.message;
        try {
            return JSON.stringify(arg);
        } catch {
            return String(arg);
        }
    });

    const line = `${getTime()} - ${level} - ${strs.join(' | ')}\n`;

    console.log(line);

    fs.appendFile(logFile, line, (err) => {
        if (err) {
            console.error('FATAL: cannot write to log file', err);
        }
    });
}