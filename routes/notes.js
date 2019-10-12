const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');
const validateObjectId = require('../middleware/validateObjectId');
const { Note, validate } = require('../models/note');

router.get('/', auth, async (req, res) => {
    const notes = await Note.find({ userId: req.user._id }).select('-userId');

    res.send(notes);
});

router.post('/', [auth, validator(validate)], async (req, res) => {
    let note = new Note({
        title: req.body.title,
        userId: req.user._id,
        color: req.body.color,
        labelIds: req.body.labelIds,
        text: req.body.text,
        ticks: req.body.ticks
    });

    note = await note.save();
    res.send(note);
});

router.put('/:id', [auth, validateObjectId, validator(validate)], async (req, res) => {
    let note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).send('Note not found.');
    }

    if (!note.userId.equals(req.user._id)) {
        return res.status(403).send('Access denied.');
    }

    note.title = req.body.title;
    note.archived = req.body.archived;
    note.color = req.body.color;
    note.labelIds = req.body.labelIds;
    note.text = req.body.text;
    note.ticks = req.body.ticks;

    note = await note.save();
    res.send(note);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).send('Note not found.');
    }

    if (!note.userId.equals(req.user._id)) {
        return res.status(403).send('Access denied.');
    }

    note = await note.delete();

    res.send(note);
});

module.exports = router;
