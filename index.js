#!/usr/bin/env node

const depcheck = require("depcheck");
const fs = require("fs").promises;
const { execSync } = require("child_process");

let inquirer; // Global inquirer variable to hold the dynamically imported inquirer module

// Function to log actions
async function logAction(message) {
  try {
    await fs.appendFile(
      "dephelper.log",
      `${new Date().toISOString()} - ${message}\n`
    );
  } catch (error) {
    console.error(`Failed to log action: ${error.message}`);
  }
}

// Function to run depcheck
async function runDepcheck() {
  inquirer = (await import("inquirer")).default; // Dynamically import inquirer
  const options = {};

  try {
    const unused = await depcheck(process.cwd(), options);
    console.log("Unused dependencies:", unused.dependencies);

    if (unused.dependencies.length === 0) {
      console.log("No unused dependencies found.");
      return;
    }

    // Check for CLI arguments
    const args = process.argv.slice(2);
    if (args.includes("--uninstall-all")) {
      uninstallDependencies(unused.dependencies);
      return;
    }

    inquirer
      .prompt([
        {
          type: "list",
          name: "action",
          message: "What do you want to do with unused dependencies?",
          choices: [
            "Uninstall all",
            "Uninstall some",
            "Save the list and exit",
            "Do nothing",
          ],
        },
      ])
      .then((answer) => {
        if (answer.action === "Save the list and exit") {
          saveList(unused.dependencies);
        } else if (answer.action === "Uninstall all") {
          confirmUninstall(unused.dependencies);
        } else if (answer.action === "Uninstall some") {
          selectDependenciesToUninstall(unused.dependencies);
        }
      });
  } catch (error) {
    console.error(`Failed to run depcheck: ${error.message}`);
  }
}

// Function to save list of unused dependencies
async function saveList(dependencies) {
  try {
    await fs.writeFile(
      "unused-dependencies.json",
      JSON.stringify(dependencies, null, 2)
    );
    logAction("Saved list of unused dependencies.");
    console.log("List saved to unused-dependencies.json");
  } catch (error) {
    console.error(`Failed to save list: ${error.message}`);
  }
}

// Function to remove dependencies from package.json
async function removeFromPackageJson(dependencies) {
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));

    dependencies.forEach((dep) => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        delete packageJson.dependencies[dep];
      }
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        delete packageJson.devDependencies[dep];
      }
    });

    await fs.writeFile("package.json", JSON.stringify(packageJson, null, 2));
    logAction("Updated package.json to remove dependencies.");
  } catch (error) {
    console.error(`Failed to update package.json: ${error.message}`);
  }
}

// Function to uninstall dependencies
function uninstallDependencies(dependencies) {
  dependencies.forEach((dep) => {
    try {
      execSync(`npm uninstall ${dep}`);
      logAction(`Uninstalled ${dep}`);
      console.log(`Uninstalled ${dep}`);
    } catch (error) {
      logAction(`Failed to uninstall ${dep}: ${error.message}`);
      console.error(`Failed to uninstall ${dep}`);
    }
  });
  removeFromPackageJson(dependencies); // Remove the uninstalled dependencies from package.json
  execSync("npm install"); // Ensure package-lock.json is updated
}

// Function to confirm uninstalling all dependencies
function confirmUninstall(dependencies) {
  inquirer
    .prompt([
      {
        type: "confirm",
        name: "confirmUninstall",
        message: `Are you sure you want to uninstall all unused dependencies?`,
      },
    ])
    .then((confirm) => {
      if (confirm.confirmUninstall) {
        uninstallDependencies(dependencies);
        saveList(dependencies);
      }
    });
}

// Function to select dependencies to uninstall
function selectDependenciesToUninstall(dependencies) {
  inquirer
    .prompt([
      {
        type: "checkbox",
        name: "selectedDeps",
        message: "Select dependencies to uninstall:",
        choices: dependencies,
      },
    ])
    .then((answers) => {
      const selectedDeps = answers.selectedDeps;
      uninstallDependencies(selectedDeps);
    });
}

// Run the depcheck with interactive prompt
runDepcheck();
