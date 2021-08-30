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
}

module.exports = Inquirer;
