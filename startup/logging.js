const winston = require('winston');

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logger.log' })
    ],
    exceptionHandlers: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'uncaughtException.log' })
    ]
});

function startLogging() {
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
}

module.exports.logger = logger;
module.exports.startLogging = startLogging;
