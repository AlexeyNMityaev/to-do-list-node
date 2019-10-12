let server;
const request = require('supertest');
const { User } = require('../../../models/user');
const { Label } = require('../../../models/label');

describe('/api/labels', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { 
        await User.deleteMany({});
        await Label.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {

        let token;
        let label;
        let name;

        const exec = async () => {
            return await request(server)
                            .get('/api/labels/')
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            name = '12345';
            label = new Label({
                name: name,
                userId: user._id
            });
            await label.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return all labels', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.name === name)).toBeTruthy();
        });
    });

    describe('GET /:id', () => {

        let token;
        let label;
        let name;
        let id;

        const exec = async () => {
            return await request(server)
                            .get('/api/labels/' + id)
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            name = '12345';
            label = new Label({
                name: name,
                userId: user._id
            });
            id = label._id;
            await label.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if labelId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if user is not authorized', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if label is not found', async () => {
            await label.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return label if data is correct', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });

    describe('POST /', () => {

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                            .post('/api/labels/')
                            .set('x-auth-token', token)
                            .send({ name: name });
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            name = '12345';
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if name is empty or invalid', async () => {
            name = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should create label if data is valid', async () => {
            const res = await exec();
            const label = await Label.findById(res.body._id);

            expect(label).not.toBeNull();
        });

        it('should retun label if data is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let label;
        let id;

        const exec = async () => {
            return await request(server)
                            .put('/api/labels/' + id)
                            .set('x-auth-token', token)
                            .send({ name: name });
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            name = '12345';
            label = new Label({
                name: name,
                userId: user._id
            });
            id = label._id;
            await label.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if name is empty or invalid', async () => {
            name = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if labelId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if user is not authorized', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if label is not found', async () => {
            await label.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update label if data is valid', async () => {
            name = '54321';
            const res = await exec();
            label = await Label.findOne({ name: name });

            expect(label).not.toBeNull();
        });

        it('should update and retun label if data is valid', async () => {
            name = '54321';
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });

    describe('DELETE /:id', () => {

        let token;
        let label;
        let id;

        const exec = async () => {
            return await request(server)
                            .delete('/api/labels/' + id)
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            let user = new User();
            token = user.getAuthToken();

            name = '12345';
            label = new Label({
                name: name,
                userId: user._id
            });
            id = label.id;
            await label.save();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if labelId is invalid', async () => {
            id = '1';
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if user is not authorized', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if note is not found', async () => {
            await label.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete note and return it', async () => {
            const res = await exec();
            const tempLabel = await Label.findById(label._id);

            expect(tempLabel).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });
});
