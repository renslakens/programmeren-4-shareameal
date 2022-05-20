const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const database = require("../../dbconnection");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const assert = require('assert');
const { jwtSecretKey, logger } = require('../../src/config')
const index = require("../../index");

chai.should();
chai.use(chaiHttp);

let insertedUserId = 0;
let insertedTestUserId = 0;

let validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk4LCJpYXQiOjE2NTMwNDYyNzYsImV4cCI6MTY1NDA4MzA3Nn0.dFwoRpLZr8qfyHPsgv73a0dWfvU9-MYVpx7L1r8AtTE";
const invalidToken = "evnsdkKiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2JsdIkfjjMsImlhdCI6MTY1MzA1NDzg3NzA4LCJleHAiOjE2NTM4MjQ19.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";

const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'rens@lakens.org';"
const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'test@avans.nl';"
const ADD_USER = "INSERT INTO `user`" +
    "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
    "VALUES ('Thijmen', 'Vuur', 'Lovensdijkstraat', 'Breda', 'U3lsdkfj!', 'test@avans.nl', '0612345678', 'editor');"

describe('UC-User', () => {
    describe('UC-201 Register as new user', () => {
        beforeEach((done) => {
            logger.debug("beforeEach called");
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

            //AANPASSEN NAAR POOL
            database.getConnection(function(err, connection) {
                if (err) throw err

                // Use the connection
                connection.query(
                    CLEAR_DB,
                    function(error, results, fields) {
                        // When done with the connection, release it.
                        connection.release();

                        // Handle error after the release.
                        if (err) throw err
                            // Let op dat je done() pas aanroept als de query callback eindigt!
                        logger.debug("beforeEach done");
                        done();
                    }
                );
            });
        });

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