# Contributing

### Table of Contents
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Standards and Guidelines](standards-and-guidelines)
- [Next.js](#nextjs)
    - [Prerequisites](#prerequisites)
    - [Recommended Workflow](#recommended-workflow)
    - [Installation and Running Dev Server](#installation-and-running-dev-server)
- [Chrome Extension](#chrome-extension)
    - [Recommended Workflow](#recommended-workflow-1)
    - [Important!](#important)

## Built With
* Next.js
* TypeScript
* JavaScript
* Sass/SCSS
* Material UI

## Getting Started
UT Registration Planner is composed of 2 main sections. The Next.js and Chrome Extension folder.
Depending on what part of the project you want to contribute to will determine your workflow.

## Standards and Guidelines
In order for UT Registration Planner to maintain a clean and organized codebase, we follow certain styles which are enforced by [Prettier](https://prettier.io/docs/en/install.html) and the `prettier-vscode` VS Code extension called **"Prettier - Code formatter"**.

> Note: You will need to select which code formatter VS Code wants to use (It will prompt you to choose).

---

## Next.js

### Prerequisites
- Node.js `18.3.0`

### Recommended Workflow
The Next.js section of this project is located under the `ut-registration-planner` folder. Open up VS Code and open the UT Registration Planner project root with `File > Open Folder...` `UT Registration Planner`.

Then open up the integrated terminal in VS Code and navigate to the `ut-registration-planner`folder.
```bash
cd ut-registration-planner
```

### Installation and Running Dev Server
Install npm packages and dependencies
```bash
npm install
```
Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Chrome Extension

### Recommended Workflow
The Chrome Extension section of this project is located under the `extension` folder. Open up VS Code and open the UT Registration Planner project root with `File > Open Folder...` `UT Registration Planner`.

1. Head over to [chrome://extensions](chrome://extensions) in a new chrome profile (recommended to prevent conflicts).
2. Enable **Developer Mode**
3. Click the **Load Unpacked** button
4. Select the `UT Registration Planner/extension` folder

### Important!
You will have to navigate to [chrome://extensions](chrome://extensions) and refresh the UT Registration Planner Chrome Extension and the pages it affects after every change for the changes to take effect.