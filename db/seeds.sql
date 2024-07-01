-- USE employees;

INSERT INTO department (id, name)
VALUES
    (1, 'G&A'),
    (2, 'Professional Services'),
    (3, 'Marketing'),
    (4, 'HR'),
    (5, 'Sales'),
    (6, 'Engineering'),
    (7, 'Finance'),
    (8, 'Legal');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);



INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 1, NULL),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, NULL),
    ('Kevin', 'Tupik', 4, 3),
    ('Kunal', 'Singh', 5, NULL),
    ('Malia', 'Brown', 6, 5),
    ('Sarah', 'Lourd', 7, NULL),
    ('Tom', 'Allen', 8, 7),
    ('James', 'Fraser', 1, 1),
    ('Jack', 'London', 2, 2),
    ('Robert', 'Bruce', 3, 1),
    ('Arnold', 'Bennett', 4, 3)
    ;