// import mysql2
import mysql from 'mysql2';
import promise from 'mysql2/promise';
// import inquirer 
import inquirer from 'inquirer';
// import console.table
import cTable from 'console.table';


import dotenv from 'dotenv';
dotenv.config();

// connection to database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: 'rawanfatima',
  password:'password',
  database: 'employees'
});


connection.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  afterConnection();
});

// function after connection is established and welcome image shows
const afterConnection = () => {
  console.log("***********************************")
  console.log("*                                 *")
  console.log("*        EMPLOYEE MANAGER         *")
  console.log("*                                 *")
  console.log("***********************************")
  promptUser();
};

// inquirer prompt for first action
const promptUser = () => {
  inquirer.prompt ([
    {
      type: 'list',
      name: 'choices', 
      message: 'What would you like to do?',
      choices: ['View all departments', 
                'View all roles', 
                'View all employees', 
                'Add a department', 
                'Add a role', 
                'Add an employee', 
                'Update an employee role',
                'Update an employee manager',
                "View employees by department",
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View department budgets',
                'No Action']
    }
  ])
    .then((answers) => {
      const { choices } = answers; 

      if (choices === "View all departments") {
        showDepartments();
      }

      if (choices === "View all roles") {
        showRoles();
      }

      if (choices === "View all employees") {
        showEmployees();
      }

      if (choices === "Add a department") {
        addDepartment();
      }

      if (choices === "Add a role") {
        addRole();
      }

      if (choices === "Add an employee") {
        addEmployee();
      }

      if (choices === "Update an employee role") {
        updateEmployee();
      }

      if (choices === "Update an employee manager") {
        updateManager();
      }

      if (choices === "View employees by department") {
        employeeDepartment();
      }

      if (choices === "Delete a department") {
        deleteDepartment();
      }

      if (choices === "Delete a role") {
        deleteRole();
      }

      if (choices === "Delete an employee") {
        deleteEmployee();
      }

      if (choices === "View department budgets") {
        viewBudget();
      }

      if (choices === "No Action") {
        connection.end()
    };
  });
};

// function to show all departments 
const showDepartments = async () => {
  console.log('Showing all departments...\n');
  const sql = `SELECT department.id AS id, department.name AS department FROM department `;

  try {
    const [rows] = await connection.promise().query(sql);
    console.table(rows);
    promptUser();
  } catch (err) {
    console.error(err);
  }
  
};

// function to show all roles 
const showRoles = async() => {
  console.log('Showing all roles...\n');
  const sql = `SELECT role.id, role.title, department.name AS department
               FROM role
               INNER JOIN department ON role.department_id = department.id`;
  try {
    const [rows] = await connection.promise().query(sql);
    
    console.table(rows);
    promptUser();
  } catch (err) {
    console.error(err);
  }
};

