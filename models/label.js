const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 1,
        max: 255,
        required: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        required: true
    }
});

const Label = mongoose.model('Label', labelSchema);

function validate(obj) {
    const model = Joi.object({
        name: Joi.string().min(1).max(255).required()
    });
    return model.validate(obj);
};

module.exports.Label = Label;
module.exports.validate = validate;
