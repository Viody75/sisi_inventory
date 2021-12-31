// load the things we need
const express = require('express');
const app = express();

const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const path = require('path');

const booksRouter = require('./routes/books');
const inventoryRouter = require('./routes/inventories');
const indexRouter = require('./routes/index');
const userRouter = require('./routes/home');

app.use(session({
    cookie: { maxAge: 60000 },
    store: new session.MemoryStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}))

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Function to serve all static files
// inside public directory.
app.use(express.static('public'));
app.use('/images', express.static('images'));
// http://localhost:7575/images/ee56a1fd60a2ce90a5c40fd274192963.png
app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/inventories', inventoryRouter);
app.use('/home', userRouter);

app.listen(7575);
console.log('Running on localhost:7575');