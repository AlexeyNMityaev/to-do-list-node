let server;
const request = require('supertest');
const bcrypt = require('bcrypt');
const { User } = require('../../../models/user');

describe('/api/login', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { 
        await User.deleteMany({});
        server.close();
    });

    let token;
    let userMock;

    const exec = () => {
        return request(server)
                        .post('/api/login/')
                        .send({ email: userMock.email, password: userMock.password });
    };

    beforeEach(async () => {
        userMock = {
            name: '12345',
            email: 'test@test.com',
            password: '12345'
        };
        let salt = await bcrypt.genSalt(10);
        let password = await bcrypt.hash(userMock.password, salt);
        let user = new User({
            name: userMock.name,
            email: userMock.email,
            password: password
        });
        user = await user.save();

        token = user.getAuthToken();
    });

    it('should return 400 if user email is not provided or invalid', async () => {
        userMock.email = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if user password is not provided or invalid', async () => {
        userMock.password = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return valid token if data is correct', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.text).toEqual(token);
    });
});
