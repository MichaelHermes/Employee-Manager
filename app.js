const cTable = require("console.table");
const figlet = require("figlet");
const Database = require("./utils/database");
const Inquirer = require("./utils/inquirer");
const inquirer = new Inquirer();

const db = new Database();

/**
 * Main menu logic to prompt for user selection and then facilitate the selection.
 * @returns void
 */
const mainMenu = async () => {
	try {
		const { action } = await inquirer.promptMainMenuAsync();
		if (action) {
			switch (action) {
				case inquirer.actions.VIEWDEPARTMENTS:
					console.log("");
					console.table(await db.getAllDepartmentsAsync());
					break;
				case inquirer.actions.VIEWROLES:
					console.log("");
					console.table(await db.getAllRolesAsync());
					break;
				case inquirer.actions.VIEWEMPLOYEES:
					console.log("");
					console.table(await db.getAllEmployeesAsync());
					break;
				case inquirer.actions.VIEWEMPLOYEESBYMANAGER:
					answers = await inquirer.promptViewEmployeesByManagerAsync();
					if (!answers) throw new Error("Missing manager selection");
					const { manager: viewByManager } = answers;
					console.log("");
					console.table(await db.getAllEmployeesByManagerAsync(viewByManager));
					break;
				case inquirer.actions.VIEWEMPLOYEESBYDEPARTMENT:
					answers = await inquirer.promptViewEmployeesByDepartmentAsync();
					if (!answers) throw new Error("Missing department selection");
					const { department: viewByDepartment } = answers;
					console.log("");
					console.table(
						await db.getAllEmployeesByDepartmentAsync(viewByDepartment)
					);
					break;
				case inquirer.actions.VIEWUTILIZEDBUDGET:
					console.log("");
					console.table(await db.getDepartmentUtilizedBudgetsAsync());
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
					const { title, salary, department } = answers;
					await db.addRoleAsync(title, parseInt(salary), department);
					console.log(`Added ${title} role to the database`);
					break;
				case inquirer.actions.ADDEMPLOYEE:
					answers = await inquirer.promptAddEmployeeAsync();
					if (!answers) throw new Error("Missing employee information");
					const { first, last, role: addRole, manager: addManager } = answers;
					await db.addEmployeeAsync(first, last, addRole, addManager);
					console.log(`Added ${first} ${last} to the database`);
					break;
				case inquirer.actions.UPDATEEMPLOYEEROLE:
					answers = await inquirer.promptUpdateEmployeeRoleAsync();
					if (!answers) throw new Error("Invalid employee role information");
					const { employee: updateRoleEmp, role: updateRole } = answers;
					await db.updateEmployeeRoleAsync(updateRoleEmp, updateRole);
					console.log(`Updated ${updateRoleEmp}'s role in the database`);
					break;
				case inquirer.actions.UPDATEEMPLOYEEMANAGER:
					answers = await inquirer.promptUpdateEmployeeManagerAsync();
					if (!answers) throw new Error("Invalid employee manager information");
					const { employee: updateManagerEmp, manager: updateManager } =
						answers;
					await db.updateEmployeeManagerAsync(updateManagerEmp, updateManager);
					console.log(`Updated ${updateManagerEmp}'s manager in the database`);
					break;
				case inquirer.actions.DELETEDEPARTMENT:
					answers = await inquirer.promptDeleteDepartmentAsync();
					if (!answers) throw new Error("Invalid department selection");
					const { department: deleteDept } = answers;
					await db.deleteDepartmentAsync(deleteDept);
					console.log(`Deleted ${deleteDept} from the database`);
					break;
				case inquirer.actions.DELETEROLE:
					answers = await inquirer.promptDeleteRoleAsync();
					if (!answers) throw new Error("Invalid role selection");
					const { role: deleteRole } = answers;
					await db.deleteRoleAsync(deleteRole);
					console.log(`Deleted ${deleteRole} from the database`);
					break;
				case inquirer.actions.DELETEEMPLOYEE:
					answers = await inquirer.promptDeleteEmployeeAsync();
					if (!answers) throw new Error("Invalid employee selection");
					const { employee: deleteEmp } = answers;
					await db.deleteEmployeeAsync(deleteEmp);
					console.log(`Deleted ${deleteEmp} from the database`);
					break;
				default:
					return;
			}
			// Recursively call back to the 'mainMenu' function to allow the user to continue making selections.
			return await mainMenu();
		}
	} catch (error) {
		console.error(error);
	}
};

/**
 * Displays an ASCII Art title for the console application and then launches the main menu.
 */
figlet(
	`Employee
	Manager`,
	{
		font: "Standard",
		horizontalLayout: "full",
		verticalLayout: "full",
	},
	(err, data) => {
		if (err) {
			console.log("Something went wrong with Figlet...");
			return;
		}
		console.log(data);
		// Add some space between the fancy title and the main menu.
		console.log("");
		mainMenu().then(() => {
			process.exit(0); // I'm not sure this SHOULD be required, but I couldn't get Node.js to exit without it. I'm assuming it's some asynchronous behavior that I couldn't track down...
		});
	}
);
