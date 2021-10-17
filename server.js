const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const dotenv = require('dotenv');
const db = require('./db/database');
const Connection = require('mysql2/typings/mysql/lib/Connection');
require('dotenv').config();

//Connection to DB
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3001',
    //mysql username
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'employee.db'
});

connection.connect(err => {
    if(err) throw err;
    console.log('Connected as id: ' + connection.threadId);
    //welcome image after the sever is started
 afterConnection = () => {
    console.log('********************************************')
    console.log('*                                          *')
    console.log('       Welcome to Employee Manager')
    console.log('*                                          *')
    console.log('********************************************')
    promptUser();
};

})



//user menu
const promptUser = () => {
    //using inquirer to capture user input
    inquirer.prompt([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                "Update an Employee's Role",
                "Update an Employee's Manager",
                'View Employees by Department',
                'Delete a Department',
                'Delete a Role',
                'Delete an Employee',
                'Exit'
            ]
    }
])
    .then((answers) => {
        const { choices } = answers;

        if(choices === 'View All Departments') {
            showDepartments();
        }
        if(choices === 'View All Roles') {
            showRoles();
        }
        if(choices === 'View All Employees') {
            showEmployees();
        }
        if(choices === 'Add a Department') {
            addDepartment();
        }
        if(choices === 'Add a Role') {
            addRole();
        }
        if(choices === 'Add an Employee') {
            addEmployee();
        }
        if(choices === "Update an Employee's Role") {
            updateEmployee();
        }
        if(choices === "Update an Employee's Manager") {
            updateManager();
        }
        if(choices === 'View Employees by Departments') {
            employeeDepartment();
        }
        if(choices === 'Delete a Department') {
            deleteDepartment();
        }
        if(choices === 'Delete a Role') {
            deleteRole();
        }
        if(choices === 'Delete an Employee') {
            deleteEmployee();
        }
        if(choices === 'Exit') {
            connection.end();
        };
    });
};

//showDepartments()
showDepartments = () => {
    console.log('Showing all departments...\n');
    const sql = `SELECT department.id AS department.name AS department FROM department`;

    connection.promise().query(sql, (err, rows) => {
        if(err) throw err;
        console.table(rows);
        promptUser();
    });
};

//showRoles()
showRoles = () => {
    console.log('Showing All Roles...\n');
    const sql = `SELECT role.id, role.title, department.name AS department 
                From role
                INNER JOIN department ON role.department_id = department.id`;

        connection.promise().query(sql, (err, rows) => {
            if(err) throw err;
            console.table(rows);
            promptUser();
        });
};

//showEmployees()
showEmployees = () => {
    console.log('Showing All Employees...\n');
    const sql = `SELECT 
                    employee.id,
                    employee.first_name,
                    employee.last_name,
                    role.title,
                    department.name AS department,
                    role.salary,
                    CONCAT (manager.first_name, " ", manager.last_name) AS manager
                FROM employee
                    LEFT JOIN role ON employee.role_id = role.id,
                    LEFT JOIN department ON role.department_id = department.id,
                    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

         connection.promise().query(sql, (err, rows) => {
            if(err) throw err;
            console.table(rows)
            promptUser();
     });
};

//addDepartment()
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'addDept',
            message: 'What department would you like to add?',
            validate: addDept => {
                if(addDept) {
                    return true;
                } else {
                    console.log('Please enter a department.');
                    return false;
                }
            }
    }
])
    .then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        connection.promise().query(sql, answer.addDept, (err, result) => {
            if(err) throw err;
            console.log('Added ' + answer.addDept + ' to departments');
            showDepartments();
        });
    });
};

//addRole()
addRole = () => {
    inquirer.prompt([
        {
          type: 'input', 
          name: 'role',
          message: "What role do you want to add?",
          validate: addRole => {
            if (addRole) {
                return true;
            } else {
                console.log('Please enter a role');
                return false;
            }
          }
        },
        {
          type: 'input', 
          name: 'salary',
          message: "What is the salary of this role?",
          validate: addSalary => {
            if (isNAN(addSalary)) {
                return true;
            } else {
                console.log('Please enter a salary');
                return false;
            }
          }
        }
      ])
        .then(answer => {
          const params = [answer.role, answer.salary];
    
          // grab dept from department table
          const roleSql = `SELECT name, id FROM department`; 
    
          connection.promise().query(roleSql, (err, data) => {
            if (err) throw err; 
        
            const dept = data.map(({ name, id }) => ({ name: name, value: id }));
    
            inquirer.prompt([
            {
              type: 'list', 
              name: 'dept',
              message: "What department is this role in?",
              choices: dept
            }
            ])
              .then(deptChoice => {
                const dept = deptChoice.dept;
                params.push(dept);
    
                const sql = `INSERT INTO role (title, salary, department_id)
                            VALUES (?, ?, ?)`;
    
                connection.query(sql, params, (err, result) => {
                  if (err) throw err;
                  console.log('Added' + answer.role + " to roles!"); 
    
                  showRoles();
           });
         });
       });
     });
};

addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: addFirst => {
                if(addFirst) {
                    return true;
                } else {
                    console.log('Please enter a first name.');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLast => {
                if(addLast) {
                    return true;
                } else {
                    console.log('Please enter a last name.');
                    return false;
                }
            }
        }

    ])
        .then(answer => {
            const params = [answer.firstName, answer.lastName];

            //grab roles from roles table
            const roleSql = `SELECT role.id, role.title FROM role`;

            connection.promise().query(roleSql, (err, data) => {
                if(err) throw err;
                const roles = data.map(({ id, title }) => ({ name: title, value: id}));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: roles
                    }
                ])
                .then(roleChoice => {
                    const role = roleChoice.role;
                    params.push(role);

                    const managerSql = `SELECT * FROM employee`;
                    connection.promise().query(managerSql, (err, data) => {
                        if(err) throw err;
                        const managers = data.map(({ id, first_name, last_name }) =>({ name: first_name + " " + last_name, value: id}));

                        inquirer.prompt([
                            {
                                type: 'list',
                                name: 'manager',
                                message: "Who is the employee's manager?",
                                choices: managers
                            }
                        ])
                        .then(managerChoice => {
                            const manager = managerChoice.manager;
                            params.push(manager);

                            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                            VALUES (?,?,?,?)`;

                                    connection.query(sql, params, (err, result) => {
                                        if(err) throw err;
                                        console.log("Employee has been added!");
                                        showEmployees();
                                    });
                        });
                    });
                });
            });

        });
};

