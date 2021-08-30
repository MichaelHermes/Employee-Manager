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
					answers = await inquirer.promptAddDepartmentAsync();
					if (!answers) throw new Error("Missing department name");
					const { name } = answers;
					await db.addDepartmentAsync(name);
					console.log(`Added ${name} department to the database`);
					break;
				case inquirer.actions.ADDROLE:
					answers = await inquirer.promptAddRoleAsync();
					if (!answers) throw new Error("Missing role information");
					const { title, salary, departmentName } = answers;
					await db.addRoleAsync(title, parseInt(salary), departmentName);
					console.log(`Added ${title} role to the database`);
					break;
				case inquirer.actions.ADDEMPLOYEE:
					answers = await inquirer.promptAddEmployeeAsync();
					if (!answers) throw new Error("Missing employee information");
					const { first, last, role: addRole, manager } = answers;
					await db.addEmployeeAsync(first, last, addRole, manager);
					console.log(`Added ${first} ${last} to the database`);
					break;
				case inquirer.actions.UPDATEEMPLOYEE:
					answers = await inquirer.promptUpdateEmployeeAsync();
					if (!answers) throw new Error("Invalid employee update information");
					const { employee, role: updateRole } = answers;
					await db.updateEmployeeAsync(employee, updateRole);
					console.log(`Updated ${employee}'s role in the database`);
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
