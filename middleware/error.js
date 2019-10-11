const { logger } = require('../startup/logging');

module.exports = function(error, req, res, next) {
    logger.error(error.message, error);
    res.status(error.status ? error.status : 500)
        .send(error.message ? error.message : 'Internal server error.');
}
