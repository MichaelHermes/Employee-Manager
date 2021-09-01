const mysql = require("mysql2/promise");

class Database {
	constructor() {
		// Connect to database
		this.pool = mysql.createPool({
			host: "localhost",
			user: "root", // MySQL username
			password: process.env.MYSQL, // MySQL password
			database: "company_db",
			connectionLimit: 10,
			multipleStatements: true,
		});
	}

	/**
	 * Executes a prepared statement SQL query.
	 * @param {string} query A SQL query to execute.
	 * @param {any} params Parameters for the SQL query.
	 * @returns The SQL query results.
	 */
	async executeQueryAsync(query, params) {
		// Query database
		const results = await this.pool.query(query, params);
		if (!results) throw new Error("Error occurred executing query");
		// Return the query results.
		return results[0];
	}

	/**
	 * Retrieves all departments.
	 * @returns The SQL query results.
	 */
	async getAllDepartmentsAsync() {
		try {
			return await this.executeQueryAsync(
				"SELECT id, name AS department FROM department"
			);
		} catch (error) {
			throw new Error(`Error retrieving departments: ${error}`);
		}
	}

	/**
	 * Adds a new department to the database.
	 * @param {string} departmentName The department name to add.
	 */
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

	/**
	 * Retrieves all roles.
	 * @returns The SQL query results.
	 */
	async getAllRolesAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT r.id, r.title AS role, d.name AS department, r.salary
					FROM \`role\` r
						JOIN department d ON d.id = r.department_id`
			);
		} catch (error) {
			throw new Error(`Error retrieving roles: ${error}`);
		}
	}

	/**
	 * Adds a new role to the database.
	 * @param {string} roleTitle
	 * @param {number} roleSalary
	 * @param {string} departmentName
	 */
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

	/**
	 * Retrieves all employees.
	 * @returns The SQL query results.
	 */
	async getAllEmployeesAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT e.id, e.first_name, e.last_name, COALESCE(r.title, '-') AS role, COALESCE(d.name, '-') AS department, COALESCE(r.salary, '-') AS salary, COALESCE(CONCAT(m.first_name, ' ', m.last_name), '-') AS manager
					FROM employee e
						LEFT JOIN \`role\` r ON r.id = e.role_id
						LEFT JOIN department d ON d.id = r.department_id
						LEFT JOIN employee m ON m.id = e.manager_id`
			);
		} catch (error) {
			throw new Error(`Error retrieving employees: ${error}`);
		}
	}

	/**
	 * Adds a new employee to the database.
	 * @param {string} first Employee first name.
	 * @param {string} last Employee last name.
	 * @param {string} roleTitle Role title.
	 * @param {string} managerName Manager name.
	 */
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

	/**
	 * Updates an employee's role in the database.
	 * @param {string} employeeName Employee name.
	 * @param {string} roleTitle Role title.
	 */
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

	/**
	 * Updates an employee's manager in the database.
	 * @param {string} employeeName Employee name.
	 * @param {string} managerName Manager name.
	 */
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

	/**
	 * Retrieves all employees who are currently managers.
	 * @returns The SQL query results.
	 */
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

	/**
	 * Retrieves all employees under the given manager.
	 * @param {string} managerName Manager name.
	 * @returns The SQL query results.
	 */
	async getAllEmployeesByManagerAsync(managerName) {
		try {
			const managerNames = managerName.trim().split(" ");
			return (
				await this.executeQueryAsync(
					`SET @managerId = (SELECT id FROM employee WHERE first_name = ? AND last_name = ?);
					SELECT e.id, e.first_name, e.last_name, COALESCE(r.title, '-') AS role, COALESCE(d.name, '-') AS department, COALESCE(r.salary, '-') AS salary, COALESCE(CONCAT(m.first_name, ' ', m.last_name), '-') AS manager
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

	/**
	 * Retrieves all employees under the given department.
	 * @param {string} departmentName Department name.
	 * @returns The SQL query results.
	 */
	async getAllEmployeesByDepartmentAsync(departmentName) {
		try {
			return (
				await this.executeQueryAsync(
					`SET @departmentId = (SELECT id FROM department WHERE name = ?);
					SELECT e.id, e.first_name, e.last_name, COALESCE(r.title, '-') AS role, COALESCE(d.name, '-') AS department, COALESCE(r.salary, '-') AS salary, COALESCE(CONCAT(m.first_name, ' ', m.last_name), '-') AS manager
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

	/**
	 * Deletes the department from the database. Cascade deletes any associated Roles.
	 * @param {string} departmentName Department name.
	 */
	async deleteDepartmentAsync(departmentName) {
		try {
			await this.executeQueryAsync(
				`DELETE
					FROM department
					WHERE name = ?`,
				[departmentName]
			);
		} catch (error) {
			throw new Error(`Error deleting department: ${error}`);
		}
	}

	/**
	 * Deletes the role from the database.
	 * @param {string} roleTitle Role title.
	 */
	async deleteRoleAsync(roleTitle) {
		try {
			await this.executeQueryAsync(
				`DELETE
					FROM \`role\`
					WHERE title = ?`,
				[roleTitle]
			);
		} catch (error) {
			throw new Error(`Error deleting role: ${error}`);
		}
	}

	/**
	 * Deletes the employee from the database.
	 * @param {string} employeeName Employee name.
	 */
	async deleteEmployeeAsync(employeeName) {
		try {
			const employeeNames = employeeName.trim().split(" ");
			await this.executeQueryAsync(
				`DELETE
					FROM employee
					WHERE first_name = ? AND last_name = ?`,
				[employeeNames[0], employeeNames[1]]
			);
		} catch (error) {
			throw new Error(`Error deleting employee: ${error}`);
		}
	}

	/**
	 * Calculates the total departmental utilized budget.
	 * @returns The SQL query results.
	 */
	async getDepartmentUtilizedBudgetsAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT d.name AS department, SUM(r.salary) AS utilized_budget
				FROM employee e
					JOIN \`role\` r ON r.id = e.role_id
					JOIN department d ON d.id = r.department_id
				GROUP BY d.name
				ORDER BY SUM(r.salary) DESC`
			);
		} catch (error) {
			throw new Error(`Error calculating department budgets: ${error}`);
		}
	}
}

module.exports = Database;
