const chai = require('chai');
const chaiHttp = require('chai-http');
const { it, afterEach } = require('mocha');
const server = require('../../index');
const pool = require('../../dbconnection');
require('dotenv').config();
const assert = require('assert');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, logger } = require('../../src/config/config');

const testToken = process.env.JWT_TEST_TOKEN;
// let testToken = 0;

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(4, "first", "last", "d.ambesi@avans.nl", "Geheimwachtwoord11!", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(5, "test", "test", "test@avans.nl", "Geheimwachtwoord11!", "test", "test");';

const INSERT_USER_3 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(6, "Rens", "Lakens", "asdf@lakens.org", "Geheimwachtwoord11!", "test", "test");';

const INSERT_USERS = INSERT_USER_1 + INSERT_USER_2 + INSERT_USER_3;

// const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'rens@lakens.org';"
// const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'test@avans.nl';"
// const ADD_USER = "INSERT INTO `user`" +
//     "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
//     "VALUES ('Thijmen', 'Vuur', 'Lovensdijkstraat', 'Breda', 'U3lsdkfj!', 'test@avans.nl', '0612345678', 'editor');"

function createLoginToken(server, loginDetails, done) {
    chai.request(server)
        .post('/auth/login')
        .send(loginDetails)
        .end(function(error, response) {
            if (error) {
                throw error;
            }
            let loginToken = response.body.token;
            done(loginToken);
        });
}

describe('UC-User', () => {
    // before((done) => {
    //     testToken = jwt.sign({ id: 1 }, jwtSecretKey);
    //     done();
    // });
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
        it('TC-101-1 When a required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                    emailAdress: "j.doe@server.com",
                    //Password is missing
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.equals('Password must be a string');

                    done();
                });
        });

        it('TC-101-2 When a non-valid email is used, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                    //Email is not a string
                    emailAdress: 9,
                    password: "Geheimwachtwoord11!"
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.equals('Email must be a string');

                    done();
                });
        });

        it('TC-101-3 When a non-valid password is used, a valid error should be returned', (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                    emailAdress: "j.doe@server.com",
                    //Password is not a string
                    password: 9
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.equals('Password must be a string');

                    done();
                });
        });

        it(`TC-101-4 If the user doesn't exist, a valid message should be returned`, (done) => {
            chai.request(server).post('/api/auth/login').auth(testToken, { type: 'bearer' }).send({
                    emailAdress: "thisUserDoesnt@exist.com",
                    password: "Geheimwachtwoord11!"
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.equals('User not found or password invalid');

                    done();
                });
        });

        it('TC 101-5 User successfully logged in', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).post('/api/auth/login').send({
                        emailAdress: "d.ambesi@avans.nl",
                        password: "Geheimwachtwoord11!"
                    })
                    .end((err, res) => {
                        assert.ifError(err);

                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'result');

                        let { status, result } = res.body;
                        status.should.be.a('number');

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

        it('TC-201-1 When a required input is missing, a validation error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //email is missing
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    password: 'Secret11',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('The emailAddress must be a string')
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //first name is missing
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    password: 'Secret11',
                    emailAdress: '2182556@avans.nl',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('The firstname must be a string')
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //last name is missing
                    firstName: 'firstName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    password: 'Secret11',
                    emailAdress: '2182556@avans.nl',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('The lastName must be a string')
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password is missing
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    emailAdress: '2182556@avans.nl',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('The password must a string')
                    done()
                });
        });
        it('TC-201-2 When an invalid email address is submitted, a validation error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    emailAdress: 'email@adress',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    password: 'Secret11',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals('emailAdress is invalid')
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    emailAdress: 'emailadress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    password: 'Secret11',
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals('emailAdress is invalid')
                    done()
                });
        });
        it('TC-201-3 When an invalid password is submitted, a validation error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password too short
                    password: 'Secret1',
                    emailAdress: 'email@adress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals(
                            'password is invalid'
                        )
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password does not contain capital letter
                    password: 'secret11',
                    emailAdress: 'email@adress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals(
                            'password is invalid'
                        )
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password does not contain numerical value
                    password: 'Secretone',
                    emailAdress: 'email@adress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals(
                            'password is invalid'
                        )
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password does not contain lowercase letter
                    password: 'SECRET11',
                    emailAdress: 'email@adress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals(
                            'password is invalid'
                        )
                })
            chai
                .request(server)
                .post('/api/user')
                .send({
                    //password contains line break
                    password: 'Secret1\n1',
                    emailAdress: 'email@adress.com',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    street: 'Lovensdijkstraat 61',
                    city: 'Breda',
                    isActive: 1,
                    phoneNumber: '0612345678',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals(
                            'password is invalid'
                        )
                    done()
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
                        message.should.be.a('string').that.equals('Email is already used');
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

    describe('UC-202 View of users', () => {
        afterEach((done) => {
            logger.debug('afterEach called');
            // Maak testdatabase leeg zodat we testen kunnen uitvoeren
            pool.query(CLEAR_USERS_TABLE, function(err) {
                if (err) throw err
                logger.debug('afterEach done');
                done();
            });
        });
        it('TC-202-1 When all users are requested an empty database should return 0 users', (done) => {
            chai
                .request(server)
                .get('/api/user')
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    let { status, result } = res.body
                    status.should.equal(200)
                    result.should.be.an('array').that.is.empty
                    done()
                })
        })

        it('TC-202-2 When all users are requested a database with 3 users should return 3 users', (done) => {
            pool.query(INSERT_USERS, () => {
                chai
                    .request(server)
                    .get('/api/user')
                    .set('authorization', 'Bearer ' + testToken)
                    .end((err, res) => {
                        let { status, result } = res.body
                        status.should.equal(200)
                        result.should.be.an('array').that.has.a.lengthOf(3)
                        done()
                    })
            });
        });

        it('TC-202-3 When requesting a user by a non-existing name, an empty list should be returned', (done) => {
            chai
                .request(server)
                .get('/api/user?firstName=nonexistent')
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    let { status, result } = res.body
                    status.should.equal(200)
                    result.should.be.an('array').that.is.empty
                    done()
                })
        })

        it('TC-202-4 When requesting users by isActive=false, a list should be returned with users that are not active', (done) => {
            chai
                .request(server)
                .get('/api/user?isActive=false')
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    let { status, result } = res.body
                    status.should.equal(200)
                    result.should.be.an('array')
                    result.every((i) => i.should.include({ isActive: false }))
                    done()
                })
        })

        it('TC-202-5 When requesting users by isActive=true, a list should be returned with users that are active', (done) => {
            chai
                .request(server)
                .get('/api/user?isActive=true')
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    let { status, result } = res.body
                    status.should.equal(200)
                    result.should.be.an('array')
                    result.every((i) => i.should.include({ isActive: true }))
                    done()
                })
        })

        it('TC-202-6 When requesting a user by an existing name, one or more users should be returned', (done) => {
            pool.query(INSERT_USERS, (function(err) {
                if (err) throw err;
                chai
                    .request(server)
                    .get('/api/user?firstName=first')
                    .set('authorization', 'Bearer ' + testToken)
                    .end((err, res) => {
                        let { status, result } = res.body
                        status.should.equal(200)
                        result.should.be.an('array').that.is.not.empty
                        result.every((i) => i.should.include({ firstName: 'first' }))
                        done()
                    });
            }));
        });
    });

    describe('UC-203 Requiring user profile', () => {
        it('TC 203-1 When the token is not valid, a valid error should be returned', (done) => {
            chai.request(server).get('/api/user/profile')
                .set('authorization', 'Bearer ' + ' ')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a('string').that.equals('Not authorized');
                    done();
                });
        });
        it('TC-203-2 Token is valid', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai.request(server).get("/api/user")
                    .set('authorization', 'Bearer ' + testToken)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'result');

                        let { status, result } = res.body;
                        status.should.be.a('number');

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
                .set('authorization', 'Bearer ' + ' ')
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
                .set('authorization', 'Bearer ' + testToken)
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
                chai.request(server).get('/api/user/4')
                    .set('authorization', 'Bearer ' + testToken)
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
                    .set('authorization', 'Bearer ' + testToken)
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
                    .set('authorization', 'Bearer ' + testToken)
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
                .set('authorization', 'Bearer ' + testToken)
                .send(user)
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.a('string').that.equals('User does not exist');
                    done();
                });
        });
        it('TC 205-5 When the user is not authorized, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai
                    .request(server)
                    //wrong user
                    .put('/api/user/1')
                    .set('authorization', 'Bearer ' + ' ')
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(401)
                        message.should.be
                            .a('string')
                            .that.equals('Not authorized')
                        done()
                    })
            });
        });
        it('TC-205-6 When a user is succesfully updated, a valid response should be returned', (done) => {
            pool.query(INSERT_USER_1, () => {
                chai
                    .request(server)
                    .put('/api/user/4')
                    .set('authorization', 'Bearer ' + testToken)
                    .send({
                        emailAdress: 'rens@lakens.org',
                        firstName: 'Rens',
                        lastName: 'Lakens',
                        street: 'Peppelgaarde 59',
                        city: 'Etten-Leur',
                        isActive: 1,
                        password: 'Geheimwachtwoord!11',
                        phoneNumber: '0612345678',
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body
                        status.should.equal(200)
                        result.should.be
                            .an('object')
                            .that.includes.keys('id', 'firstName', 'lastName', 'emailAdress')
                        result.should.include({ id: '4' })
                        result.should.include({ emailAdress: 'rens@lakens.org' })
                        done()
                    });
            });
        });
    });
});

describe('UC-206 Deleting user', () => {
    it('TC 206-2 When the user is not authorized, a valid error should be returned', (done) => {
        createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
            chai.request(server)
                .delete('/api/user/1')
                .set('authorization', header)
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
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(403);
                    message.should.be.a('string').that.equals('You are not authorized to delete this user');
                    done();
                });
        });
    });
    it("TC 206-4 User successfully deleted", (done) => {
        createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
            chai.request(server)
                .delete("/api/user/3")
                .set('authorization', header)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User is successfully deleted');

                    done();
                });
        });
    });
});