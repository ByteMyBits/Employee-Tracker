const mysql = require('mysql2');
const inquirer = require('inquirer');
const table = require("console.table");
const util = require('util');
const { connect } = require('http2');

const connection = mysql.createConnection({

    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'employee_trackerDB',
});

// const query = util.promisify(connection.query).bind(connection);

console.log(
    ` _______  __   __  _______  ___      _______  __   __  _______  _______    _______  ______    _______  _______  ___   _  _______  ______   
|       ||  |_|  ||       ||   |    |       ||  | |  ||       ||       |  |       ||    _ |  |   _   ||       ||   | | ||       ||    _ |  
|    ___||       ||    _  ||   |    |   _   ||  |_|  ||    ___||    ___|  |_     _||   | ||  |  |_|  ||       ||   |_| ||    ___||   | ||  
|   |___ |       ||   |_| ||   |    |  | |  ||       ||   |___ |   |___     |   |  |   |_||_ |       ||       ||      _||   |___ |   |_||_ 
|    ___||       ||    ___||   |___ |  |_|  ||_     _||    ___||    ___|    |   |  |    __  ||       ||      _||     |_ |    ___||    __  |
|   |___ | ||_|| ||   |    |       ||       |  |   |  |   |___ |   |___     |   |  |   |  | ||   _   ||     |_ |    _  ||   |___ |   |  | |
|_______||_|   |_||___|    |_______||_______|  |___|  |_______||_______|    |___|  |___|  |_||__| |__||_______||___| |_||_______||___|  |_|
` + "\n"
);

connection.connect((err) => {
    if (err) throw err;
    prompt();
});

function prompt() {

    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "selection",
                choices: [
                    "View all employees",
                    "Update employee role",
                    "Add new employee",
                    "Remove employee",
                    "View all departments",
                    "Add new department",
                    "View all roles",
                    "Add new role",
                    "Exit"
                ]
            }
        ])

        .then(answers => {

            //how to get index from choices array?
            switch (answers.selection) {

                case "View all employees": viewAllEmployees();
                    break;

                case "Update employee role": updateEmployeeRole();
                    break;

                case "Add new employee": addNewEmployee();
                    break;

                case "Remove employee": removeEmployee();
                    break;

                case "View all departments": viewAllDepartments();
                    break;

                case "Add new department": addNewDepartment();
                    break;

                case "View all roles": viewAllRoles();
                    break;

                case "Add new role": addNewRole();
                    break;

                case "Exit": exit();
                    break;
            }
        });
};

function viewAllEmployees() {

    let query = `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role
        ON employee.role_id = role.id
        LEFT JOIN department
        ON department.id = role.department_id
        LEFT JOIN employee manager
        ON manager.id = employee.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        employeeInfo = res;
        console.table(employeeInfo);
        prompt();
    });
}

function updateEmployeeRole() {

    let query = `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
        FROM employee
        LEFT JOIN role
        ON employee.role_id = role.id
        LEFT JOIN department
        ON department.id = role.department_id
        LEFT JOIN employee manager
        ON manager.id = employee.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let employee = res.map(function (obj) {
            return `Name: ${obj.name} ID: ${obj.id}`;
        });

        selectRole(employee);
    });

}

function selectRole(employee) {

    let query = `SELECT role.id, role.title, role.salary FROM role`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let role = res.map(function (obj) {
            return `Role: ${obj.title} Salary: ${obj.salary} ID: ${obj.id}`;
        });

        changeEmployeeRole(employee, role);
    });
}

function changeEmployeeRole(employee, role) {

    inquirer
        .prompt([
            {
                type: "list",
                message: "Select the employee whose role you wish to update:",
                name: "employeeSelect",
                choices: employee
            },
            {
                type: "list",
                message: "Select the new role to apply:",
                name: "roleSelect",
                choices: role
            }
        ])

        .then(answers => {

            // this seems a bit clunky, is there a better way?
            let chosenRole = answers.roleSelect.replace(/^([^:]+\:){3}/, '').trim();
            let chosenEmployee = answers.employeeSelect.replace(/^([^:]+\:){2}/, '').trim();

            console.log(chosenRole);
            console.log(chosenEmployee);

            let query = `UPDATE employee SET role_id = ? WHERE id = ?`;
            connection.query(query, [chosenRole, chosenEmployee], (err, res) => {
                if (err) throw err;
                prompt();
            });
        });

}

function addNewEmployee() {

    let query = `SELECT role.id, role.title, role.salary FROM role`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        let role = res.map(function (obj) {
            return `Role: ${obj.title} Salary: ${obj.salary} ID: ${obj.id}`;
        });

        newEmployeeWithRole(role);
    });
}

function newEmployeeWithRole(role) {

    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name:"
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name:"
            },
            {
                type: "list",
                name: "roleSelect",
                message: "Select the employee's role:",
                choices: role
            }
        ])

        .then((answers) => {

            let chosenRole = answers.roleSelect.replace(/^([^:]+\:){3}/, '').trim();

            let query = `INSERT INTO employee SET ?`
            connection.query(query, {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: chosenRole
            }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function removeEmployee() {

    let query = `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
    ON employee.role_id = role.id
    LEFT JOIN department
    ON department.id = role.department_id
    LEFT JOIN employee manager
    ON manager.id = employee.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        let employee = res.map(function (obj) {
            return `Name: ${obj.name} ID: ${obj.id}`;
        });

        removeSelectedEmployee(employee);
    });

}

function removeSelectedEmployee(employee) {

    inquirer
        .prompt([
            {
                type: "list",
                name: "employeeSelect",
                message: "Select the employee you wish to remove:",
                choices: employee
            }
        ])

        .then((answers) => {

            let chosenEmployee = answers.employeeSelect.replace(/^([^:]+\:){2}/, '').trim();
            let query = `DELETE FROM employee WHERE ?`;
            connection.query(query, { id: chosenEmployee }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function viewAllDepartments() {

    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });

}

function addNewDepartment() {

    inquirer
        .prompt([
            {
                type: "input",
                name: "departmentName",
                message: "Enter the name of the new department:",
            }
        ])

        .then((answers) => {

            connection.query("INSERT INTO department SET ?", { name: answers.departmentName }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function viewAllRoles() {

    connection.query("SELECT * FROM role", (err, res) => {
        if (err) throw err;
        console.table(res)
        prompt();
    });

}


function addNewRole() {

    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;
        addRoleDetails(res);
    });

}

function addRoleDetails(departments) {

    inquirer
        .prompt([
            {
                type: "input",
                name: "roleName",
                message: "Enter the title of the new role:",
            },
            {
                type: "number",
                name: "roleSalary",
                message: "Enter the salary for this role:"
            },
            {
                type: "list",
                name: "departmentID",
                message: "Select the department for this role:",
                choices() {
                    return departments.map(({ id, name }) => {
                        return {
                            name: name, value: id
                        };
                    });
                }
            }
        ])

        .then((answers) => {

            // console.log(answers.departmentID);

            connection.query("INSERT INTO role SET ?", {

                title: answers.roleName,
                salary: answers.roleSalary,
                department_id: answers.departmentID

            }, (err, res) => {
                if (err) throw err;
                prompt();
            });
        });
}

function exit() {

    connection.end();

}


/*  attempting to get async to work */