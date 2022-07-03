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

describe('Meal API',() => {

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

    it(`TC-301-1 Verplicht veld ontbreekt`, (done) => {
        chai.request(server).post(`/api/meal`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            //"name": "allergenesmaaltijd",
            "description": "Dé pastaklassieker bij uitstek.",
            "isActive": true,
            "isVega": true,
            "isVegan": true,
            "isToTakeHome": true,
            "dateTime": "2022-06-30T11:41:08.879Z",
            "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            "allergenes": [
              "gluten",
              "noten",
              "lactose"
            ],
            "maxAmountOfParticipants": 6,
            "price": 6.75
          })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(400)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Verplicht veld ontbreekt')
            done()
        })
    })

    it(`TC-301-2 Niet ingelogd`, (done) => {
        chai.request(server).post(`/api/meal`).set(
            'authorization',
            'Bearer ' + 'neptoken'
        ).send({
            "name": "allergenesmaaltijd",
            "description": "Dé pastaklassieker bij uitstek.",
            "isActive": true,
            "isVega": true,
            "isVegan": true,
            "isToTakeHome": true,
            "dateTime": "2022-06-30T11:41:08.879Z",
            "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            "allergenes": [
              "gluten",
              "noten",
              "lactose"
            ],
            "maxAmountOfParticipants": 6,
            "price": 6.75
          })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(401)
            res.body.should.be.an('object').has.all.keys('error', `datetime`)
            res.body.error.should.be.a('string').that.contains('Not authorized')
            done()
        })
    })

    it(`TC-301-3 Maaltijd succesvol toegevoegd`, (done) => {
        chai.request(server).post(`/api/meal`).set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        ).send({
            "name": "allergenesmaaltijd",
            "description": "Dé pastaklassieker bij uitstek.",
            "isActive": true,
            "isVega": true,
            "isVegan": true,
            "isToTakeHome": true,
            "dateTime": "2022-06-30T11:41:08.879",
            "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            "allergenes": [
              "gluten",
              "noten",
              "lactose"
            ],
            "maxAmountOfParticipants": 6,
            "price": 6.75
          })
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            done()
        })
    })

    it(`TC-303-1 Lijst van maaltijden geretourneerd`, (done) => {
        chai.request(server).get(`/api/meal`)
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            const result = res.body
            expect(result).to.have.lengthOf.above(0)
            done()
        })
    })

    it(`TC-304-1 Maaltijd bestaat niet`, (done) => {
        chai.request(server).get(`/api/meal/77564`)
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(404)
            res.body.should.be.an('object').has.all.keys('error')
            res.body.error.should.be.a('string').that.contains('meal bestaat niet')
            done()
        })
    })

    it(`TC-304-2 Details van maaltijd geretourneerd`, (done) => {
        chai.request(server).get(`/api/meal/1`)
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            done()
        })
    })

    it(`TC-305-2 Niet ingelogd`, (done) => {
        chai.request(server).delete(`/api/meal/1`)
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

    it(`TC-305-3 Niet de eigenaar van de data`, (done) => {
        chai.request(server).delete(`/api/meal/1`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 2}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(403)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Gebruiker is niet de eigenaar')
            done()
        })
    })

    it(`TC-305-4 Maaltijd bestaat niet`, (done) => {
        chai.request(server).delete(`/api/meal/9876`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(404)
            res.body.should.be.an('object').has.all.keys('message')
            res.body.message.should.be.a('string').that.contains('Meal bestaat niet')
            done()
        })
    })

    it(`TC-305-5 Maaltijd succesvol verwijderd`, (done) => {
        chai.request(server).delete(`/api/meal/1`)
        .set(
            'authorization',
            'Bearer ' + jwt.sign({userId: 1}, process.env.JWT_SECRET)
        )
        .end((err,res) => {
            assert.ifError(err)
            res.should.have.status(200)
            done()
        })
    })



})