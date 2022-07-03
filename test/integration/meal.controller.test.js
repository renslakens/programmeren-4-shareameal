const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const pool = require('../../dbconnection');
const jwt = require('jsonwebtoken')
const { jwtPrivateKey, logger } = require('../../src/config/config');
const { head } = require('../../index');

//Clear database sql
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_USER_TABLE = 'DELETE IGNORE FROM `user`;';

//Insert user sql

const INSERT_MEAL_1 =
    "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `dateTime`, `cookId`) VALUES (1, '0', '0', '0', '1', '6', '10', '343', 'test', 'Test maaltijd', 'noten', '1000-01-01 00:00:00', 2)";

const INSERT_MEAL_2 =
    "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `name`, `description`, `allergenes`, `dateTime`, `cookId`) VALUES (2, '0', '0', '0', '1', '6', '10', '343', 'test 2', 'Test maaltijd 2', 'noten', '1000-01-01 00:00:00', 2)";

const INSERT_USER_1 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "test", "test", "test@server.com", "test", "test", "test");';

const INSERT_MEALS = INSERT_MEAL_1 + INSERT_MEAL_2;
const INSERT_USERS = INSERT_USER_1 + INSERT_USER_2;

const testToken = process.env.JWT_TEST_TOKEN;

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

chai.should();
chai.use(chaiHttp);

