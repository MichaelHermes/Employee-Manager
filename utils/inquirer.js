const inquirer = require("inquirer");
const Database = require("./database");

class Inquirer {
	constructor() {
		this._actions = {
			VIEWDEPARTMENTS: "View All Departments",
			VIEWROLES: "View All Roles",
			VIEWEMPLOYEES: "View All Employees",
			ADDDEPARTMENT: "Add Department",
			ADDROLE: "Add Role",
			ADDEMPLOYEE: "Add Employee",
			UPDATEEMPLOYEE: "Update Employee Role",
			QUIT: "Quit",
		};
		this._db = new Database();
		this._mainMenu = {
			type: "list",
			name: "action",
			message: "What would you like to do?",
			choices: [
				this._actions.VIEWDEPARTMENTS,
				this._actions.VIEWROLES,
				this._actions.VIEWEMPLOYEES,
				new inquirer.Separator(),
				this._actions.ADDDEPARTMENT,
				this._actions.ADDROLE,
				this._actions.ADDEMPLOYEE,
				new inquirer.Separator(),
				this._actions.UPDATEEMPLOYEE,
				this._actions.QUIT,
				new inquirer.Separator(),
			],
		};
		this._newDepartment = [
			{
				name: "name",
				message: "What is the name of the department?",
			},
		];
	}

	get actions() {
		return this._actions;
	}

	async promptMainMenuAsync() {
		return new Promise((resolve, reject) => {
			inquirer
				.prompt(this._mainMenu)
				.then(answers => {
					switch (this._mainMenu.choices.indexOf(answers.action) + 1) {
						case 1:
							resolve({ db: this._db, action: this._actions.VIEWDEPARTMENTS });
							break;
						case 2:
							resolve({ db: this._db, action: this._actions.VIEWROLES });
							break;
						case 3:
							resolve({ db: this._db, action: this._actions.VIEWEMPLOYEES });
							break;
						case 5:
							resolve({ db: this._db, action: this._actions.ADDDEPARTMENT });
							break;
						case 6:
							resolve({ db: this._db, action: this._actions.ADDROLE });
							break;
						case 7:
							resolve({ db: this._db, action: this._actions.ADDEMPLOYEE });
							break;
						case 9:
							resolve({ db: this._db, action: this._actions.UPDATEEMPLOYEE });
							break;
						case 10:
							resolve({ db: this._db, action: this._actions.QUIT });
							break;
					}
				})
				.catch(error => {
					reject(error);
				});
		});
	}

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

	async promptAddRoleAsync() {
		const prompts = await this.buildRolePromptsAsync();
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

	async promptAddEmployeeAsync() {
		const prompts = await this.buildEmployeePromptsAsync();
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

	async promptUpdateEmployeeAsync() {
		const prompts = await this.buildEmployeePromptsAsync(true);
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

	async buildRolePromptsAsync() {
		const departmentNames = (await this._db.getAllDepartmentsAsync()).map(
			d => d.name
		);
		return [
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
				name: "departmentName",
				message: "which department does the role belong to?",
				choices: departmentNames,
			},
		];
	}

	async buildEmployeePromptsAsync(update) {
		const roleNames = (await this._db.getAllRolesAsync()).map(r => r.title);
		const employeeNames = (await this._db.getAllEmployeesAsync()).map(e =>
			e.first_name.concat(" ", e.last_name)
		);

		if (!update) {
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
					choices: employeeNames,
				},
			];
		} else {
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
		}
	}
}

module.exports = Inquirer;
