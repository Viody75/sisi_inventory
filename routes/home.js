const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');
const bcrypt = require('bcryptjs');
const usersFunctions = require('../routes/users');

// display inventory page
router.get('/', function (req, res, next) {

    dbConn.query('SELECT * FROM inventoriesnew ORDER BY id desc', function (err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/inventories/index.ejs
            res.render('pages/home/home', { data: '', email: '', password: '', name: '' });
        } else {
            // render to views/inventories/index.ejs
            res.render('pages/home/home', { data: rows, email: '', password: '', name: '' });
        }
    });

});

// router.post('/register', usersFunctions.signupValidation, usersFunctions.register);

router.post('/register', usersFunctions.signupValidation, function (req, res, next) {
    dbConn.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER(${dbConn.escape(
            req.body.email
        )});`,
        (err, result) => {
            if (result.length) {
                req.flash('error', 'Fail to create account, email already in used');
                //method Get root
                res.redirect('/home');

                return;
                // return res.status(409).send({
                //     msg: 'This user is already in use!'
                // });
            } else {
                // username is available
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {

                        req.flash('error', 'Fail to create account, make sure use valid email');
                        //method Get root
                        res.redirect('/home');

                        return;
                        // return res.status(500).send({
                        //     msg: err
                        // });
                    } else {
                        // has hashed pw => add to database
                        dbConn.query(
                            `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${dbConn.escape(
                                req.body.email
                            )}, ${dbConn.escape(hash)})`,
                            (err, result) => {
                                if (err) {
                                    throw err;
                                    return res.status(400).send({
                                        msg: err
                                    });
                                }
                                req.flash('success', 'Account successfully created');
                                //method Get root
                                res.redirect('/home');
                                return;
                                // return res.status(201).send({
                                //     msg: 'The user has been registerd with us!'
                                // });
                            }
                        );
                    }
                });
            }
        }
    );
});

router.post('/login', usersFunctions.loginValidation, function (req, res, next) {
    dbConn.query(
        `SELECT * FROM users WHERE email = ${dbConn.escape(req.body.email)};`,
        (err, result) => {
            // user does not exists
            if (err) {
                throw err;
                return res.status(400).send({
                    msg: err
                });
            }
            if (!result.length) {
                console.log("Login gagal");
                req.flash('error', 'Fail to login, email or password doesn\'t match!');
                //method Get root
                res.redirect('/home');
                return;
                // return res.status(401).send({
                //     data: `email : ${req.body.email}, pass : ${req.body.password}`,
                //     msg: 'Email or password is incorrect!'
                // });
            }
            // check password
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        throw bErr;
                        console.log("Login gagal");
                        req.flash('error', 'Fail to login, email or password doesn\'t match!');
                        //method Get root
                        res.redirect('/home');
                        return;
                        // return res.status(401).send({
                        //     msg: 'Email or password is incorrect!'
                        // });
                    }
                    if (bResult) {
                        dbConn.query(
                            `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
                        );
                        console.log("Login berhasil");

                        dbConn.query('SELECT * FROM inventoriesnew ORDER BY id desc', function (err, rows) {

                            if (err) {
                                req.flash('error', err);
                                // render to views/inventories/index.ejs
                                return res.render('pages/inventory/inventories', { data: '' });
                            } else {
                                // render to views/inventories/index.ejs
                                return res.render('pages/inventory/inventories', { data: rows });
                            }
                        });

                        // return res.status(200).send({
                        //     msg: 'Logged in!',
                        //     user: result[0]
                        // });
                        return;
                    }
                    console.log("Login gagal");
                    req.flash('error', 'Fail to login, email or password doesn\'t match!');
                    //method Get root
                    res.redirect('/home');
                    return;
                    // return res.status(401).send({
                    //     msg: 'Username or password is incorrect!'
                    // });
                }
            );
        }
    );
});

module.exports = router;