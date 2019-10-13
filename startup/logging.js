const { createLogger, transports, format } = require('winston');
const { combine, colorize } = format;
require('express-async-errors');

const logger = createLogger({
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                format.simple()
            )
        }),
        new transports.File({ filename: 'logger.log' })
    ],
    exceptionHandlers: [
        new transports.Console({
            format: combine(
                colorize(),
                format.simple()
            )
        }),
        new transports.File({ filename: 'uncaughtException.log' })
    ]
});

function startLogging() {
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
}

module.exports.logger = logger;
module.exports.startLogging = startLogging;
