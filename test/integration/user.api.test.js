process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../app')
const assert = require('assert')
require('dotenv').config()
const pool = require('../../src/database/dbconnection')
const jwt = require('jsonwebtoken')
const expect = require('chai').expect

chai.should()
chai.use(chaiHttp)

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USER =
    "INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city, isActive ) VALUES" +
    "(1, 'first', 'last', 'name@server.nl', 'secret', 'street', 'city', '1')," +
    "(2, 'test', 'man', 'test@man.nl', 'secret', 'street', 'city', '0');"

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('User API',() => {

    beforeEach(done => {
        console.log("Before Each")
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err)
            }
            if (connection) {
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    [],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            console.log(err)
                        } else if (rows) {
                            done()
                        }
                    }
                )
            }
        })
    })

    it(`TC-201-1 Verplicht veld ontbreekt`, (done) => {
        chai.request(server).post(`/api/user`).send({
            "firstName": "Gideon",
            //"lastName": "Owoc",
            "street": "Thuis",
            "city": "Thuis",
            "password": "testpassword",
            "emailAdress": "gideon@owoc.nl"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Verplicht veld ontbreekt')
            done()
        })
    })

    it(`TC-201-2 Niet-valide email adres`, (done) => {
        chai.request(server).post(`/api/user`).send({
            "firstName": "Gideon",
            "lastName": "Owoc",
            "street": "Thuis",
            "city": "Thuis",
            "password": "testpassword",
            "emailAdress": "fouteemail"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Email Adress is fout')
            done()
        })
    })

    it(`TC-201-3 Niet-valide wachtwoord`, (done) => {
        chai.request(server).post(`/api/user`).send({
            "firstName": "Gideon",
            "lastName": "Owoc",
            "street": "Thuis",
            "city": "Thuis",
            "password": "fout",
            "emailAdress": "gideon@owoc.nl"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Wachtwoord is te kort')
            done()
        })
    })

    it(`TC-201-4 Gebruiker bestaat al`, (done) => {
        chai.request(server).post(`/api/user`).send({
            "firstName": "Gideon",
            "lastName": "Owoc",
            "street": "Thuis",
            "city": "Thuis",
            "password": "testpassword",
            "emailAdress": "name@server.nl"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(409)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Gebruiker bestaat al')
            done()
        })
    })

    it(`TC-201-5 Gebruiker succesvol geregistreerd`, (done) => {
        chai.request(server).post(`/api/user`).send({
            "firstName": "Gideon",
            "lastName": "Owoc",
            "street": "Thuis",
            "city": "Thuis",
            "password": "testpassword",
            "emailAdress": "gideon@owoc.nl"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(201)
            done()
        })
    })

    it(`TC-202-1 Toon nul gebruikers`, (done) => {
        chai.request(server).get(`/api/user/?limit=0`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            res.body.should.be.an('object').has.all.keys('error')
            res.body.error.should.be.a('string').that.contains('Geen users matchen de zoekopdracht')
            done()
        })
    })

    it(`TC-202-2 Toon twee gebruikers`, (done) => {
        chai.request(server).get(`/api/user/?limit=2`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            result.should.be.an('array').that.has.length(2)
            done()
        })
    })

    it(`TC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam`, (done) => {
        chai.request(server).get(`/api/user/?name=zekernietbestaandenaam`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            res.body.should.be.an('object').has.all.keys('error')
            res.body.error.should.be.a('string').that.contains('Geen users matchen de zoekopdracht')
            done()
        })
    })

    it(`TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false`, (done) => {
        chai.request(server).get(`/api/user/?active=0`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            const item = result[0]
            expect(item.isActive).to.equal(0)
            done()
        })
    })

    it(`TC-202-TC-202-5 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true`, (done) => {
        chai.request(server).get(`/api/user/?active=1`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            const item = result[0]
            expect(item.isActive).to.equal(1)
            done()
        })
    })

    it(`TC-203-1 Ongeldig token`, (done) => {
        chai.request(server).get(`/api/user/profile`)
        .set(
            'authorization',
            'Bearer ' + `heelergfoutetoken`
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(401)
            res.body.should.be.an('object').has.all.keys('error', `datetime`)
            res.body.error.should.be.a('string').that.contains('Not authorized')
            done()
        })
    })

    it(`TC-203-2 Valide token en gebruiker bestaat.`, (done) => {
        chai.request(server).get(`/api/user/profile`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            result[0].firstName.should.contains(`first`)
            done()
        })
    })

    it(`TC-204-1 Ongeldig token`, (done) => {
        chai.request(server).get(`/api/user/1`)
        .set(
            'authorization',
            'Bearer ' + `heelergfoutetoken`
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(401)
            res.body.should.be.an('object').has.all.keys('error', `datetime`)
            res.body.error.should.be.a('string').that.contains('Not authorized')
            done()
        })
    })

    it(`TC-204-2 Gebruiker-ID bestaat niet`, (done) => {
        chai.request(server).get(`/api/user/77564`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(404)
            res.body.should.be.an('object').has.all.keys('error')
            res.body.error.should.be.a('string').that.contains('User bestaat niet')
            done()
        })
    })

    it(`TC-204-3 Gebruiker-ID bestaat`, (done) => {
        chai.request(server).get(`/api/user/2`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            result[0].firstName.should.contains(`test`)
            done()
        })
    })

    it(`TC-205-1 Verplicht veld “emailAdress” ontbreekt`, (done) => {
        chai.request(server).put(`/api/user/1`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            "id": 1,
            "firstName": "first",
            "lastName": "last",
            "isActive": 1,
            //"emailAdress": "name@server.nl",
            "password": "secret",
            "phoneNumber": "-",
            "roles": "editor,guest",
            "street": "street",
            "city": "city"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Verplicht veld ontbreekt')
            done()
        })
    })

    it(`TC-205-3 Niet-valide telefoonnummer`, (done) => {
        chai.request(server).put(`/api/user/1`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            "id": 1,
            "firstName": "first",
            "lastName": "last",
            "isActive": 1,
            "emailAdress": "name@server.nl",
            "password": "secret",
            "phoneNumber": "000",
            "roles": "editor,guest",
            "street": "street",
            "city": "city"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Telefoon Nummer is fout')
            done()
        })
    })

    it(`TC-205-4 Gebruiker bestaat niet`, (done) => {
        chai.request(server).put(`/api/user/98765`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            "id": 98765,
            "firstName": "first",
            "lastName": "last",
            "isActive": 1,
            "emailAdress": "name@server.nl",
            "password": "secret",
            "phoneNumber": "-",
            "roles": "editor,guest",
            "street": "street",
            "city": "city"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Gebruiker bestaat niet')
            done()
        })
    })

    it(`TC-205-5 Niet ingelogd`, (done) => {
        chai.request(server).put(`/api/user/1`).set(
            'authorization',
            'Bearer ' + 'foutetoken'
        ).send({
            "id": 1,
            "firstName": "first",
            "lastName": "last",
            "isActive": 1,
            "emailAdress": "name@server.nl",
            "password": "secret",
            "phoneNumber": "-",
            "roles": "editor,guest",
            "street": "street",
            "city": "city"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(401)
            res.body.should.be.an('object').has.all.keys('error', `datetime`)
            res.body.error.should.be.a('string').that.contains('Not authorized')
            done()
        })
    })

    it(`TC-205-6 Gebruiker succesvol gewijzigd`, (done) => {
        chai.request(server).put(`/api/user/1`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            "id": 1,
            "firstName": "piet",
            "lastName": "last",
            "isActive": 1,
            "emailAdress": "name@server.nl",
            "password": "secret",
            "phoneNumber": "-",
            "roles": "editor,guest",
            "street": "street",
            "city": "city"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            done()
        })
    })

    it(`TC-206-1 Gebruiker bestaat niet`, (done) => {
        chai.request(server).delete(`/api/user/9876`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Gebruiker bestaat niet')
            done()
        })
    })

    it(`TC-206-2 Niet ingelogd`, (done) => {
        chai.request(server).delete(`/api/user/1`)
        .set(
            'authorization',
            'Bearer ' + 'foutetoken'
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(401)
            res.body.should.be.an('object').has.all.keys('error', `datetime`)
            res.body.error.should.be.a('string').that.contains('Not authorized')
            done()
        })
    })

    it(`TC-206-3 Actor is geen eigenaar`, (done) => {
        chai.request(server).delete(`/api/user/2`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(403)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Gebruiker is niet de eigenaar')
            done()
        })
    })

    it(`TC-206-4 Gebruiker succesvol verwijderd`, (done) => {
        chai.request(server).delete(`/api/user/2`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 2}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            done()
        })
    })

})