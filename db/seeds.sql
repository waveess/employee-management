INSERT INTO department (name)
VALUES 
('Design'),
('Research'),
('Marketing'),
('IT');

INSERT INTO role (title, salary, department_id)
VALUES
('Design Engineer', 90000, 1),
('Project Manager', 80000, 1),
('Marketing Coordinator', 70000, 3),
('Sales Lead', 70000, 2),
('Financial Analyst', 50000, 3),
('Full Stack Developer', 90000, 4),
('Software Engineer', 90000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Win', 'Schott', 6, null), 
('K.C', 'Cooper', 4, null),
('James', 'Olsen', 2, null),
('David', 'Rose', 4, 1),
('Alexis', 'Rose', 3, 3),
('Johnny', 'Rose', 5, null),
('Felicity', 'Smoak', 7, 3),
('Lena', 'Luthor', 1, null);