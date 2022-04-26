const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('Login', () => {
    describe('UC-201 Add user /api/user', () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('When a required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    // firstName is missing
                    lastName: 'Lakens',
                    emailAdress: 'rens@lakens.org',
                    password: 'rensL9!'
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equals(400)
                    result.should.be.an('string').that.equals('First Name must be a string')
                    done();
                });
        });
    });
});