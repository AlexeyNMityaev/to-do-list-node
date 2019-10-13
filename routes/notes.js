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

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
        return res.status(404).send('Note not found.');
    }
    
    res.send(note);
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
    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: {
            title: req.body.title,
            archived: req.body.archived,
            color: req.body.color,
            labelIds: req.body.labelIds,
            text: req.body.text,
            ticks: req.body.ticks,
            updatedAt: new Date()
        } },
        { new: true }
    );
    if (!note) {
        return res.status(404).send('Note not found.');
    }

    res.send(note);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    let note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
        return res.status(404).send('Note not found.');
    }

    res.send(note);
});

module.exports = router;
