const mysql = require("mysql2/promise");

class Database {
	constructor() {
		// Connect to database
		this.pool = mysql.createPool({
			host: "localhost",
			user: "root", // MySQL username
			password: "1stmile1234", // MySQL password
			database: "company_db",
			connectionLimit: 10,
			multipleStatements: true,
		});
	}

	async executeQueryAsync(query, params) {
		// Query database
		const results = await this.pool.query(query, params);
		if (!results) throw new Error("Error occurred executing query");
		// Return the query results.
		return results[0];
	}

	async getAllDepartmentsAsync() {
		try {
			return await this.executeQueryAsync("SELECT * FROM department");
		} catch (error) {
			throw new Error(`Error retrieving departments: ${error}`);
		}
	}

	async addDepartmentAsync(departmentName) {
		try {
			await this.executeQueryAsync(
				"INSERT INTO department (name) VALUES (?)",
				departmentName
			);
		} catch (error) {
			throw new Error(`Error adding department: ${error}`);
		}
	}

	async getAllRolesAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT r.id, r.title, d.name AS department, r.salary
					FROM \`role\` r
						JOIN department d ON d.id = r.department_id`
			);
		} catch (error) {
			throw new Error(`Error retrieving roles: ${error}`);
		}
	}

	async addRoleAsync(roleTitle, roleSalary, departmentName) {
		try {
			await this.executeQueryAsync(
				`SET @departmentId = (SELECT id FROM department WHERE name = ?);
				INSERT INTO \`role\` (title, salary, department_id)
				VALUES (?, ?, @departmentId)`,
				[departmentName, roleTitle, roleSalary]
			);
		} catch (error) {
			throw new Error(`Error adding role: ${error}`);
		}
	}

	async getAllEmployeesAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
					FROM employee e
						LEFT JOIN \`role\` r ON r.id = e.role_id
						LEFT JOIN department d ON d.id = r.department_id
						LEFT JOIN employee m ON m.id = e.manager_id`
			);
		} catch (error) {
			throw new Error(`Error retrieving employees: ${error}`);
		}
	}

	async addEmployeeAsync(first, last, roleTitle, managerName) {
		try {
			const managerNames = managerName.trim().split(" ");
			await this.executeQueryAsync(
				`SET @roleId = (SELECT id FROM \`role\` WHERE title = ?);
				SET @managerId = (SELECT id FROM employee WHERE first_name = ? AND last_name = ?);
				INSERT INTO employee (first_name, last_name, role_id, manager_id)
				VALUES (?, ?, @roleId, @managerId)`,
				[roleTitle, managerNames[0], managerNames[1], first, last]
			);
		} catch (error) {
			throw new Error(`Error adding employee: ${error}`);
		}
	}

	async updateEmployeeRoleAsync(employeeName, roleTitle) {
		try {
			const employeeNames = employeeName.trim().split(" ");
			await this.executeQueryAsync(
				`SET @roleId = (SELECT id FROM \`role\` WHERE title = ?);
				UPDATE employee
				SET role_id = @roleId
				WHERE first_name = ? AND last_name = ?`,
				[roleTitle, employeeNames[0], employeeNames[1]]
			);
		} catch (error) {
			throw new Error(`Error updating employee role: ${error}`);
		}
	}

	async updateEmployeeManagerAsync(employeeName, managerName) {
		try {
			const employeeNames = employeeName.trim().split(" ");
			const managerNames = managerName.trim().split(" ");
			await this.executeQueryAsync(
				`SET @managerId = (SELECT id FROM employee WHERE first_name = ? AND last_name = ?);
				UPDATE employee
				SET manager_id = @managerId
				WHERE first_name = ? AND last_name = ?`,
				[managerNames[0], managerNames[1], employeeNames[0], employeeNames[1]]
			);
		} catch (error) {
			throw new Error(`Error updating employee manager: ${error}`);
		}
	}

	async getAllManagersAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT CONCAT(first_name, ' ', last_name) AS name
					FROM employee
					WHERE id IN
						(SELECT DISTINCT manager_id
							FROM employee)`
			);
		} catch (error) {
			throw new Error(`Error retrieving managers: ${error}`);
		}
	}

	async getAllEmployeesByManagerAsync(managerName) {
		try {
			const managerNames = managerName.trim().split(" ");
			return (
				await this.executeQueryAsync(
					`SET @managerId = (SELECT id FROM employee WHERE first_name = ? AND last_name = ?);
					SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
						FROM employee e
							LEFT JOIN \`role\` r ON r.id = e.role_id
							LEFT JOIN department d ON d.id = r.department_id
							LEFT JOIN employee m ON m.id = e.manager_id
						WHERE e.manager_id = @managerId`,
					[managerNames[0], managerNames[1]]
				)
			)[1];
		} catch (error) {
			throw new Error(`Error retrieving employees by manager: ${error}`);
		}
	}

	async getAllEmployeesByDepartmentAsync(departmentName) {
		try {
			return (
				await this.executeQueryAsync(
					`SET @departmentId = (SELECT id FROM department WHERE name = ?);
				SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
					FROM employee e
						LEFT JOIN \`role\` r ON r.id = e.role_id
						LEFT JOIN department d ON d.id = r.department_id
						LEFT JOIN employee m ON m.id = e.manager_id
					WHERE d.id = @departmentId`,
					[departmentName]
				)
			)[1];
		} catch (error) {
			throw new Error(`Error retrieving employees by department: ${error}`);
		}
	}

	async deleteDepartmentAsync(departmentName) {
		try {
			return await this.executeQueryAsync(
				`DELETE
					FROM department
					WHERE name = ?`,
				[departmentName]
			);
		} catch (error) {
			throw new Error(`Error deleting department: ${error}`);
		}
	}

	async deleteRoleAsync(roleTitle) {
		try {
			return await this.executeQueryAsync(
				`DELETE
					FROM \`role\`
					WHERE title = ?`,
				[roleTitle]
			);
		} catch (error) {
			throw new Error(`Error deleting role: ${error}`);
		}
	}

	async deleteEmployeeAsync(employeeName) {
		try {
			const employeeNames = employeeName.trim().split(" ");
			return await this.executeQueryAsync(
				`DELETE
					FROM employee
					WHERE first_name = ? AND last_name = ?`,
				[employeeNames[0], employeeNames[1]]
			);
		} catch (error) {
			throw new Error(`Error deleting employee: ${error}`);
		}
	}
}

module.exports = Database;
