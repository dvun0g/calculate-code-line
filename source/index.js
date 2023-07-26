const childProcess = require('child_process');

const DEFAULT_BRANCH = "master";
const CHECK_BRANCH = "branch/test/1";

const executeCommand = function (command) {
    return childProcess.execSync(command, {"encoding": "utf8"}).trim();
}

const checkoutAndPullBranch = function (branch) {
    executeCommand(`git checkout ${branch}`);
    executeCommand(`git pull origin ${branch}`);
}

const getChangedFiles = function (branch1, branch2) {
    checkoutAndPullBranch(branch1);
    checkoutAndPullBranch(branch2);

    const changedFiles = executeCommand(`git diff --name-only ${branch1} ${branch2}`).split('\n');

    return changedFiles;
}

const getChangedLine = function (branch1, branch2, changedFiles) {
    const DEFAULT_LINE_COUNT = 0;
    const lines = {
        "js": DEFAULT_LINE_COUNT,
    }

    changedFiles.forEach((file) => {
        const extension = file.split('.').at(-1);

        if (!extension) {
            return;
        }

        if (!Object.hasOwn(lines, extension)) {
            return;
        }

        const commandGetLineInFile = `git diff ${branch1} ${branch2} -- ${file} | wc -l`;
        lines[extension] += Number.parseInt(executeCommand(commandGetLineInFile), 10);
    })

    return lines;
}

const execute = function (branch1, branch2) {
    const changedFiles = getChangedFiles(branch1, branch2);
    const lines = getChangedLine(branch1, branch2, changedFiles);

    console.log(JSON.stringify(lines, null, 2));
    return lines;
}

execute(DEFAULT_BRANCH, CHECK_BRANCH);
