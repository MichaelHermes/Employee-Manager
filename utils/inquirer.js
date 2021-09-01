const inquirer = require("inquirer");
const Database = require("./database");

class Inquirer {
	constructor() {
		// An enumeration to hold all of the actions available to the user in the main menu.
		this._actions = {
			VIEWDEPARTMENTS: "View All Departments",
			VIEWROLES: "View All Roles",
			VIEWEMPLOYEES: "View All Employees",
			VIEWEMPLOYEESBYMANAGER: "View All Employees By Manager",
			VIEWEMPLOYEESBYDEPARTMENT: "View All Employees By Department",
			VIEWUTILIZEDBUDGET: "View Utilized Budget Summary",
			ADDDEPARTMENT: "Add Department",
			ADDROLE: "Add Role",
			ADDEMPLOYEE: "Add Employee",
			UPDATEEMPLOYEEROLE: "Update Employee Role",
			UPDATEEMPLOYEEMANAGER: "Update Employee Manager",
			DELETEDEPARTMENT: "Delete Department",
			DELETEROLE: "Delete Role",
			DELETEEMPLOYEE: "Delete Employee",
			QUIT: "Quit",
		};
		this._db = new Database();
		// The Inquirer prompt structure for the main menu.
		this._mainMenu = {
			type: "list",
			name: "action",
			message: "What would you like to do?",
			choices: [
				this._actions.VIEWDEPARTMENTS,
				this._actions.VIEWROLES,
				this._actions.VIEWEMPLOYEES,
				this._actions.VIEWEMPLOYEESBYMANAGER,
				this._actions.VIEWEMPLOYEESBYDEPARTMENT,
				this._actions.VIEWUTILIZEDBUDGET,
				new inquirer.Separator(),
				this._actions.ADDDEPARTMENT,
				this._actions.ADDROLE,
				this._actions.ADDEMPLOYEE,
				new inquirer.Separator(),
				this._actions.UPDATEEMPLOYEEROLE,
				this._actions.UPDATEEMPLOYEEMANAGER,
				new inquirer.Separator(),
				this._actions.DELETEDEPARTMENT,
				this._actions.DELETEROLE,
				this._actions.DELETEEMPLOYEE,
				new inquirer.Separator(),
				this._actions.QUIT,
				new inquirer.Separator(),
			],
		};
	}

	get actions() {
		return this._actions;
	}

	/**
	 * Prompts the main menu to the user.
	 * @returns A Promise that resolves with the Inquirer prompt selection.
	 */
	async promptMainMenuAsync() {
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(this._mainMenu)
				.then(answers => {
					resolve({ action: answers.action });
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for new department details (name) and returns a Promise that resolves with the answers.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptAddDepartmentAsync() {
		return new Promise((resolve, reject) => {
			inquirer
				.prompt({
					name: "name",
					message: "What is the name of the department?",
				})
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for new role details (title, salary, department).
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptAddRoleAsync() {
		const departmentNames = (await this._db.getAllDepartmentsAsync()).map(
			d => d.department
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt([
					{
						name: "title",
						message: "What is the name of the role?",
					},
					{
						name: "salary",
						message: "What is the salary of the role?",
					},
					{
						type: "list",
						name: "department",
						message: "Which department does the role belong to?",
						choices: departmentNames,
					},
				])
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for new employee details (first, last, role, manager).
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptAddEmployeeAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.ADDEMPLOYEE
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for employee role update details (employee, role).
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptUpdateEmployeeRoleAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.UPDATEEMPLOYEEROLE
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for employee manager update details (employee, manager).
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptUpdateEmployeeManagerAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.UPDATEEMPLOYEEMANAGER
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for a manager for which to display employees.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptViewEmployeesByManagerAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.VIEWEMPLOYEESBYMANAGER
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for a department for which to display employees.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptViewEmployeesByDepartmentAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.VIEWEMPLOYEESBYDEPARTMENT
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for a department to delete.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptDeleteDepartmentAsync() {
		const departmentNames = (await this._db.getAllDepartmentsAsync()).map(
			d => d.department
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt({
					type: "list",
					name: "department",
					message: "Which department would you like to delete?",
					choices: departmentNames,
				})
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for a role to delete.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptDeleteRoleAsync() {
		const roleNames = (await this._db.getAllRolesAsync()).map(r => r.role);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt({
					type: "list",
					name: "role",
					message: "Which role would you like to delete?",
					choices: roleNames,
				})
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Prompts the user for an employee to delete.
	 * @returns A Promise that resolves with the Inquirer prompt answers.
	 */
	async promptDeleteEmployeeAsync() {
		const prompts = await this.buildEmployeePromptsAsync(
			this._actions.DELETEEMPLOYEE
		);
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(prompts)
				.then(answers => {
					resolve(answers);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * Builds a list of Inquirer prompts for an employee action.
	 * @param {*} action An employee-specific action.
	 * @returns An array representing the Inquirer prompts.
	 */
	async buildEmployeePromptsAsync(action) {
		const roleNames = (await this._db.getAllRolesAsync()).map(r => r.role);
		const employeeNames = (await this._db.getAllEmployeesAsync()).map(e =>
			e.first_name.concat(" ", e.last_name)
		);
		const managerNames = await this._db.getAllManagersAsync();
		const departmentNames = (await this._db.getAllDepartmentsAsync()).map(
			d => d.department
		);

		switch (action) {
			case this._actions.ADDEMPLOYEE:
				return [
					{
						name: "first",
						message: "What is the employee's first name?",
					},
					{
						name: "last",
						message: "What is the employee's last name?",
					},
					{
						type: "list",
						name: "role",
						message: "What is the employee's role?",
						choices: roleNames,
					},
					{
						type: "list",
						name: "manager",
						message: "Who is the employee's manager?",
						choices: ["None", ...employeeNames],
					},
				];
			case this._actions.UPDATEEMPLOYEEROLE:
				return [
					{
						type: "list",
						name: "employee",
						message: "Which employee's role do you want to update?",
						choices: employeeNames,
					},
					{
						type: "list",
						name: "role",
						message: "Which role do you want to assign the selected employee?",
						choices: roleNames,
					},
				];
			case this._actions.UPDATEEMPLOYEEMANAGER:
				return [
					{
						type: "list",
						name: "employee",
						message: "Which employee's manager do you want to update?",
						choices: employeeNames,
					},
					{
						type: "list",
						name: "manager",
						message: "Who is the employee's new manager?",
						choices: ["None", ...employeeNames],
					},
				];
			case this._actions.VIEWEMPLOYEESBYMANAGER:
				return [
					{
						type: "list",
						name: "manager",
						message: "Which manager's employees would you like to see?",
						choices: managerNames,
					},
				];
			case this._actions.VIEWEMPLOYEESBYDEPARTMENT:
				return [
					{
						type: "list",
						name: "department",
						message: "Which department's employees would you like to see?",
						choices: departmentNames,
					},
				];
			case this._actions.DELETEEMPLOYEE:
				return [
					{
						type: "list",
						name: "employee",
						message: "Which employee would you like to delete?",
						choices: employeeNames,
					},
				];
		}
	}
}

module.exports = Inquirer;
