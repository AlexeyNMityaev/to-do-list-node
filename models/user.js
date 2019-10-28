const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        minlength: 5,
        maxlength: 255,
        required: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 1024,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: 'user'
    }
});

userSchema.methods.getAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id, role: this.role },
        config.get('jwtPrivateToken')
    );
    return token;
}

const User = mongoose.model('User', userSchema);

function validate(obj) {
    const model = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required(),
    });
    return model.validate(obj);
};

function validateLogin(obj) {
    const model = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });
    return model.validate(obj);
};

function validateUpdate(obj) {
    const model = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255),
        newPassword: Joi.string().min(3).max(255)
    })
        .with('password', 'newPassword');
    return model.validate(obj);
};

module.exports.User = User;
module.exports.validate = validate;
module.exports.validateLogin = validateLogin;
module.exports.validateUpdate = validateUpdate;
