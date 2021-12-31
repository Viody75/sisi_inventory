const mysql = require('mysql');
const localConnect = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'db_test_lab'
});

localConnect.connect(function (err) {
    if (!!err) {
        console.log(err);
    } else {
        console.log('Connected to localhost!');
    }
});

module.exports = localConnect;