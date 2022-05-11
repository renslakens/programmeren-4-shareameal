const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

let insertedUserId = 0;
let insertedTestUserId = 0;

<<<<<<< HEAD
        it('TC-201 When a required input is missing, a valid error should be returned', (done) => {
=======
describe("UC-User", () => {
    describe("UC-201 Registreren als nieuwe gebruiker", () => {
        it("TC-201-1 When a required input is missing, a valid error should be returned", (done) => {
>>>>>>> feature-testing
            chai
                .request(server)
                .post("/api/user")
                .send({
                    // firstName ontbreekt
                    lastName: "Lakens",
                    emailAdress: "rens@lakens.org",
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("firstName must be a string");
                    done();
                });
        });
        it("When an emailAdress is not valid, a valid error should be returned", (done) => {
            chai
                .request(server)
                .post("/api/user")
                .send({
                    firstName: "Rens",
                    lastName: "Lakens",
                    emailAdress: 0,
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("emailAdress must be a string");
                    done();
                });
        });
        it("When a password is not valid, a valid error should be returned", (done) => {
            chai
                .request(server)
                .post("/api/user")
                .send({
                    firstName: "Rens",
                    lastName: "Lakens",
                    emailAdress: "rens@lakens.org",
                    password: "",
                    isActive: "1",
                    phoneNumber: "0612345678",
                    roles: "developer",
                    street: "Peppelgaarde",
                    city: "Etten-Leur",
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("password must be atleast one character long");
                    done();
                });
        });
        it("TC-201-4 When a user already exists with the same email, a valid error should be returned", (done) => {
            const user = {
                firstName: "Rens",
                lastName: "Lakens",
                emailAdress: "testmail3",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "0612345678",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .post("/api/user")
                .send(user)
                .end((err, res) => {
                    insertedTestUserId = res.body.result.userId;
                });
            chai
                .request(server)
                .post("/api/user")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(409);
                    result.should.be.a("string").that.equals("User is niet toegevoegd in database");
                });
            chai
                .request(server)
                .delete(`/api/user/${insertedUserId + 1}`)
                .end(() => {
                    done();
                });
        });
        it("TC-201-5 When a user is succesfully added, a valid response should be returned", (done) => {
            const user = {
                firstName: "Rens",
                lastName: "Lakens",
                emailAdress: "testmail223",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "0612345678",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .post("/api/user")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(201);
                    result.firstName.should.be.a("string").that.equals(user.firstName);
                    insertedUserId = result.userId;
                    done();
                });
        });
    });
    describe("UC-202 Overzicht van gebruikers", () => {});
    describe("UC-203 Gebruikersprofiel opvragen", () => {});
    describe("UC-204 Details van gebruiker", () => {
        it("TC-204-2 When a user whose id does not exist is requested, a valid error should be returned", (done) => {
            chai
                .request(server)
                .get("/api/user/10000")
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(404);
                    result.should.be.a("string").that.equals("User with provided Id does not exist");
                    done();
                });
        });
        it("TC-204-3 When a user whose id does exist is requested, a valid response should be returned", (done) => {
            chai
                .request(server)
                .get("/api/user/3")
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result[0].id.should.equals(3);
                    done();
                });
        });
    });
    describe("UC-205 Gebruiker wijzigen", () => {
        it("TC-205-1 When a required field is missing, a valid error should be returned", (done) => {
            const user = {
                // firstName is missing
                lastName: "Lakens",
                emailAdress: "testmail4",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "0612345678",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .put("/api/user/1")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("firstName must be a string");
                    done();
                });
        });
        it("When a phoneNumber is invalid, a valid error should be returned", (done) => {
            const user = {
                firstName: "Rens",
                lastName: "Lakens",
                emailAdress: "testmail4",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .put("/api/user/1")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.a("string").that.equals("phonenumber must be atleast one character long");
                    done();
                });
        });
        it("TC-205-4 When a user with the provided id does not exist, a valid error should be returned", (done) => {
            const user = {
                firstName: "Rens",
                lastName: "Lakens",
                emailAdress: "testmail4",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "29387420938",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .put("/api/user/100000")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equal(404);
                    result.should.be.a("string").that.equals("User with provided id does not exist");
                    done();
                });
        });
        it("TC-205-6 When a user is succesfully updated, a valid response should be returned", (done) => {
            const user = {
                firstName: "Rens",
                lastName: "Lakens",
                emailAdress: "testmail12345",
                password: "wachtwoord",
                isActive: "1",
                phoneNumber: "123456789",
                roles: "developer",
                street: "Peppelgaarde",
                city: "Etten-Leur",
            };
            chai
                .request(server)
                .put("/api/user/4")
                .send(user)
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.a("string").that.equals("Succusful update!");
                    done();
                });
        });
    });
    describe("UC-206 Gebruiker verwijderen", () => {
        it("TC-206-1 When a user does not exist, a valid error should be returned", (done) => {
            chai
                .request(server)
                .delete("/api/user/100000")
                .end((err, res) => {
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equal(400);
                    result.should.be.a("string").that.equals("User does not exist");
                    done();
                });
        });
        it("TC-206-4 When a user is succesfully deleted, a valid response should be returned", (done) => {
            chai
                .request(server)
                .delete(`/api/user/${insertedUserId}`)
                .end((err, res) => {
                    console.log(insertedTestUserId);
                    res.should.be.an("object");
                    let { status, result } = res.body;
                    status.should.equal(200);
                    result.should.be.a("string").that.equals("Succesful deletion");
                    done();
                });
        });
        it('TC-202 Other test example', (done) => {

        });
    });
});