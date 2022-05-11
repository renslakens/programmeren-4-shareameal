const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

let insertedUserId = 0;
let insertedTestUserId = 0;

describe('UC-User', () => {
    describe('UC-201 Register as new user', () => {
        it('TC-201-1 When a required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    // firstName ontbreekt
                    lastName: 'Lakens',
                    emailAdress: 'rens@lakens.org',
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The firstname must be a string');
                    done();
                });
        });
        it('When an emailAdress is not valid, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: 'Rens',
                    lastName: 'Lakens',
                    emailAdress: 'rens@lakens.org',
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The street must be a string');
                    done();
                });
        });
        it('When a password is not valid, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: 'Rens',
                    lastName: 'Lakens',
                    emailAdress: 'rens@lakens.org',
                    password: 9,
                    isActive: 1,
                    phoneNumber: '0612345678',
                    roles: 'editor',
                    street: 'Peppelgaarde',
                    city: 'Etten-Leur',
                })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The password must a string');
                    done();
                });
        });
        it('TC-201-4 When a user already exists with the same email, a valid error should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'wachtwoord',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    insertedTestUserId = res.body.result.userId;
                });
            chai
                .request(server)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(409);
                    result.should.be.a('string').that.equals('User is niet toegevoegd in database');
                    done();
                });
        });
        it('TC-201-5 When a user is succesfully added, a valid response should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@sfsdfsdfsfa.org',
                password: 'wachtwoord',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .post('/api/user')
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(201);
                    result.firstName.should.be.a('string').that.equals(user.firstName);
                    insertedUserId = result.userId;
                    done();
                });
        });
    });

    describe('UC-202 View of users', () => {});
    describe('UC-203 Requiring user profile', () => {});

    describe('UC-204 Details of user', () => {
        it('TC-204-2 When a user whose ID does not exist is requested, a valid error should be returned', (done) => {
            chai
                .request(server)
                .get('/api/user/9999')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('User with provided ID does not exist');
                    done();
                });
        });
        it('TC-204-3 When a user whose ID does exist is requested, a valid response should be returned', (done) => {
            chai
                .request(server)
                .get('/api/user/3')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result[0].id.should.equals(3);
                    done();
                });
        });
    });

    describe('UC-205 Edit user', () => {
        it('TC-205-1 When a required field is missing, a valid error should be returned', (done) => {
            const user = {
                // firstName is missing
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'wachtwoord',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .put('/api/user/1')
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a('string').that.equals('The firstname must be a string');
                    done();
                });
        });
        it('TC-205-4 When a user with the provided ID does not exist, a valid error should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'wachtwoord',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .put('/api/user/9999')
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.a('string').that.equals('User with provided ID does not exist');
                    done();
                });
        });
        it('TC-205-6 When a user is succesfully updated, a valid response should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'wachtwoord',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .put('/api/user/4')
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.a('string').that.equals('Succusful update!');
                    done();
                });
        });
    });

    describe('UC-206 Deleting user', () => {
        it('TC-206-1 When a user does not exist, a valid error should be returned', (done) => {
            chai
                .request(server)
                .delete('/api/user/9999')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.a('string').that.equals('User does not exist');
                    done();
                });
        });
        it('TC-206-4 When a user is succesfully deleted, a valid response should be returned', (done) => {
            chai.request(server).delete(`/api/user/${insertedUserId}`).end();
            chai
                .request(server)
                .delete(`/api/user/${insertedTestUserId}`)
                .end((err, res) => {
                    console.log(insertedTestUserId);
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.a('string').that.equals('Succesful deletion');
                    done();
                });
        });
    });
});