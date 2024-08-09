# Node JS - Dependencies Cleaner

**dephelper** is a tool designed to help developers manage unused dependencies in their Node.js projects. It allows you to detect unused dependencies, interactively uninstall them, and automatically update your `package.json` file. Additionally, it can save a list of uninstalled dependencies for future reference.

## Features

- Detect unused dependencies using [`depcheck`](https://www.npmjs.com/package/depcheck).
- Interactively uninstall all or selected unused dependencies.
- Automatically update your `package.json` file after uninstalling dependencies.
- Save the list of uninstalled dependencies for future reference.
- Optionally, save a list of remaining unused dependencies if you choose not to uninstall all of them.

## Installation

To install dephelper globally, use npm:

```bash
npm install -g dephelper
```

## Usage

Simply navigate to the root of your Node.js project and run:

```bash
dephelper
```

## Command Line Options

--uninstall-all: Automatically uninstall all unused dependencies without prompting.

## Interactive Prompts:

## Detect Unused Dependencies: The tool will list all unused dependencies in your project.

## Choose Action: You can choose to:

- Uninstall all unused dependencies.
- Uninstall some of the unused dependencies (you can select which ones).
- Save the list of remaining unused dependencies without uninstalling.
- Do nothing and exit.
- Save Uninstalled Dependencies: If you choose to uninstall dependencies (all or some), the tool will automatically save the list of those uninstalled dependencies in unused-dependencies.json.

## Logs

- The tool logs all actions (uninstalls, updates to package.json, etc.) to dephelper.log.
