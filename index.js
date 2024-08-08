#!/usr/bin/env node

const depcheck = require("depcheck");
const fs = require("fs");
const { execSync } = require("child_process");

let inquirer; // Global inquirer variable to hold the dynamically imported inquirer module

// Function to log actions
function logAction(message) {
  fs.appendFileSync(
    "dephelper.log",
    `${new Date().toISOString()} - ${message}\n`
  );
}

// Function to run depcheck
async function runDepcheck() {
  inquirer = (await import("inquirer")).default; // Dynamically import inquirer
  const options = {};

  depcheck(process.cwd(), options).then((unused) => {
    console.log("Unused dependencies:", unused.dependencies);

    if (unused.dependencies.length === 0) {
      console.log("No unused dependencies found.");
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
          ],
        },
      ])
      .then((answer) => {
        if (answer.action === "Save the list and exit") {
          saveList(unused.dependencies);
        } else if (answer.action === "Uninstall all") {
          uninstallDependencies(unused.dependencies);
        } else if (answer.action === "Uninstall some") {
          selectDependenciesToUninstall(unused.dependencies);
        }
      });
  });
}

// Function to save list of unused dependencies
function saveList(dependencies) {
  fs.writeFileSync(
    "unused-dependencies.json",
    JSON.stringify(dependencies, null, 2)
  );
  logAction("Saved list of unused dependencies.");
  console.log("List saved to unused-dependencies.json");
}

// Function to remove dependencies from package.json
function removeFromPackageJson(dependencies) {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  dependencies.forEach((dep) => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
    }
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      delete packageJson.devDependencies[dep];
    }
  });

  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  logAction("Updated package.json to remove dependencies.");
}

// Function to uninstall dependencies
function uninstallDependencies(dependencies) {
  dependencies.forEach((dep) => {
    execSync(`npm uninstall ${dep}`);
    logAction(`Uninstalled ${dep}`);
    console.log(`Uninstalled ${dep}`);
  });
  removeFromPackageJson(dependencies); // Remove the uninstalled dependencies from package.json
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
      uninstallDependencies(answers.selectedDeps);
      const remainingDeps = dependencies.filter(
        (dep) => !answers.selectedDeps.includes(dep)
      );
      saveList(remainingDeps);
    });
}

// Run the depcheck with interactive prompt
runDepcheck();
