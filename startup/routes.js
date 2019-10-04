const express = require('express');

const error = require('../middleware/error');
const pages = require('../routes/pages');
// const auth = require('../routes/auth');

module.exports = function(app) {
    app.use(express.json());

    app.use('/api', pages);
    // app.use('/api/auth', auth);
    app.use(error);
}
