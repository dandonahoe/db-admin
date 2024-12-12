# CLI Tool for Repository Scanning and Documentation Generation

This project is a command-line interface (CLI) tool designed to scan repository directories, analyze file contents, and generate comprehensive markdown documentation. It automates the process of creating structured documentation for codebases, making it easier for developers to understand and navigate complex projects.

The tool recursively scans specified directories, reads the contents of various file types (such as .yaml, .json, .ts, etc.), and generates a markdown file for each scanned directory. The generated documentation includes a file structure tree and the combined content of the scanned files, providing a clear overview of the project's structure and contents.

Key features of this CLI tool include:

- Configurable scanning of multiple repository directories
- Customizable file type filtering
- Exclusion of specific paths or file types
- Generation of file structure trees
- Combination of file contents into a single markdown document
- Support for environment variables through .env files
- Flexible output configuration for generated documentation

## Repository Structure

- src/
  - cli/
    - package.json
    - src/
      - codebase.ts
      - index.js
      - test.ts

Key Files:
- `src/cli/src/codebase.ts`: Main script for scanning repositories and generating documentation
- `src/cli/src/index.js`: Entry point for the CLI application
- `src/cli/package.json`: Node.js project configuration and dependencies
- `src/cli/src/test.ts`: Simple test file (not used in main functionality)

## Usage Instructions

### Installation

Prerequisites:
- Node.js (version 12 or higher)
- npm (usually comes with Node.js)

To install the CLI tool, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-name>/src/cli
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Configuration

1. Create a `.env` file in the `src/cli` directory to set any necessary environment variables.

2. Modify the `repoDirectories` array in `src/cli/src/codebase.ts` to include the directories you want to scan.

3. Adjust the `fileTypesToScan` array in `src/cli/src/codebase.ts` if you need to scan different file types.

### Running the Tool

To run the repository scanning and documentation generation tool:

```
npm run job:codebase
```

This command executes the `codebase.ts` script using `ts-node`.

### Common Use Cases

1. Scanning a specific repository:
   - Edit the `repoDirectories` array in `codebase.ts` to include only the desired repository.
   - Run the tool as described above.

2. Customizing output:
   - Modify the `ScanConfig` interface and `scanJobList` in `codebase.ts` to adjust output file paths, headers, or descriptions.

3. Excluding certain paths:
   - Add patterns to the `excludePaths` array in the `scanJobList` configuration.

### Troubleshooting

1. Issue: Tool fails to read files
   - Error message: "ENOENT: no such file or directory"
   - Diagnostic process:
     1. Check if the specified directories in `repoDirectories` exist.
     2. Verify file permissions for the directories and files.
   - Solution: Ensure the paths in `repoDirectories` are correct and the user has read access to all directories and files.

2. Issue: Output files are not generated
   - Error message: "Error creating directory"
   - Diagnostic process:
     1. Check if the output directory specified in `outputDir` exists.
     2. Verify write permissions for the output directory.
   - Solution: Ensure the output directory exists and the user has write permissions.

### Debugging

To enable debug mode:

1. Add `console.log` statements in the `codebase.ts` file at key points in the execution.
2. Run the script with the Node.js inspector:
   ```
   node --inspect-brk -r ts-node/register src/codebase.ts
   ```
3. Use a debugger (e.g., Chrome DevTools) to connect to the Node.js process and step through the code.

Log files: This application does not generate log files by default. Consider adding a logging library like `winston` for more advanced logging capabilities.

## Data Flow

The CLI tool processes data through the following steps:

1. Configuration Loading: The tool loads environment variables and scan configurations.
2. Directory Scanning: It recursively scans the specified directories.
3. File Filtering: Files are filtered based on configured file types and exclusion patterns.
4. Content Reading: The tool reads the content of matched files.
5. Tree Generation: A file structure tree is generated for each scanned directory.
6. Content Combination: File contents are combined into a single markdown document.
7. Output Generation: The final markdown document is written to the specified output location.

```
[Configuration] -> [Directory Scanning] -> [File Filtering]
                                                |
                                                v
[Output Generation] <- [Content Combination] <- [Content Reading]
        ^
        |
[Tree Generation]
```

Note: The tool processes each configured directory independently, allowing for parallel execution of multiple scan jobs.