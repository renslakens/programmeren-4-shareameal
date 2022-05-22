const chai = require('chai');
const chaiHttp = require('chai-http');
const { it, afterEach } = require('mocha');
const server = require('../../index');
const pool = require('../../dbconnection');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const assert = require('assert');
const { jwtSecretKey, logger } = require('../../src/config/config');
const index = require('../../index');

chai.should();
chai.use(chaiHttp);

// let insertedUserId = 0;
// let insertedTestUserId = 0;

//const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2MywiaWF0IjoxNjUzMjQ4NjM5LCJleHAiOjE2NTQyODU0Mzl9.B5JOCbLpSKi6AT9_ds6RP2XP4oHP3hpCUipegfrkeIE';
const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NSwiaWF0IjoxNjUzMjUxMjQ4LCJleHAiOjE2NTQyODgwNDh9.NDCU19kiEPQDqizEUUf6-MgPPLOa35t0X1mGJj13bSY';
//const invalidToken = 'evnsdkKiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2JsdIkfjjMsImlhdCI6MTY1MzA1NDzg3NzA4LCJleHAiOjE2NTM4MjQ19.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU';

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(4, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(5, "test", "test", "test@avans.nl", "test", "test", "test");';

// const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'rens@lakens.org';"
// const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'test@avans.nl';"
// const ADD_USER = "INSERT INTO `user`" +
//     "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
//     "VALUES ('Thijmen', 'Vuur', 'Lovensdijkstraat', 'Breda', 'U3lsdkfj!', 'test@avans.nl', '0612345678', 'editor');"

describe('UC-User', () => {
    describe('UC-101 login', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
            });
        });
        it('TC 101-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                    password: "Geh3imWachtwoord!"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The emailAddress must be a string');
                    done();
                });
        });
        it('TC 101-2 When the email address does not match the regex, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                    emailAdress: "jdoe@server",
                    password: "Geh3imWachtwoord!"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('emailAdress is invalid');

                    done();
                });
        });
        it('TC 101-3 When the user does not exist, a valid error should be returned', (done) => {
            chai.request(server).post('/auth/login').send({
                    emailAdress: "Geh3imWachtwoord!",
                    password: "password"
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('User not found or password invalid');
                    done();
                });
        });
        it('TC 101-4 User successfully logged in', (done) => {
            dbconnection.query(INSERT_USER_1, () => {
                chai.request(server).post('/auth/login').send({
                        emailAdress: "d.ambesi@avans.nl",
                        password: "secret"
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.be.an('object');
                        let { status, result } = res.body;
                        status.should.equals(200);
                        done();
                    });
            });
        });
    });

    describe('UC-201 Register as new user', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
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
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The firstname must be a string');
                    done();
                });
        });
        it('TC-201-2 When an emailAdress is not valid, a valid error should be returned', (done) => {
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
        it('TC-201-3 When a password is not valid, a valid error should be returned', (done) => {
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
            pool.query(INSERT_USER_1, (err, result, fields) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'Test',
                        lastName: 'Test',
                        emailAdress: 'd.ambesi@avans.nl',
                        password: 'Geh3imWachtwoord!',
                        isActive: 1,
                        phoneNumber: '0612345678',
                        roles: 'editor',
                        street: 'street',
                        city: 'city',
                    })
                    .end((err, res) => {
                        res.should.be.an('object');
                        let { status, message } = res.body;
                        status.should.equals(409);
                        message.should.be.a('string').that.equals('User has not been added');
                        done();
                    });
            });
        });
        it('TC-201-5 When a user is succesfully added, a valid response should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'Geh3imWachtwoord!',
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
                    done();
                });
        });
    });

    // describe('UC-202 View of users', () => {
    //     afterEach((done) => {
    //         logger.debug('afterEach called');
    //         // Maak testdatabase leeg zodat we testen kunnen uitvoeren
    //         pool.query(CLEAR_USERS_TABLE, function(err) {
    //             if (err) throw err
    //             logger.debug('afterEach done');
    //             done();
    //         });
    //     });
    //     it('TC 202-1 Zero users should be returned', (done) => {
    //         chai
    //             .request(server)
    //             .get('api/user')
    //             .set({ Authorization: `Bearer ${validToken}` })
    //             .end((err, res) => {
    //                 res.should.be.an('object');
    //                 let { status, result } = res.body;
    //                 status.should.equals(200);
    //                 result.should.be.an('array').to.eql([]);
    //                 done();
    //             });
    //     });
    //     it('TC 202-2 Two users should be returned', (done) => {
    //         pool.query(INSERT_USER_1, () => {
    //             pool.query(INSERT_USER_2, () => {
    //                 chai.request(server).get("/api/user/")
    //                     .end((err, res) => {
    //                         res.should.be.an('object');
    //                         let { status, result } = res.body;
    //                         status.should.equals(200);
    //                         result.should.be.an('array').to.have.lengthOf(2);
    //                         done();
    //                     });
    //             });
    //         });
    //     });
    //     it('TC 202-3 When search item does not match firstname, a valid error should be returned.', (done) => {
    //         pool.query(INSERT_USER_1, () => {
    //             chai.request(server).get("/api/user?firstName=gebruiker")
    //                 .end((err, res) => {
    //                     res.should.be.an('object');
    //                     let { status, result } = res.body;
    //                     status.should.equals(200);
    //                     result.should.be.an('array').to.eql([]);
    //                     done();
    //                 });
    //         });
    //     });
    //     it('TC 202-5 Active users should be returned', (done) => {
    //         pool.query(INSERT_USER_1, () => {
    //             pool.query(INSERT_USER_2, () => {
    //                 chai.request(server).get('/api/user?isActive=true')
    //                     .end((err, res) => {
    //                         res.should.be.an('object');
    //                         let { status, result } = res.body;
    //                         status.should.equals(200);
    //                         done();
    //                     });
    //             });
    //         });
    //     });
    //     it('TC 202-6 User that matches the search item should be returned', (done) => {
    //         pool.query(INSERT_USER_1, () => {
    //             pool.query(INSERT_USER_2, () => {
    //                 chai.request(server).get('/api/user?isActive=true')
    //                     .end((err, res) => {
    //                         res.should.be.an('object');
    //                         let { status, result } = res.body;
    //                         status.should.equals(200);
    //                         done();
    //                     });
    //             });
    //         });
    //     });
    // });

    describe('UC-203 Requiring user profile', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
            });
        });
        it('TC 203-1 When the token is not valid, a valid error should be returned', (done) => {
            chai.request(server).get('/api/user/profile')
                .set({ Authorization: 'Bearer asdfjlasjffslasdjfs' })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a('string').that.equals('Not authorized');
                    done();
                });
        });
        it('TC 203-2 Valid token, user should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).get('/api/user')
                    .set({ Authorization: validToken })
                    .end((err, res) => {
                        res.should.be.an('object');
                        let { status, result } = res.body;
                        status.should.equals(200);
                        done();
                    });
            });
        });
    });

    describe('UC-204 Details of user', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
            });
        });
        it('TC 204-1 When the token is not valid, a valid error should be returned', (done) => {
            chai.request(server).get('/api/user/1')
                .set({ Authorization: 'Bearer asdfjlasjffslasdjfs' })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a('string').that.equals('Not authorized');
                    done();
                });
        });
        it('TC-204-2 When a user whose ID does not exist is requested, a valid error should be returned', (done) => {
            chai
                .request(server)
                .get('/api/user/9999')
                .set({ Authorization: validToken })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('User with provided Id does not exist');
                    done();
                });
        });
        it('TC-204-3 When a user whose ID does exist is requested, a valid response should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).get('/api/user/1')
                    .set({ Authorization: validToken })
                    .end((err, res) => {
                        res.should.be.an('object');
                        let { status, result } = res.body;
                        status.should.equals(200);
                        done();
                    });
            });
        });
    });

    describe('UC-205 Edit user', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
            });
        });
        it('TC-205-1 When a required field is missing, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).put('/api/user/1')
                    .set({ Authorization: validToken })
                    .send({
                        firstName: "firstName",
                        lastName: "last",
                        //emailAdress is missing
                        password: "Geh3imWachtwoord!",
                        isActive: 1,
                        phoneNumber: "0612345678",
                        roles: 'editor',
                        street: "street",
                        city: "city",
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.be.an('object');
                        let { status, message } = res.body;
                        status.should.equals(400);
                        message.should.be.a('string').that.equals('The emailAddress must be a string');
                        done();
                    });
            });
        });
        it('TC 205-3 When the phonenumber does not match the regex, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).put('/api/user/1')
                    .set({ Authorization: validToken })
                    .send({
                        firstName: "firstName",
                        lastName: "last",
                        emailAdress: "rens@lakens.org",
                        password: "Geh3imWachtwoord!",
                        isActive: 1,
                        phoneNumber: "123 456",
                        roles: 'editor',
                        street: "street",
                        city: "city",
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.be.an('object');
                        let { status, message } = res.body;
                        status.should.equals(400);
                        message.should.be.a('string').that.equals('invalid phoneNumber');
                        done();
                    });
            });
        });
        it('TC-205-4 When a user with the provided ID does not exist, a valid error should be returned', (done) => {
            const user = {
                firstName: 'Rens',
                lastName: 'Lakens',
                emailAdress: 'rens@lakens.org',
                password: 'Geh3imWachtwoord!',
                isActive: 1,
                phoneNumber: '0612345678',
                roles: 'editor',
                street: 'Peppelgaarde',
                city: 'Etten-Leur',
            };
            chai
                .request(server)
                .put('/api/user/9999')
                .set({ Authorization: validToken })
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.a('string').that.equals('User with this provided id does not exist');
                    done();
                });
        });
        it('TC 205-5 When the user is not authorized, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).put('/api/user/1')
                    .set({ Authorization: 'Bearer asldfjaslasdfasdf' })
                    .send({
                        firstName: 'Rens',
                        lastName: 'Lakens',
                        emailAdress: 'rens@lakens.org',
                        password: 'Geh3imWachtwoord!',
                        isActive: 1,
                        phoneNumber: '0612345678',
                        roles: 'editor',
                        street: 'Peppelgaarde',
                        city: 'Etten-Leur',
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.be.an('object');
                        let { status, message } = res.body;
                        status.should.equals(401);
                        message.should.be.a('string').that.equals('Not authorized');
                        done();
                    });
            });
        });
        it('TC-205-6 When a user is succesfully updated, a valid response should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).put('/api/user/1')
                    .set({ Authorization: validToken })
                    .send({
                        firstName: 'Test',
                        lastName: 'Test',
                        emailAdress: 'd.ambesi@avans.nl',
                        password: 'Geh3imWachtwoord!',
                        isActive: 1,
                        phoneNumber: '0612345678',
                        roles: 'editor',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                    })
                    .end((err, res) => {
                        res.should.be.an('object');
                        let { status, result } = res.body;
                        status.should.equals(200);
                        done();
                    });
            });
        });
    });
});

