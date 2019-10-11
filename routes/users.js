const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');
const validateObjectId = require('../middleware/validateObjectId');
const admin = require('../middleware/admin');
const { User, validate, validateUpdate } = require('../models/user');

router.post('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.status(404).send('User not found.');
    }
    res.send(user);
});

router.get('/', [auth, admin], async (req, res) => {
    const users = await User.find().select('-password');
    res.send(users);
});

router.post('/', validator(validate), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('Email already taken.');
    }

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    let token = user.getAuthToken();
    res.header('x-auth-header', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.put('/:id', [auth, validateObjectId, validator(validateUpdate)], async (req, res) => {
    if (req.user._id !== req.params.id) {
        return res.status(403).res('Not authorized.');
    }

    let user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).res('User not found.');
    }

    user.name = req.body.name;
    user.email = req.body.email;
    if (req.body.newPassword && req.body.password) {
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid password.');
        }
        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    user = await user.save();
    res.send(user);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    if (req.user._id !== req.params.id) {
        return res.status(403).send('Not authorized.');
    }

    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) {
        return res.status(404).send('User not found.');
    }

    res.send('User deleted.');
});

module.exports = router;
