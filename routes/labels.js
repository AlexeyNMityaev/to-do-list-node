const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');
const validateObjectId = require('../middleware/validateObjectId');
const { Label, validate } = require('../models/label');

router.get('/', auth, async (req, res) => {
    const labels = await Label.find({ userId: req.user._id }).select('-userId');

    res.send(labels);
});

router.post('/', [auth, validator(validate)], async (req, res) => {
    let label = new Label({
        name: req.body.name,
        userId: req.user._id
    });

    label = await label.save();
    res.send(label);
});

router.put('/:id', [auth, validateObjectId, validator(validate)], async (req, res) => {
    let label = await Label.findById(req.params.id);
    if (!label) {
        return res.status(404).res('Label not found.');
    }

    label.name = req.body.name;

    label = await label.save();
    res.send(label);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    const label = await Label.findOneAndDelete({ _id: req.params.id });
    if (!label) {
        return res.status(404).res('Label not found.');
    }

    res.send(label);
});

module.exports = router;
