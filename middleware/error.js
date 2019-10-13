const { logger } = require('../startup/logging');

module.exports = function(error, req, res, next) {
    logger.error(error.message, error);
    res.status(error.status === 400 ? error.status : 500)
        .send(error.status === 400 ? error.message : 'Internal server error.');
}
