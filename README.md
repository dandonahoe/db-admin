# DB Admin: Database Administration Tool

DB Admin is a database administration tool that combines a web interface, API, and CLI components. It is built using modern web technologies and follows best practices for scalability and maintainability.

## Repository Structure

```
.
├── package.json
├── README.md
├── src
│   ├── api
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   ├── app.controller.spec.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.service.ts
│   │   │   └── main.ts
│   │   ├── test
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── tsconfig.build.json
│   │   └── tsconfig.json
│   ├── cli
│   │   ├── package.json
│   │   └── src
│   │       ├── codebase.ts
│   │       ├── index.js
│   │       └── test.ts
│   └── web
│       ├── app
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.module.css
│       │   └── page.tsx
│       ├── next.config.ts
│       ├── package.json
│       ├── README.md
│       └── tsconfig.json
├── tsconfig.dev.json
└── tsconfig.json
```

### Key Files

- `src/api/src/main.ts`: Entry point for the NestJS API
- `src/cli/src/codebase.ts`: Main CLI tool for codebase analysis
- `src/cli/src/index.js`: CLI entry point
- `src/web/app/layout.tsx`: Main layout component for the Next.js web application
- `src/web/app/page.tsx`: Main page component for the Next.js web application
- `package.json`: Root project configuration and scripts
- `tsconfig.json` and `tsconfig.dev.json`: TypeScript configuration files

## Configuration Files

This project uses various configuration files to manage different aspects of the development environment, build process, and runtime behavior. Below are links to detailed explanations for each configuration file:

- [Root package.json](config_files/root_package_json.md)
- [tsconfig.dev.json](config_files/tsconfig_dev_json.md)
- [tsconfig.json](config_files/tsconfig_json.md)
- [src/api/.eslintrc.js](config_files/src_api_eslintrc_js.md)
- [src/api/nest-cli.json](config_files/src_api_nest_cli_json.md)
- [src/api/package.json](config_files/src_api_package_json.md)
- [src/api/test/jest-e2e.json](config_files/src_api_test_jest_e2e_json.md)
- [src/api/tsconfig.build.json](config_files/src_api_tsconfig_build_json.md)
- [src/api/tsconfig.json](config_files/src_api_tsconfig_json.md)
- [src/cli/package.json](config_files/src_cli_package_json.md)
- [src/web/next.config.ts](config_files/src_web_next_config_ts.md)
- [src/web/package.json](config_files/src_web_package_json.md)
- [src/web/tsconfig.json](config_files/src_web_tsconfig_json.md)

For a detailed explanation of each configuration file, please click on the respective links above.

## Usage Instructions

### Installation

Prerequisites:
- Node.js (version 14 or higher)
- pnpm (version 6 or higher)

To install the project and its dependencies, run:

```bash
pnpm run reset
```

This command removes existing `node_modules` directories and installs dependencies for the root project, web, API, and CLI components.

### Getting Started

To start the development servers:

1. For the web application:
   ```bash
   pnpm run dev:web
   ```

2. For the API:
   ```bash
   pnpm run dev:api
   ```

### Building the Project

To build the API and web components:

```bash
pnpm run build:api
pnpm run build:web
```

### Running the CLI

To analyze the codebase using the CLI tool:

```bash
pnpm run analyze
```

### Testing

To run tests for the API component:

```bash
cd src/api
pnpm test
```

### Linting

To run the linter:

```bash
pnpm run lint
```

## Troubleshooting

1. Issue: Dependencies not installing correctly
   - Problem: Outdated Node.js or pnpm versions may cause installation issues.
   - Solution: Ensure you have the latest stable versions of Node.js and pnpm installed. Run `pnpm run reset` to reinstall all dependencies.

2. Issue: TypeScript compilation errors
   - Problem: TypeScript errors in IDE or during build time.
   - Solution: Check that your TypeScript version matches the project specification. Run `pnpm install` in the root directory to ensure all TypeScript-related dependencies are correctly installed.

3. Issue: API not starting
   - Problem: API server fails to start or crashes immediately.
   - Solution: 
     1. Check if the required port (default 3000) is available.
     2. Ensure all environment variables are correctly set. Create a `.env` file in the `src/api` directory if it doesn't exist.
     3. Run `pnpm --prefix src/api install` to ensure all API dependencies are installed.

4. Issue: Web application build failing
   - Problem: Next.js build process fails with errors.
   - Solution:
     1. Ensure all dependencies are installed by running `pnpm --prefix src/web install`.
     2. Check for any TypeScript errors in your components and pages.
     3. Verify that all required environment variables are set in your `.env.local` file in the `src/web` directory.

For persistent issues, enable verbose logging by setting the `DEBUG` environment variable:

```bash
DEBUG=* pnpm run dev:api
```

or

```bash
DEBUG=* pnpm run dev:web
```

This will provide more detailed output to help diagnose the problem.

## Data Flow

The DB Admin tool follows a client-server architecture with an additional CLI component for advanced operations:

1. User Interface (Web Application)
   ↓
2. API Requests (Next.js to NestJS API)
   ↓
3. API Processing (NestJS)
   ↓
4. Database Interactions
   ↑
5. Response back to UI

```
+----------------+        +-------------+        +------------------+
|                |        |             |        |                  |
|  Web Interface | <----> |  NestJS API | <----> | Database Systems |
| (Next.js)      |        |             |        |                  |
|                |        |             |        |                  |
+----------------+        +-------------+        +------------------+
        ^                        ^
        |                        |
        |                        |
        v                        v
+----------------+        +-------------+
|                |        |             |
|   CLI Tool     |        | File System |
| (Node.js)      |        |             |
|                |        |             |
+----------------+        +-------------+
```

The CLI tool operates independently, interacting directly with the file system for codebase analysis and other administrative tasks. It can also potentially interact with the API for more complex operations.

Note: Implement proper authentication and authorization mechanisms to secure the data flow between components.