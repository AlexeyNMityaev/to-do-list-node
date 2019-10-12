const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 1,
        max: 255,
        required: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    archived: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        maxlength: 24,
        default: 'default'
    },
    labelIds: [{
        type: new mongoose.Schema({
            id: {
                type: ObjectId
            }
        })
    }],
    text: {
        type: String,
        maxlength: 4192,
        trim: true
    },
    ticks: [{
        type: new mongoose.Schema({
            name: {
                type: String,
                maxlength: 4192,
                trim: true
            },
            ticked: {
                type: Boolean,
                default: false
            }
        })
    }],
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

const Note = mongoose.model('Note', noteSchema);

function validate(obj) {
    const model = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        archived: Joi.boolean(),
        color: Joi.string().max(24),
        labelIds: Joi.array().items(Joi.object({
            id: Joi.objectId().required()
        })),
        text: Joi.string().max(40192),
        ticks: Joi.array().items(Joi.object({
            name: Joi.string().max(4192).required(),
            ticked: Joi.boolean()
        }))
    });
    return model.validate(obj);
};

module.exports.Note = Note;
module.exports.validate = validate;
