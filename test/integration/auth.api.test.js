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

describe('Auth API',() => {

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

    it(`TC-101-1 Verplicht veld ontbreekt`, (done) => {
        chai.request(server).post(`/api/auth/login`).send({
            //"emailAdress": "name@server.nl",
            "password": "secret"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message', 'statusCode')
            res.body.message.should.be.a('string').that.contains('Een verplicht veld ontbreekt')
            done()
        })
    })

    it(`TC-101-2 Niet-valide email adres`, (done) => {
        chai.request(server).post(`/api/auth/login`).send({
            "emailAdress": "fouteemail",
            "password": "secret"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Email Adress is ongeldig')
            done()
        })
    })

    it(`TC-101-3 Niet-valide wachtwoord`, (done) => {
        chai.request(server).post(`/api/auth/login`).send({
            "emailAdress": "name@server.nl",
            "password": "fout"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Wachtwoord is te kort')
            done()
        })
    })

    it(`TC-101-4 Gebruiker bestaat niet`, (done) => {
        chai.request(server).post(`/api/auth/login`).send({
            "emailAdress": "nietbestaand@user.nl",
            "password": "secret"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(404)
            res.body.should.be.an('object').has.all.keys('error')
            res.body.error.should.be.a('string').that.contains('User niet gevonden')
            done()
        })
    })

    it(`TC-101-5 Gebruiker succesvol ingelogd`, (done) => {
        chai.request(server).post(`/api/auth/login`).send({
            "emailAdress": "name@server.nl",
            "password": "secret"
        })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            res.body.should.be.an('object').has.all.keys('statusCode','results')
            res.body.results.should.be.an('object').has.all.keys('id','firstName','lastName','emailAdress','password','token')
            done()
        })
    })

})