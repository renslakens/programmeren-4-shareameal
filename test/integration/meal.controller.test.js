const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config();
const pool = require('../../dbconnection');

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

const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE3NSwiaWF0IjoxNjUzMjUxMjQ4LCJleHAiOjE2NTQyODgwNDh9.NDCU19kiEPQDqizEUUf6-MgPPLOa35t0X1mGJj13bSY'

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
        it('TC 301-1 When required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: validToken })
                .send({
                    //Title is missing
                    description: 'Test maaltijd',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-17T14:57:08.748Z',
                    imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: [
                        'noten',
                        'lactose'
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('The name must be a string');
                    done();
                });
        });

        it('TC 301-2 When the user is not logged in, a valid error should be returned', (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: 'bearer asdfasdf' })
                .send({
                    name: 'test',
                    description: 'test maaltijd',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-17T14:57:08.748Z',
                    imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: [
                        'noten',
                        'lactose'
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
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

        it('TC 301-3 Meal successfully added', (done) => {
            chai.request(server).post('/api/meal')
                .set({ Authorization: validToken })
                .send({
                    name: 'test',
                    description: 'Test maaltijd',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '1000-01-01 00:00:00',
                    imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: [
                        'noten',
                        'lactose'
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(201);
                    done();
                });
        });
    });

    describe('UC-302 Update meal', () => {
        afterEach((done) => {
            pool.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                pool.query(CLEAR_USER_TABLE, () => {
                    if (err) throw err;
                    done();
                })
            })
        });

        it('TC 302-1  When required input is missing, a valid error should be returned', (done) => {
            pool.query(INSERT_MEAL_1, () => {
                chai.request(server).put('/api/meal/1')
                    .set({ Authorization: validToken })
                    .send({
                        //Name is missing
                        description: 'Testen',
                        isActive: true,
                        isVega: true,
                        isVegan: true,
                        isToTakeHome: true,
                        dateTime: '2022-05-17T14:57:08.748Z',
                        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                        allergenes: [
                            'noten',
                            'lactose'
                        ],
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.be.an('object');
                        let { status, message } = res.body;
                        status.should.equals(400);
                        message.should.be.a('string').that.equals('The name must be a string');
                        done();
                    });
            });
        });

        it('TC 302-2 When the user is not logged in, a valid error should be returned', (done) => {
            pool.query(INSERT_MEAL_1, () => {
                chai.request(server).put('/api/meal/1')
                    .set({ Authorization: 'bearer asdfasdf' })
                    .send({
                        name: 'test',
                        description: 'Test maaltijd',
                        isActive: true,
                        isVega: true,
                        isVegan: true,
                        isToTakeHome: true,
                        dateTime: '2022-05-17T14:57:08.748Z',
                        imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                        allergenes: [
                            'noten',
                            'lactose'
                        ],
                        maxAmountOfParticipants: 6,
                        price: 6.75
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

        it('TC-302-3 When the user is not the owner of the meal, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_2, () => {
                pool.query(INSERT_MEAL_1, () => {
                    chai
                        .request(server)
                        .put('/api/meal/1')
                        .set({ Authorization: validToken })
                        .send({
                            name: 'test',
                            description: 'Test maaltijd',
                            isActive: true,
                            isVega: true,
                            isVegan: true,
                            isToTakeHome: true,
                            dateTime: '2022-05-17T14:57:08.748Z',
                            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                            allergenes: [
                                'noten',
                                'lactose'
                            ],
                            maxAmountOfParticipants: 6,
                            price: 6.75
                        })
                        .end((req, res) => {
                            res.should.be.an('object');
                            let { status, message } = res.body;
                            status.should.equals(403);
                            message.should.be.a('string').that.equals('You are not the owner of this meal');
                            done();
                        });
                });
            });
        });

        it('TC 302-4 When the meal does not exist, a valid error should be returned', (done) => {
            chai.request(server).put('/api/meal/112312')
                .set({ Authorization: validToken })
                .send({
                    name: 'test',
                    description: 'Test maaltijd',
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: '2022-05-17T14:57:08.748Z',
                    imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                    allergenes: [
                        'noten',
                        'lactose'
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('Meal does not exist');
                    done();
                });
        });

        it('TC 302-5 Meal successfully updated', (done) => {
            pool.query(INSERT_USER_2, () => {
                pool.query(INSERT_MEAL_1, () => {
                    chai.request(server).put('/api/meal/1')
                        .set({ Authorization: validToken })
                        .send({
                            name: 'test1',
                            description: 'Test maaltijd',
                            isActive: true,
                            isVega: true,
                            isVegan: true,
                            isToTakeHome: true,
                            dateTime: '2022-05-17T14:57:08.748Z',
                            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                            allergenes: [
                                'noten',
                                'lactose'
                            ],
                            maxAmountOfParticipants: 6,
                            price: 6.75
                        })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            let { status, result } = res.body;
                            status.should.equals(200);
                            done();
                        });
                });
            });
        });
    });

    describe('UC-303 Meal list', () => {
        afterEach((done) => {
            pool.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            });
        });
        it('TC 303-1 List of meals should be returned', (done) => {
            pool.query(INSERT_MEAL_1, () => {
                chai.request(server).get('/api/meal')
                    .end((err, res) => {
                        res.should.be.an('object');
                        let { status, result } = res.body;
                        status.should.equals(200);
                        done();
                    });
            });
        });
    });

    describe('UC-304 Meal details', () => {
        afterEach((done) => {
            pool.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                if (err) throw err;
                done();
            });
        });
        it('TC 304-1 When the meal does not exist, a valid error should be returned', (done) => {
            chai.request(server).get('/api/meal/9999')
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('Meal does not exist');
                    done();
                });
        });

        it('TC 304-2 Meal successfully returned', (done) => {
            pool.query(INSERT_USER_2, () => {
                pool.query(INSERT_MEAL_1, () => {
                    chai.request(server).get('/api/meal/1')
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

    describe('UC-305 Delete meal', () => {
        afterEach((done) => {
            pool.query(CLEAR_MEAL_TABLE, (err, result, fields) => {
                pool.query(CLEAR_USER_TABLE, () => {
                    if (err) throw err;
                    done();
                });
            });
        });

        it('TC 305-2 When the user is not logged in, a valid error should be returned', (done) => {
            pool.query(INSERT_MEAL_1, () => {
                chai.request(server).delete('/api/meal/1')
                    .set({ Authorization: 'bearer asdfasdfasdf' })
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

        it('TC-305-3 When the user is not the owner of the meal, a valid error should be returned', (done) => {
            pool.query(INSERT_USER_2, () => {
                pool.query(INSERT_MEAL_1, () => {
                    chai
                        .request(server)
                        .delete('/api/meal/1')
                        .set({ Authorization: validToken })
                        .end((req, res) => {
                            res.should.be.an('object');
                            let { status, message } = res.body;
                            status.should.equals(403);
                            message.should.be.a('string').that.equals('You are not the owner of this meal');
                            done();
                        });
                });
            });
        });

        it('TC 305-4 When the meal does not exist, a valid error should be returned', (done) => {
            chai.request(server).delete('/api/meal/9999')
                .set({ Authorization: validToken })
                .end((err, res) => {
                    res.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('Meal does not exist');
                    done();
                });
        });

        it('TC-305-5 Meal successfully deleted', (done) => {
            pool.query(INSERT_USER_2, () => {
                pool.query(INSERT_MEAL_1, () => {
                    chai
                        .request(server)
                        .delete('/api/meal/1')
                        .set({ Authorization: validToken })
                        .end((req, res) => {
                            res.should.be.an('object');
                            let { status, message } = res.body;
                            status.should.equals(200);
                            message.should.be.a('string').that.contains('Meal successfully deleted');
                            done();
                        });
                });
            });
        });
    });
});