//updateEmployee()
updateEmployee = () => {
    //get employees from employee table
    const employeeSql = `SELECT * FROM employee`;
    connection.promise().query(employeeSql, (err, data) => {
        if(err) throw error;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which employee would you like to update?",
                choices: employees
            }
        ])
        .then(empChoice => {
            const employee = empChoice.name;
            const params = [];
            params.push(employee);

            const roleSql = `SELECT * FROM role`;

            connection.promise().query(roleSql, (err, data) => {
                if(err) throw err;

                const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's new role?",
                        choices: roles
                    }
                ])
                .then(roleChoice => {
                    const role = roleChoice.role;
                    params.push(role);

                    let employee = params[0];
                    params[0] = role;
                    params[1] = employee;

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    connection.query(sql, params, (err, result) => {
                        if(err) throw err;
                        console.log("Employee has been updated");
                        showEmployees();
                    });
                });
            });
        });
    });
};

//updateManager()
updateManager = ()=>{
    //get employees from employee table
    const employeeSql = `SELECT * FROM employee`;
    connection.promise().query(employeeSql, (err, data) => {
        if(err) throw err;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which employee would you like to update?",
                choices: employees
            }
        ])
        .then(empChoice => {
            const employee = emppChoice.name;
            const params = [];
            params.push(employee);

            const managerSql = `SELECT * FROM employee`;

            connection.promise().query(managerSql, (err, data) => {
                if(err) throw err;
                const managers = data.map(({ id, first_name, last_name}) => ({ name: first_name + " " + last_name, value: id }));
                
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the employee's manager?",
                        choices: managers
                    }
                ])
                .then(managerChoice => {
                    const manager = managerChoice.manager;
                    params.push(manager);

                    let employee = params[0];
                    params[0] = manager;
                    params[1] = employee;

                    const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

                    connection.query(sql, params, (err, result) => {
                        if(err) throw err;
                        console.log('Employee has been updated!');

                        showEmployees();
                    });
                });
            });
        });
    });
};

//employeeDepartment()
employeeDepartment = () => {
    console.log('Showing employee by department...\n');
    const sql = `SELECT 
                 employee.first_name,
                 employee.last_name,
                 department.name AS department
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id`;

        connection.promise().query(sql, (err, rows) => {
            if(err) throw err;
            console.table(rows);
            promptUser();
    });
};

// deleteDepartment()
deleteDepartment = () => {
    const deptSql = `SELECT * FROM department`;
    connection.promise().query(deptSql, (err, data) => {
        if(err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'dept',
                message: 'What department would you like to delete?',
                choices: dept
            }
        ])
        .then(deptChoice => {
            const dept = deptChoice.dept;
            const sql = `DELETE FROM department WHERE id = ?`;

            connection.query(sql, dept, (err, result) => {
                if(err) throw err;
                console.log("Department successfully deleted!");
                showDepartments();
            });
        });
    });
};

//deleteRole()
deleteRole = () => {
    const roleSql = `SELECT * FROM role`;

    connection.promise().query(roleSql, (err, data) => {
        if(err) throw err;

        const role = data.map(({ title, id }) => ({ name: title, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: 'What role would you like to delete?',
                choices: role
            }
        ])
        .then(roleChoice => {
            const role = roleChoice.role;
            const sql = `DELETE FROM role WHERE id = ?`;

            connection.query(sql, role, (err, result) => {
                if(err) throw err;
                console.log("Role successfully deleted!");
                showRoles();
            });
        });
    });
};

//deleteEmployee()
deleteEmployee = () => {
    //get employee from employee table
    const employeeSql = `SELECT * FROM employee`;

    connection.promise().query(employeeSql, (err, data) => {
        if(err) throw err;

        const employees = data.map(({ id, first_name, last_name })=> ({ name: first_name + " " + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Which  employee would you like to delete?',
                choices: employees
            }
        ])
        .then(empChoice => {
            const employee = empChoice.name;

            const sql = `DELETE FROM employee WHERE id = ?`;

            connection.query(sql, employee, (err, result) => {
                if(err) throw err;
                console.log("Employee successfully deleted!");
                showEmployees();
            });
        });
    });
};

//viewBudget()
viewBudget = () => {
    console.log('Showing budget by department...\n');
    const sql = `SELECT department_id AS id,
                 department.name AS department,
                 SUM(salary) AS budget
            FROM role JOIN department ON role.department_id = department.id
            GROUP BY department_id`;

            connection.promise().query(sql, (err, rows) => {
                if(err) throw err;
                console.table(rows);
                promptUser();
            });
};