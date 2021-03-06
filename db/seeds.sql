INSERT INTO department (name)
VALUES ("Sales"),
	("Engineering"),
	("Finance"),
	("Legal");

INSERT INTO `role` (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
	("Salesperson", 80000, 1),
	("Lead Engineer", 150000, 2),
    ("Software Engineer", 120000, 2),
    ("Account Manager", 160000, 3),
    ("Accountant", 125000, 3),
    ("Legal Team Lead", 250000, 4),
    ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Stewart", "Churchill", 1, NULL),
	("Una", "Glover", 2, 1),
    ("Julian", "Parr", 3, NULL),
    ("Kevin", "Brown", 4, 3),
    ("Ryan", "Mathis", 5, NULL),
    ("Michael", "Springer", 6, 5),
    ("Phil", "Mitchell", 7, NULL),
    ("Harry", "Pullman", 8, 7);