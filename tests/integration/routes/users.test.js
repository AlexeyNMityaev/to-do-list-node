let server;
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('../../../models/user');

describe('/api/users', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { 
        await User.deleteMany({});
        await server.close();
    });

    describe('GET /', () => {

        let token;
        let userMock;

        const exec = async () => {
            return await request(server)
                            .get('/api/users/')
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            userMock = {
                name: '12345',
                email: 'test@test.com',
                password: '12345',
                role: 'admin'
            };
            let user = new User(userMock);
            await user.save();
            token = user.getAuthToken();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            userMock.role = 'user';
            let user = new User(userMock);
            token = user.getAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return all users', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body.some(g => g.name === userMock.name)).toBeTruthy();
        });
    });

    describe('GET /:id', () => {

        let token;
        let userMock;
        let user;
        let id;

        const exec = async () => {
            return await request(server)
                            .get('/api/users/' + id)
                            .set('x-auth-token', token);
        };
        
        beforeEach(async () => {
            userMock = {
                name: '12345',
                email: 'test@test.com',
                password: '12345',
                role: 'admin'
            };
            user = new User(userMock);
            await user.save();
            id = user._id;
            token = user.getAuthToken();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            userMock.role = 'user';
            let tempUser = new User(userMock);
            token = tempUser.getAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if user is not found', async () => {
            id = new mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return user if data is valid', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', userMock.name);
        });
    });

    describe('POST /', () => {

        let userMock;

        const exec = async () => {
            return await request(server)
                            .post('/api/users/')
                            .send(userMock);
        };
        
        beforeEach(async () => {
            userMock = {
                name: '12345',
                email: 'test@test.com',
                password: '12345'
            };
        });

        it('should return 400 if name is empty or invalid', async () => {
            userMock.name = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is empty or invalid', async () => {
            userMock.email = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is empty already taken', async () => {
            let user = new User(userMock);
            await user.save();
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password is empty or invalid', async () => {
            userMock.password = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should create user if data is valid', async () => {
            const res = await exec();
            const user = await User.findOne({ email: userMock.email });

            expect(user).not.toBeNull();
        });

        it('should retun user and add token to response header if data is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('email', userMock.email);
            expect(res.body).toHaveProperty('name', userMock.name);
            expect(res.header).toHaveProperty('x-auth-token');
        });
    });

    describe('POST /me', () => {

        let token;
        let userMock;

        const exec = async () => {
            return await request(server)
                            .post('/api/users/me')
                            .set('x-auth-token', token)
                            .send(userMock);
        };
        
        beforeEach(async () => {
            userMock = {
                name: '12345',
                email: 'test@test.com',
                password: '12345'
            };
            let user = new User(userMock);
            await user.save();
            token = user.getAuthToken();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if user does not exist', async () => {
            token = new User().getAuthToken();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should retun user if data is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('email', userMock.email);
            expect(res.body).toHaveProperty('name', userMock.name);
        });
    });

    describe('PUT /:id', () => {

        let token;
        let userMock;
        let user;

        const exec = async () => {
            return await request(server)
                            .put('/api/users/' + user._id)
                            .set('x-auth-token', token)
                            .send(userMock);
        };
        
        beforeEach(async () => {
            userMock = {
                name: '12345',
                email: 'test@test.com',
                password: '12345',
                newPassword: '54321'
            };
            let salt = await bcrypt.genSalt(10);
            let password = await bcrypt.hash('12345', salt);
            user = new User({
                name: '12345',
                email: 'test@test.com',
                password: password
            });
            user = await user.save();
            token = user.getAuthToken();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if name is empty or invalid', async () => {
            userMock.name = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is empty or invalid', async () => {
            userMock.email = '';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email is already taken', async () => {
            let newUser = new User({
                name: '12345',
                email: 'test2@test.com',
                password: '12345',
                newPassword: '54321'
            });
            await newUser.save();
            userMock.email = newUser.email;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if password is invalid', async () => {
            userMock.password = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 403 if user is not authorized', async () => {
            user._id = new mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if user is not found', async () => {
            await user.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update user if data is valid', async () => {
            userMock.email = 'test2@test.com';
            const res = await exec();
            user = await User.findOne({ email: userMock.email });

            expect(user).not.toBeNull();
        });

        it('should update and retun user if data is valid', async () => {
            userMock.name = '54321';
            userMock.email = 'test2@test.com';
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', userMock.name);
            expect(res.body).toHaveProperty('email', userMock.email);
        });

        it('should update password if data is valid', async () => {
            const res = await exec();
            user = await User.findOne({ email: userMock.email });
            let validPassword = await bcrypt.compare(userMock.newPassword, user.password);

            expect(validPassword).toBe(true);
        });
    });

    describe('DELETE /:id', () => {

        let token;
        let user = {};

        const exec = async () => {
            return await request(server)
                            .delete('/api/users/' + user._id)
                            .set('x-auth-token', token)
                            .send();
        };
        
        beforeEach(async () => {
            user = new User({
                name: '12345',
                email: 'test@test.com',
                password: '12345'
            });
            user = await user.save();
            token = user.getAuthToken();
        });

        it('should return 401 if user is not authenticated', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not authorized', async () => {
            user._id = new mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if user is not found', async () => {
            await user.delete();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete user and return 200 ', async () => {
            const res = await exec();
            const tempUser = await User.findById(user._id);

            expect(tempUser).toBeNull();
            expect(res.status).toBe(200);
        });
    });
});