describe('UC-Meal', () => {
    describe('UC-301 Add meal', () => {
        afterEach((done) => {
            pool.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            });
        });
        it('TC-301-1 When a required input is missing, a validation error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + testToken)
                .send({
                    //name is missing
                    description: 'A meal description',
                    isActive: true,
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: '2022-06-20T06:30:53.193Z',
                    imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                    allergenes: [],
                    maxAmountOfParticipants: 6,
                    price: 6.5,
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('The name must be a string')
                })
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + testToken)
                .send({
                    //isActive is missing
                    name: 'A meal name',
                    description: 'A meal description',
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: '2022-06-20T06:30',
                    imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                    allergenes: [],
                    maxAmountOfParticipants: 6,
                    price: 6.5,
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('isActive must be a boolean')
                })
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + testToken)
                .send({
                    //maxAmountOfParticipants is missing
                    name: 'A meal name',
                    description: 'A meal description',
                    isActive: true,
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: '2022-05-20T06:30:53.193Z',
                    imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                    allergenes: [],
                    price: 6.5,
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be
                        .a('string')
                        .that.equals('The maxAmountOfParticipants must a number')
                })
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + testToken)
                .send({
                    //dateTime is missing
                    name: 'A meal name',
                    description: 'A meal description',
                    isActive: true,
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: false,
                    imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                    allergenes: [],
                    maxAmountOfParticipants: 6,
                    price: 6.5,
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(400)
                    message.should.be.a('string').that.equals('dateTime must be a string')
                    done()
                })
        })

        it('TC-301-2 When a token is invalid, an authentication error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/meal')
                .set('authorization', 'Bearer ' + ' ')
                .send({
                    name: 'A meal name',
                    description: 'A meal description',
                    isActive: true,
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: false,
                    dateTime: '2022-05-20T06:30:53.193Z',
                    imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                    allergenes: [],
                    maxAmountOfParticipants: 6,
                    price: 6.5,
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(401)
                    message.should.be.a('string').that.equals('Not authorized')
                    done()
                })
        })

        it('TC-301-3 When a token is valid, a meal should be added and returned as result', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .post('/api/meal')
                    .set('authorization', header)
                    .send({
                        name: 'A meal name',
                        description: 'A meal description',
                        isActive: true,
                        isVega: true,
                        isVegan: false,
                        isToTakeHome: false,
                        dateTime: '2022-06-20T06:30',
                        imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                        allergenes: [],
                        maxAmountOfParticipants: 6,
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body
                        status.should.equal(201)
                        result.should.be
                            .an('object')
                            .that.includes.keys('id', 'cookId', 'name', 'dateTime')
                        result.should.include({ cookId: 1 })
                        result.should.include({ name: 'A meal name' })
                        done()
                    })
            })
        })
    })

    describe('UC-302 Update meal /api/meal', () => {
        it('TC-302-1 When a required input (name, price or maxAmountOfParticipants) is missing, a validation error should be returned', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .put('/api/meal/1')
                    .set('authorization', header)
                    .send({
                        //name is missing
                        description: 'A meal description',
                        isActive: true,
                        isVega: true,
                        isVegan: false,
                        isToTakeHome: false,
                        dateTime: '2022-05-20T06:30:53.193Z',
                        imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                        allergenes: [],
                        maxAmountOfParticipants: 6,
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(400)
                        message.should.be.a('string').that.equals('The name must be a string')
                    })
                chai
                    .request(server)
                    .put('/api/meal/1')
                    .set('authorization', header)
                    .send({
                        //price is missing
                        name: 'A meal name',
                        description: 'A meal description',
                        isActive: true,
                        isVega: true,
                        isVegan: false,
                        isToTakeHome: false,
                        dateTime: '2022-05-20T06:30:53.193Z',
                        imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                        allergenes: [],
                        maxAmountOfParticipants: 6,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(400)
                        message.should.be.a('string').that.equals('The price must be a number')
                    })
                chai
                    .request(server)
                    .put('/api/meal/1')
                    .set('authorization', header)
                    .send({
                        //maxAmountOfParticipants is missing
                        name: 'A meal name',
                        description: 'A meal description',
                        isActive: true,
                        isVega: true,
                        isVegan: false,
                        isToTakeHome: false,
                        dateTime: '2022-05-20T06:30:53.193Z',
                        imageUrl: 'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
                        allergenes: [],
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(400)
                        message.should.be
                            .a('string')
                            .that.equals('The maxAmountOfParticipants must a number')
                        done()
                    })
            })
        })

        it("TC 302-2 When the user is not logged in, a valid error should be returned", (done) => {
            pool.query(INSERT_MEAL_1, () => {
                chai.request(server).put('/api/meal/1')
                    .set({ Authorization: "bearer asdfasdf" })
                    .send({
                        name: "test",
                        description: "Testen",
                        isActive: true,
                        isVega: true,
                        isVegan: true,
                        isToTakeHome: true,
                        dateTime: "2022-05-17T14:57:08.748Z",
                        imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                        allergenes: [
                            "noten",
                            "lactose"
                        ],
                        maxAmountOfParticipants: 6,
                        price: 6.75
                    })
                    .end((err, res) => {
                        assert.ifError(err);

                        res.should.have.status(401);
                        res.should.be.an('object');
                        res.body.should.be.an('object').that.has.all.keys('status', 'message');

                        let { status, message } = res.body;
                        status.should.be.a('number').that.equals(401);
                        message.should.be.a('string').that.contains('Not authorized');

                        done();
                    });
            });
        })

        it('TC-302-3 When a user does not own the meal, an authorization error should be returned', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .put('/api/meal/2')
                    .set('authorization', header)
                    .send({
                        name: 'A new meal name',
                        description: 'A new meal description',
                        maxAmountOfParticipants: 6,
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(403)
                        message.should.be
                            .a('string')
                            .that.equals('You are not authorized to alter this meal')
                        done()
                    })
            })
        })

        it('TC-302-4 When a meal does not exist, an error should be returned', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .put('/api/meal/0')
                    .set('authorization', header)
                    .send({
                        name: 'A new meal name',
                        description: 'A new meal description',
                        maxAmountOfParticipants: 6,
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(404)
                        message.should.be.a('string').that.equals('Meal does not exist')
                        done()
                    })
            })
        })

        it('TC-302-5 Meal succesfully updated', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .put('/api/meal/1')
                    .set('authorization', header)
                    .send({
                        name: 'A new meal name',
                        description: 'A new meal description',
                        maxAmountOfParticipants: 6,
                        price: 6.5,
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, result } = res.body
                        status.should.equal(200)
                        result.should.be
                            .an('object')
                            .that.includes.keys('id', 'cookId', 'name', 'dateTime')
                        result.should.include({ cookId: 1, name: 'A new meal name' })
                        done()
                    })
            })
        })
    })

    describe('UC-303 Get all meals /api/meal', () => {
        it('TC-303 Get meals', (done) => {
            chai
                .request(server)
                .get('/api/meal')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equal(200)
                    result.should.be.an('array')
                    result.every((i) =>
                        i.should.include.keys('id', 'name', 'isActive', 'cookId')
                    )
                    done()
                })
        })
    })

    describe('UC-304 Details of a meal /api/meal/:id', () => {
        it('TC-304-1 When an id does not exist, an error should be returned', (done) => {
            chai
                .request(server)
                .get('/api/meal/0')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(404)
                    message.should.be.a('string').that.equals('Meal does not exist')
                    done()
                })
        })

        it("TC 302-4 When the meal does not exist, a valid error should be returned", (done) => {

            chai.request(server).put('/api/meal/112312')
                .set('authorization', 'Bearer ' + testToken)
                .send({
                    name: "test",
                    description: "Testen",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2022-05-17T14:57:08.748Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('Meal does not exist');

                    done();
                })
        })
    })

    describe('UC-305 Delete meal /api/meal/:id', () => {
        it('TC-305-2 When a user is not logged in, an authorization error should be returned', (done) => {
            chai
                .request(server)
                .delete('/api/meal/1')
                //no header
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(401)
                    message.should.be
                        .a('string')
                        .that.equals('Authorization header is missing')
                })
            chai
                .request(server)
                .delete('/api/meal/1')
                // no token
                .set('authorization', 'Bearer ' + ' ')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(401)
                    message.should.be.a('string').that.equals('Not authorized')
                    done()
                })
        })

        it('TC-305-3 When a user is not the owner, an authorization error should be returned', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .delete('/api/meal/2')
                    .set('authorization', header)
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(403)
                        message.should.be
                            .a('string')
                            .that.equals('You are not authorized to delete this meal')
                        done()
                    })
            })
        })

        it('TC-305-4 When a meal does not exist an error should be returned', (done) => {
            chai
                .request(server)
                .delete('/api/meal/0')
                .set('authorization', 'Bearer ' + testToken)
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, message } = res.body
                    status.should.equal(404)
                    message.should.be.a('string').that.equals('Meal does not exist')
                    done()
                })
        })

        it('TC-305-5 Meal succesfully deleted', (done) => {
            createLoginToken(server, { emailAdress: "d.ambesi@avans.nl", password: "Geheimwachtwoord11!" }, done, function(header) {
                chai
                    .request(server)
                    .delete('/api/meal/1')
                    .set('authorization', header)
                    .end((err, res) => {
                        res.should.be.an('object')
                        let { status, message } = res.body
                        status.should.equal(200)
                        message.should.be
                            .a('string')
                            .that.equals('Meal with id 1 was deleted.')
                        done()
                    })
            })
        })
    })

    // describe('UC-401 Add participation for meal /api/meal/:id/participate', () => {
    //     it('TC-401-1 When a user is not logged in, an authorization error should be returned', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/2/participate')
    //             //no header
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(401)
    //                 message.should.be
    //                     .a('string')
    //                     .that.equals('Authorization header missing')
    //             })
    //         chai
    //             .request(server)
    //             .get('/api/meal/2/participate')
    //             // no token
    //             .set('authorization', 'Bearer ' + ' ')
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(401)
    //                 message.should.be.a('string').that.equals('Not authorized')
    //                 done()
    //             })
    //     })

    //     it('TC-401-2 When a meal does not exist an error should be returned', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/0/participate')
    //             .set('authorization', 'Bearer ' + testToken)
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(404)
    //                 message.should.be.a('string').that.equals('Meal does not exist')
    //                 done()
    //             })
    //     })

    //     it('TC-401-3 Participation succesfully added', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/2/participate')
    //             .set('authorization', 'Bearer ' + testToken)
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, result } = res.body
    //                 status.should.equal(200)
    //                 result.should.be
    //                     .an('object')
    //                     .that.includes.keys(
    //                         'currentlyParticipating',
    //                         'currentAmountOfParticipants'
    //                     )
    //                 result.should.include({ currentlyParticipating: true })
    //                 done()
    //             })
    //     })
    // })

    // describe('UC-402 Remove participation from meal /api/meal/:id/participate', () => {
    //     it('TC-402-1 When a user is not logged in, an authorization error should be returned', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/2/participate')
    //             //no header
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(401)
    //                 message.should.be
    //                     .a('string')
    //                     .that.equals('Authorization header missing')
    //             })
    //         chai
    //             .request(server)
    //             .get('/api/meal/2/participate')
    //             // no token
    //             .set('authorization', 'Bearer ' + ' ')
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(401)
    //                 message.should.be.a('string').that.equals('Not authorized')
    //                 done()
    //             })
    //     })

    //     it('TC-402-2 When a meal does not exist an error should be returned', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/0/participate')
    //             .set('authorization', 'Bearer ' + testToken)
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, message } = res.body
    //                 status.should.equal(404)
    //                 message.should.be.a('string').that.equals('Meal does not exist')
    //                 done()
    //             })
    //     })

    //     it('TC-402-3 Participation succesfully removed', (done) => {
    //         chai
    //             .request(server)
    //             .get('/api/meal/3/participate')
    //             .set('authorization', 'Bearer ' + testToken)
    //             .end((err, res) => {
    //                 res.should.be.an('object')
    //                 let { status, result } = res.body
    //                 status.should.equal(200)
    //                 result.should.be
    //                     .an('object')
    //                     .that.includes.keys(
    //                         'currentlyParticipating',
    //                         'currentAmountOfParticipants'
    //                     )
    //                 result.should.include({ currentlyParticipating: false })
    //                 done()
    //             });
    //     });
    // });
});