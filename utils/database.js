const mysql = require("mysql2/promise");

class Database {
	constructor() {
		// Connect to database
		this.pool = mysql.createPool({
			host: "localhost",
			user: "root", // MySQL username
			password: "", // MySQL password
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

	async getAllEmployeesAsync() {
		try {
			return await this.executeQueryAsync(
				`SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
					FROM employee e
						JOIN \`role\` r ON r.id = e.role_id
						JOIN department d ON d.id = r.department_id
						LEFT JOIN employee m ON m.id = e.manager_id`
			);
		} catch (error) {
			throw new Error(`Error retrieving employees: ${error}`);
		}
	}
}

module.exports = Database;
