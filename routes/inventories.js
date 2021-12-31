const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

const fs = require('fs');
const {
    getValidExtension,
    randomFilename,
    saveImage
} = require('../middlewares/uploader');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// display inventory page
router.get('/', function (req, res, next) {

    dbConn.query('SELECT * FROM inventoriesnew ORDER BY id desc', function (err, rows) {

        if (err) {
            req.flash('error', err);
            // render to views/inventories/index.ejs
            res.render('pages/inventory/inventories', { data: '' });
        } else {
            // render to views/inventories/index.ejs
            res.render('pages/inventory/inventories', { data: rows });
        }
    });
});

// display add inventory page
router.get('/add', function (req, res, next) {
    // render to add.ejs
    res.render('pages/inventory/add', {
        userId: '',
        name: '',
        qty: '',
        file: null
    })
})

// add a new book
router.post('/add', upload.single('img'), async (req, res) => {

    let userId = req.body.userId;
    let name = req.body.name;
    let qty = req.body.qty;
    let errors = false;

    if (userId.length === 0 || name.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter the data properly");
        // render to add.ejs with flash message
        res.render('pages/inventory/add', {
            userId: userId,
            name: name,
            qty: qty
        })
    } else {
        // if no error
        try {
            if (!errors) {

                if (!req.file) {
                    console.log(req.file.path);
                    res.status(422).json({ message: `File tidak ditemukan.` });
                }

                const extension = getValidExtension(req.file.originalname);
                if (!extension) {
                    fs.unlinkSync(req.file.path);
                    res.status(422).json({ message: `Format file tidak valid.` });
                }

                const filename = randomFilename(16);
                const pathFrom = req.file.path;
                const pathTo = `public/images/${filename}.${extension}`;
                const pathToBeSaved = `images/${filename}.${extension}`;
                saveImage(pathFrom, pathTo);

                var form_data = {
                    user_id: userId,
                    inv_name: name,
                    inv_qty: qty,
                    inv_img_url: pathToBeSaved
                }

                // insert query
                dbConn.query('INSERT INTO inventoriesnew SET ?', form_data, function (err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)

                        // render to add.ejs
                        res.render('pages/inventory/add', {
                            userId: form_data.user_id,
                            name: form_data.inv_name,
                            qty: form_data.inv_qty,
                            file: pathFrom
                        })
                    } else {
                        req.flash('success', 'Book successfully added');
                        //method Get root
                        res.redirect('/inventories');
                    }
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
})

// display edit inventory page
router.get('/edit/(:id)', function (req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM inventoriesnew WHERE id = ' + id, function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Inventory not found with id = ' + id)
            res.redirect('/inventories')
        }
        // if book found
        else {
            // render to inventory.ejs
            res.render('pages/inventory/edit', {
                title: 'Edit Inventory',
                id: rows[0].id,
                userId: rows[0].user_id,
                name: rows[0].inv_name,
                qty: rows[0].inv_qty,
                file: rows[0].inv_img_url
            })
        }
    })
})

// update inventory data
router.post('/update/:id', upload.single('img'), async (req, res) => {

    let id = req.params.id;
    let userId = req.body.userId;
    let name = req.body.name;
    let qty = req.body.qty;
    let errors = false;

    if (userId.length === 0 || name.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter the data properly");
        // render to add.ejs with flash message
        res.render('pages/inventory/edit', {
            id: id,
            userId: userId,
            name: name,
            qty: qty,
            file: null
        })
    } else {
        // if no error
        try {
            if (!errors) {

                if (!req.file) {
                    console.log("File not exist");
                    var form_data = {
                        user_id: userId,
                        inv_name: name,
                        inv_qty: qty
                    }
                    // insert query
                    dbConn.query('UPDATE inventoriesnew SET ? WHERE id = ' + id, form_data, function (err, result) {
                        //if(err) throw err
                        if (err) {
                            req.flash('error', err)

                            // render to add.ejs
                            res.render('pages/inventory/edit', {
                                id: req.params.id,
                                userId: form_data.user_id,
                                name: form_data.inv_name,
                                qty: form_data.inv_qty,
                                file: null
                            })
                        } else {
                            req.flash('success', 'Inventory successfully updated');
                            //method Get root
                            res.redirect('/inventories');
                        }
                    })
                } else {
                    const extension = getValidExtension(req.file.originalname);
                    if (!extension) {
                        fs.unlinkSync(req.file.path);
                        res.status(422).json({ message: `Format file tidak valid.` });
                    }

                    const filename = randomFilename(16);
                    const pathFrom = req.file.path;
                    const pathTo = `public/images/${filename}.${extension}`;
                    const pathToBeSaved = `images/${filename}.${extension}`;
                    saveImage(pathFrom, pathTo);

                    var form_data = {
                        user_id: userId,
                        inv_name: name,
                        inv_qty: qty,
                        inv_img_url: pathToBeSaved
                    }

                    // insert query
                    dbConn.query('UPDATE inventoriesnew SET ? WHERE id = ' + id, form_data, function (err, result) {
                        //if(err) throw err
                        if (err) {
                            req.flash('error', err)

                            // render to add.ejs
                            res.render('pages/inventory/edit', {
                                id: req.params.id,
                                userId: form_data.user_id,
                                name: form_data.inv_name,
                                qty: form_data.inv_qty,
                                file: pathFrom
                            })
                        } else {
                            req.flash('success', 'Book successfully added');
                            //method Get root
                            res.redirect('/inventories');
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
})

// delete book
router.get('/delete/(:id)', function (req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM inventoriesnew WHERE id = ' + id, function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to books page
            res.redirect('/inventories')
        } else {
            // set flash message
            req.flash('success', 'Inventory successfully deleted! ID = ' + id)
            // redirect to books page
            res.redirect('/inventories')
        }
    })
})

module.exports = router;