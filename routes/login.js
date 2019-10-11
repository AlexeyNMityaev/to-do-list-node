const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('../middleware/validator');
const { User, validateLogin } = require('../models/user');

router.post('/', validator(validateLogin), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Invalid email or password.');
    }

    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid email or password.');
    }

    let token = user.getAuthToken();
    res.send(token);
});

module.exports = router;
