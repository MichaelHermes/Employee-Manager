const express = require("express");
const cTable = require("console.table");
const Inquirer = require("./utils/inquirer");

const PORT = process.env.PORT || 3001;
const app = express();
const inquirer = new Inquirer();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let mainMenu = async () => {
	let quit = false;

	try {
		const { db, action } = await inquirer.promptMainMenuAsync();
		if (db && action) {
			switch (action) {
				case inquirer.actions.VIEWDEPARTMENTS:
					console.table(await db.getAllDepartmentsAsync());
					break;
				case inquirer.actions.VIEWROLES:
					console.table(await db.getAllRolesAsync());
					break;
				case inquirer.actions.VIEWEMPLOYEES:
					console.table(await db.getAllEmployeesAsync());
					break;
				case inquirer.actions.ADDDEPARTMENT:
					// TODO: Add logic to add a new department
					break;
				case inquirer.actions.ADDROLE:
					// TODO: Add logic to add a new role
					break;
				case inquirer.actions.ADDEMPLOYEE:
					// TODO: Add logic to add a new employee
					break;
				case inquirer.actions.UPDATEEMPLOYEE:
					// TODO: Add logic to update an employee's role
					break;
				default:
					quit = true;
					break;
			}
		}

		if (!quit) {
			await mainMenu(); // Recursively call back to the 'mainMenu' function to allow the user to continue making selections.
		}
	} catch (error) {
		console.error(error);
	}
};

// Default response for any other request (Not Found)
app.use((req, res) => {
	res.status(404).end();
});

app.listen(PORT, () => {});

mainMenu();
