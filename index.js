const express = require('express');
const app = express();
require('dotenv').config();

const { logger, startLogging } = require('./startup/logging');

startLogging();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
// require('./startup/validation')();
if(process.env.NODE_ENV === 'production') {
    require('./startup/prod')(app);
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;
