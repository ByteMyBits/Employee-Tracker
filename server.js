const mysql = require('mysql2');
const inquirer = require('inquirer');
// const table = require("console.table");

const connection = mysql.createConnection({

    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_trackerDB',
});

const getEmployees = () => {
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    getEmployees();
});
