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

        if(choices === 'View all departments') {
            showDepartments();
        }
        if(choices === 'View all roles') {
            showRoles();
        }
        if(choices === 'View all employees') {
            showEmployees();
        }
        if(choices === 'Add a department') {
            addDepartment();
        }
        if(choices === 'Add a role') {
            addRole();
        }
        if(choices === 'Add an employee') {
            addEmployee();
        }
        if(choices === 'Update an employee role') {
            updateEmployee();
        }
        if(choices === 'Update an employee manager') {
            updateManager();
        }
        if(choices === 'View employees by departments') {
            employeeDepartment();
        }
        if(choices === 'Delete a department') {
            deleteDepartment();
        }
        if(choices === 'Delete a role') {
            deleteRole();
        }
        if(choices === 'Delete an employee') {
            deleteEmployee();
        }
        if(choices === 'View Department budgets') {
            viewBudget();
        }
        if(choices === 'No action') {
            db.end();
        };
    });
};