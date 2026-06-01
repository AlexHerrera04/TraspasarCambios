![Wiki Logo](https://framerusercontent.com/images/QxLJFAqWNQhRQOU9bxSof20Vous.png)

# Wiki Client

This project is a frontend application designed to enhance user experience by providing an intuitive interface reminiscent of popular platforms like Netflix, while offering valuable content and features to users.

## Description

The Wiki client aims to empower users by delivering an exceptional user experience through a visually appealing and easy-to-navigate interface. Drawing inspiration from the renowned user interface of Netflix, this project seeks to create a seamless and familiar browsing experience for users, fostering engagement and satisfaction.

By leveraging the power of modern web development technologies, such as Nx by Nrwl, Vite, Tailwind CSS, and Material UI, the project combines efficient monorepo management, fast development builds, flexible and responsive styling, and pre-built UI components to deliver a robust and feature-rich frontend solution.

The project's structure, facilitated by Nx workspaces and the NX Graph, enables scalability and maintainability, allowing for efficient code sharing and dependency management across multiple applications and libraries within the workspace. With a focus on providing an exceptional user experience, this wiki frontend project endeavors to empower users with a wealth of valuable content while ensuring an intuitive and visually captivating user interface.

## Features

- Nx by Nrwl for efficient monorepo management
- Vite as the build tool for rapid development and fast builds
- Tailwind CSS for flexible and responsive styling
- Material UI for pre-built UI components and styling

## Prerequisites

Before running this project, please ensure that you have the following dependencies installed:

- Node.js: [Download and install Node.js](https://nodejs.org)
- Yarn package manager: [Install Yarn](https://yarnpkg.com/getting-started/install)
- NX Workspaces: [Install NX](https://nx.dev/getting-started/installation)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Navigate to the project directory:

```bash
cd project-directory
```

3. Install the dependencies:

```bash
yarn install
```

## Development Server

To start the development server, execute the following command:

```bash
nx run wiki-client:start                                                  
```

This will launch the Vite development server and open the application in your default browser. The development server supports hot module replacement (HMR), enabling real-time updates as you modify the source code.

## Build

To build the project for production, use the following command:

```bash
nx run wiki-client:build
```

The build process will generate production-ready artifacts in the `dist` directory, ready for deployment.

## Testing

This project includes a comprehensive testing setup using [insert testing framework here]. Execute the following command to run the tests:

```bash
nx run wiki-client:test
```

## Resources

You can also verify all Generate & Running Targets using NX Console inside vscode:

![image](https://github.com/WIKIOpenKX/wiki-client/assets/6207119/dea13177-0834-4228-8f85-c7aa8d860f60)


Expand your knowledge with the following resources related to the technologies used in this project:

- [Nx Documentation](https://nx.dev/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material UI Documentation](https://material-ui.com/getting-started/)

---
