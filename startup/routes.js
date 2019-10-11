const express = require('express');

const error = require('../middleware/error');
const auth = require('../middleware/auth');
const pages = require('../routes/pages');
const users = require('../routes/users');
const login = require('../routes/login');
const labels = require('../routes/labels');

module.exports = function(app) {
    app.use(express.json());

    app.use('/api', pages);
    // app.use(auth);
    app.use('/api/users', users);
    app.use('/api/login', login);
    app.use('/api/labels', labels);
    app.use(error);
}
