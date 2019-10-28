const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const { logger, startLogging } = require('./startup/logging');

startLogging();
const originsWhitelist = [
    'http://localhost:4200'
];
const corsOptions = {
    origin: function(origin, callback) {
        let isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}
app.use(cors(corsOptions));
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
if(process.env.NODE_ENV === 'production') {
    require('./startup/prod')(app);
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;
