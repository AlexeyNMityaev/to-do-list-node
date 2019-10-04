const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to To-do List API');
});

module.exports = router;
