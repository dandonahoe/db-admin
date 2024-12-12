import { minimatch } from 'minimatch';
import { promises as fs } from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';


// Load environment variables from .env file
dotenv.config();

interface ScanConfig {
    outputDescription? : string;
    fileTypesToScan    : string[];
    outputFilePath     : string;
    outputHeader?      : string;
    excludePaths       : string[];
    outputDir          : string;
    srcDir             : string;
    includeTests       : boolean; // New flag to include or exclude test files
}
const fileTypesToScan = [
    '.ts', '.tsx', '.sql', '.java', '.xml',
    '.py', '.sh',  '.yml', '.yaml', '.json',
    '.conf', '.bash'
];

// const repoDirectories = [
//     'accounts',
//     'aws',
//     'crude-cards',
//     'dat',
//     'db-admin',
//     'developer',
//     'ed-iam',
//     'edldap-deploy-env',
//     'gateway',
//     'gateway-test-client',
//     'grouper',
//     'groups',
//     'midpoint',
//     'onboard',
//     'serviceaccountmanager',
//     'sql-scripts',
//     'te-pipe-orchestration',
// ];

const repoDirectories = [
    'banner-vtirm',
    'banner-vtregistry',
    'confirmpassword-sp',
    'errorLogCheck',
    'hokiePassportXchange',
    'idremoval',
    'integrityChecks',
    'middlewarerepl-sp',
    'registry-vtregistry',
    'sql-scripts',
    'unix_removal',
    'vtfbanner-vtirm',
];

const scanJobList: ScanConfig[] = repoDirectories.map(repoDir => ({
    outputDescription : `${repoDir} Output`,
    fileTypesToScan,
    outputFilePath    : path.join(__dirname, `./output/${repoDir}.md`),
    excludePaths      : [],
    outputHeader      : `## ${repoDir} Codebase\n\n`,
    includeTests      : false,
    outputDir         : path.join(__dirname, './output'),
    srcDir            : path.join(__dirname, `../../../../vt/${repoDir}`),
}));

// Function to check if a file path should be excluded
const isExcluded = (filePath: string, excludePaths: string[]): boolean =>
    excludePaths.some(pattern => minimatch(filePath, pattern));

// Function to recursively get all files of specified types in a directory and generate a tree
const getAllFilesAndTree = async (
    dir: string, exts: string[], excludePaths: string[],
    includeTests: boolean, relativeRoot: string,
): Promise<{ files: string[], tree: string }> => {

    const dirents = await fs.readdir(dir, { withFileTypes : true });

    const files: string[] = [];
    let tree = '';

    const indent = (dir.replace(relativeRoot, '').split(path.sep).length - 1) * 2;
    const currentDirName = path.basename(dir);

    // Exclude .git directory
    if (currentDirName === '.git') return { files, tree };

    tree += `${' '.repeat(indent)}- ${currentDirName}/\n`;

    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);

        if (isExcluded(res, excludePaths)) continue;

        if (dirent.isDirectory()) {
            // Automatically exclude __test__, migrations, and .git directories
            if (!includeTests && (
                dirent.name === '__test__' || (dir.endsWith('src') && dirent.name === 'migrations')) || dirent.name === '.git') continue;
            const { files: subFiles, tree: subTree } = await getAllFilesAndTree(res, exts, excludePaths, includeTests, relativeRoot);
            files.push(...subFiles);
            tree += subTree;
        } else if (exts.some(ext => res.endsWith(ext)) && (includeTests || !res.endsWith('.spec.ts'))) {
            files.push(res);
            tree += `${' '.repeat(indent + 2)}- ${dirent.name}\n`;
        }
    }

    return { files, tree };
};

// Function to read and combine content from multiple files
const readAndCombineFiles = async (filePaths: string[]): Promise<string> => {
    return (await Promise.all(filePaths.map(async filePath => {
        const fileContent = await fs.readFile(filePath, 'utf-8');

        return `## ${filePath}\n\n\`\`\`typescript\n${fileContent}\n\`\`\`\n\n`;
    }))).join('');
};

// Function to ensure output directory exists
const ensureOutputDir = async (outputDir: string) => {
    try {
        await fs.mkdir(outputDir, { recursive : true });
    } catch (err) {
        console.error(`Error creating directory: ${outputDir}`, err);
        throw err;
    }
};

// Function to write content to file
const writeToFile = async (filePath: string, content: string) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`Combined file created at ${filePath}`);
    } catch (err) {
        console.error(`Error writing file: ${filePath}`, err);
        throw err;
    }
};

// Function to combine the outputHeader, outputDescription, and file content
const generateFinalContent = (header: string = '', description: string = '', content: string): string =>
    `${header}${description}\n\n${content}`;

// Main function to execute the scan jobs
const executeJob = async (job: ScanConfig): Promise<void> => {
    await ensureOutputDir(job.outputDir);

    const { files, tree } = await getAllFilesAndTree(
        job.srcDir, job.fileTypesToScan, job.excludePaths, job.includeTests ?? false, job.srcDir);
    const combinedContent = await readAndCombineFiles(files);

    const finalContent = generateFinalContent(
        job.outputHeader, job.outputDescription, `### File Structure\n\n${tree}\n\n### Combined Files\n\n${combinedContent}`);

    await writeToFile(job.outputFilePath, finalContent);
};

// Main execution entry point
const main = async (): Promise<void> => {
    try {
        const results = await Promise.allSettled(scanJobList.map(executeJob));

        results.forEach((result, index) => {
            if (result.status === 'rejected')
                console.error(`Error during job ${index + 1}:`, result.reason);
             else
                console.log(`Job ${index + 1} completed successfully.`);
        });
    } catch (error) {
        console.error('Unexpected error during file scanning and combining:', error);
    }
};

main();