// function to show all employees 
const showEmployees = async() => {
  console.log('Showing all employees...\n'); 
  const sql = `SELECT employee.id, 
                      employee.first_name, 
                      employee.last_name, 
                      role.title, 
                      department.name AS department,
                      role.salary, 
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  try {
    const [rows] = await connection.promise().query(sql);
    
    console.table(rows);
    promptUser();
  } catch (err) {
    console.error(err);
  }
};

// function to add a department 
const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'addDept',
      message: "What department do you want to add?",
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
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log('Added ' + answer.addDept + " to departments!"); 

        showDepartments();
      });
    });
};

// function to add a role 
const addRole = () => {
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
        if (!isNaN(addSalary)) {
          return true;
        } else {
          console.log('Please enter a valid salary');
          return false;
        }
      }
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary];

      // Query to fetch departments
      const roleSql = `SELECT name, id FROM department`;

      // Fetch departments using promises
      return connection.promise().query(roleSql)
        .then(([data]) => {
          const dept = data.map(({ name, id }) => ({ name: name, value: id }));

          // Prompt for department choice
          return inquirer.prompt([
            {
              type: 'list',
              name: 'dept',
              message: "What department is this role in?",
              choices: dept
            }
          ])
            .then(deptChoice => {
              const deptId = deptChoice.dept;
              params.push(deptId);

              // Insert role into database
              const sql = `INSERT INTO role (title, salary, department_id)
                           VALUES (?, ?, ?)`;

              return connection.promise().query(sql, params)
                .then(() => {
                  console.log(`Added ${answer.role} to roles!`);

                  // Show updated roles
                  return showRoles();
                });
            });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });
};


// function to add an employee 
const addEmployee = async () => {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: addFirst => {
          if (addFirst) {
            return true;
          } else {
            console.log('Please enter a first name');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLast => {
          if (addLast) {
            return true;
          } else {
            console.log('Please enter a last name');
            return false;
          }
        }
      }
    ]);

    const params = [answer.firstName, answer.lastName];

    // Fetch roles from roles table
    const roleSql = `SELECT role.id, role.title FROM role`;
    const [rows] = await connection.promise().query(roleSql);

    const roles = rows.map(({ id, title }) => ({ name: title, value: id }));

    const roleChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: "What is the employee's role?",
        choices: roles
      }
    ]);

    const role = roleChoice.role;
    params.push(role);

    // Fetch managers from employee table
    const managerSql = `SELECT * FROM employee`;
    const [managersData] = await connection.promise().query(managerSql);

    const managers = managersData.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));

    const managerChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: "Who is the employee's manager?",
        choices: managers
      }
    ]);

    const manager = managerChoice.manager;
    params.push(manager);

    // Insert into employee table
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;
    
    await connection.promise().query(sql, params);
    console.log("Employee has been added!");

    // Show updated employee list
    showEmployees();
  } catch (err) {
    console.error(err);
  }
};

// function to update an employee 
const updateEmployee = async () => {
  try {
    // Fetch employees from employee table
    const employeeSql = `SELECT * FROM employee`;
    const [employeesData] = await connection.promise().query(employeeSql);

    const employees = employeesData.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));

    // Prompt user to select an employee
    const empChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ]);

    const employeeId = empChoice.name;
    const params = [employeeId];

    // Fetch roles from role table
    const roleSql = `SELECT * FROM role`;
    const [rolesData] = await connection.promise().query(roleSql);

    const roles = rolesData.map(({ id, title }) => ({ name: title, value: id }));

    // Prompt user to select a new role for the employee
    const roleChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: "What is the employee's new role?",
        choices: roles
      }
    ]);

    const roleId = roleChoice.role;
    params.push(roleId);

    // Update employee's role in the database
    const updateSql = `UPDATE employee SET role_id = ? WHERE id = ?`;
    await connection.promise().query(updateSql, params);

    console.log("Employee has been updated!");

    // Show updated employee list
    showEmployees();
  } catch (err) {
    console.error(err);
  }
};

// function to update the manager 
const updateManager = async () => {
  try {
    // Fetch employees from employee table
    const employeeSql = `SELECT * FROM employee`;
    const [employeesData] = await connection.promise().query(employeeSql);

    const employees = employeesData.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));

    // Prompt user to select an employee
    const empChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ]);

    const employeeId = empChoice.name;
    const params = [employeeId];

    // Fetch managers from employee table
    const managerSql = `SELECT * FROM employee`;
    const [managersData] = await connection.promise().query(managerSql);

    const managers = managersData.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));

    // Prompt user to select a new manager for the employee
    const managerChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: "Who is the employee's new manager?",
        choices: managers
      }
    ]);

    const managerId = managerChoice.manager;
    params.push(managerId);

    // Update employee's manager in the database
    const updateSql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
    await connection.promise().query(updateSql, params);

    console.log("Employee's manager has been updated!");

    // Show updated employee list
    showEmployees();
  } catch (err) {
    console.error(err);
  }
};

// function to view employee by department
const employeeDepartment = async() => {
  console.log('Showing employee by departments...\n');
  const sql = `SELECT employee.first_name, 
                      employee.last_name, 
                      department.name AS department
               FROM employee 
               LEFT JOIN role ON employee.role_id = role.id 
               LEFT JOIN department ON role.department_id = department.id`;
 try {
    const [rows] = await connection.promise().query(sql);
    console.table(rows);
    promptUser();
  } catch (err) {
    console.error(err);
  }         
};

// function to delete department
const deleteDepartment = async () => {
  try {
    // Fetch departments from department table
    const deptSql = `SELECT * FROM department`;
    const [deptData] = await connection.promise().query(deptSql);

    const departments = deptData.map(({ name, id }) => ({ name, value: id }));

    // Prompt user to select a department to delete
    const deptChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'dept',
        message: "What department do you want to delete?",
        choices: departments
      }
    ]);

    const departmentId = deptChoice.dept;

    // Delete department from the database
    const deleteSql = `DELETE FROM department WHERE id = ?`;
    await connection.promise().query(deleteSql, departmentId);

    console.log("Department successfully deleted!");

    // Show updated list of departments
    showDepartments();
  } catch (err) {
    console.error(err);
  }
};

// function to delete role
const deleteRole = async () => {
  try {
    // Fetch roles from role table
    const roleSql = `SELECT * FROM role`;
    const [roleData] = await connection.promise().query(roleSql);

    const roles = roleData.map(({ title, id }) => ({ name: title, value: id }));

    // Prompt user to select a role to delete
    const roleChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: "What role do you want to delete?",
        choices: roles
      }
    ]);

    const roleId = roleChoice.role;

    // Delete role from the database
    const deleteSql = `DELETE FROM role WHERE id = ?`;
    await connection.promise().query(deleteSql, roleId);

    console.log("Role successfully deleted!");

    // Show updated list of roles
    showRoles();
  } catch (err) {
    console.error(err);
  }
};

// function to delete employees
const deleteEmployee = async () => {
  try {
    // Fetch employees from employee table
    const employeeSql = `SELECT * FROM employee`;
    const [employeeData] = await connection.promise().query(employeeSql);

    const employees = employeeData.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id
    }));

    // Prompt user to select an employee to delete
    const empChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Which employee would you like to delete?",
        choices: employees
      }
    ]);

    const employeeId = empChoice.employee;

    // Delete employee from the database
    const deleteSql = `DELETE FROM employee WHERE id = ?`;
    await connection.promise().query(deleteSql, employeeId);

    console.log("Employee successfully deleted!");

    // Show updated list of employees
    showEmployees();
  } catch (err) {
    console.error(err);
  }
};

// view department budget 
const viewBudget = async() => {
  console.log('Showing budget by department...\n');

  const sql = `SELECT department_id AS id, 
                      department.name AS department,
                      SUM(salary) AS budget
               FROM  role  
               JOIN department ON role.department_id = department.id GROUP BY  department_id`;
  try {
    const [rows] = await connection.promise().query(sql);
    console.table(rows);
    promptUser();
  } catch (err) {
    console.error(err);
  }          
};