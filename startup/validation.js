const Joi = require('@hapi/joi');

module.exports = function() {
    Joi.objectId = function() {
        return Joi.string().regex(/^[0-9a-fA-F]{24}$/);
    };
}
