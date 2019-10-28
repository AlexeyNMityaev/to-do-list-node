let server;
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../../models/user');
const { Note } = require('../../../models/note');

describe('/api/notes', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { 
        await User.deleteMany({});
        await Note.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {

        let token;
        let note;
        let noteMock;

        const exec = async () => {
            return await request(server)
                            .get('/api/notes/')
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id
            };
            name = '12345';
            note = new Note(noteMock);
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return all notes', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.title === noteMock.title)).toBeTruthy();
        });
    });

    describe('GET /archive', () => {

        let token;
        let note;
        let noteMock;

        const exec = async () => {
            return await request(server)
                            .get('/api/notes/archive')
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id,
                archived: true
            };
            name = '12345';
            note = new Note(noteMock);
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return all archived notes', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.title === noteMock.title)).toBeTruthy();
            expect(res.body.some(g => g.archived === noteMock.archived)).toBeTruthy();
        });
    });

    describe('GET /:id', () => {

        let token;
        let note;
        let noteMock;
        let id;

        const exec = async () => {
            return await request(server)
                            .get('/api/notes/' + id)
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id
            };
            note = new Note(noteMock);
            id = note._id;
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if noteId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if userId is wrong', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if note is not found', async () => {
            await note.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return note if data is correct', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', noteMock.title);
        });
    });

    describe('POST /', () => {

        let token;
        let noteMock;

        const exec = async () => {
            return await request(server)
                            .post('/api/notes/')
                            .set('x-auth-token', token)
                            .send(noteMock);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345'
            };
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if title is empty or invalid', async () => {
            noteMock.title = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should create note if data is valid', async () => {
            const res = await exec();
            const note = await Note.findById(res.body._id);

            expect(note).not.toBeNull();
        });

        it('should retun note if data is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', noteMock.title);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let note;
        let noteMock;
        let id;

        const exec = async () => {
            return await request(server)
                            .put('/api/notes/' + id)
                            .set('x-auth-token', token)
                            .send({ title: noteMock.title });
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id
            };
            note = new Note(noteMock);
            id = note._id;
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if title is empty or invalid', async () => {
            noteMock.title = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if noteId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if userId is wrong', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if note is not found', async () => {
            id = new mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update note if data is valid', async () => {
            noteMock.title = '54321';
            const res = await exec();
            note = await Note.findOne({ title: noteMock.title });

            expect(note).not.toBeNull();
        });

        it('should update and retun note if data is valid', async () => {
            noteMock.title = '54321';
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', noteMock.title);
        });
    });

    describe('DELETE /', () => {

        let token;
        let note;
        let noteMock;

        const exec = async () => {
            return await request(server)
                            .delete('/api/notes/')
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id
            };
            note = new Note(noteMock);
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if notes are not found', async () => {
            await Note.deleteMany({});
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete notes and return the number of documents deleted', async () => {
            const res = await exec();
            const allNotes = await Note.find();

            expect(allNotes.length).toBe(0);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('deletedCount', 1);
        });
    });

    describe('DELETE /:id', () => {

        let token;
        let note;
        let noteMock;
        let id;

        const exec = async () => {
            return await request(server)
                            .delete('/api/notes/' + id)
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            noteMock = {
                title: '12345',
                userId: user._id
            };
            note = new Note(noteMock);
            id = note._id;
            await note.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if noteId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if userId is wrong', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if note is not found', async () => {
            await note.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete note and return it', async () => {
            const res = await exec();
            const tempNote = await Note.findById(note._id);

            expect(tempNote).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', noteMock.title);
        });
    });
});