describe('UC-206 Deleting user', () => {
    it('TC-206-1 When a user does not exist, a valid error should be returned', (done) => {
        chai
            .request(server)
            .delete('/api/user/9999')
            .set({ Authorization: validToken })
            .end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.equal(400);
                result.should.be.a('string').that.equals('User does not exist');
                done();
            });
    });
    it('TC 206-2 When the user is not authorized, a valid error should be returned', (done) => {
        pool.query(INSERT_USER_1, () => {
            chai.request(server)
                .delete('/api/user/1')
                .set({ Authorization: 'Bearer adsfasdasdfasdf' })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a('string').that.equals('Not authorized');
                    done();
                });
        });
    });
    it('TC 206-3 When the user is not the owner of the account while trying to delete it, a valid error should be returned', (done) => {
        pool.query(INSERT_USER_1, () => {
            chai.request(server)
                .delete('/api/user/1')
                .set({ Authorization: validToken })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(403);
                    message.should.be.a('string').that.equals('You cannot delete an account that is not yours!');
                    done();
                });
        });
    });
    it('TC-206-4 When a user is succesfully deleted, a valid response should be returned', (done) => {
        pool.query(INSERT_USER_1, () => {
            chai.request(server)
                .delete('/api/user/1')
                .set({ Authorization: validToken })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(200);
                    message.should.be.a('string').that.equals('Succesful deletion');
                    done();
                });
        });
    });
});