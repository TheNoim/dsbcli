const homedir = require('homedir');
const spinner = require('./Spinner');
const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const writeJson = util.promisify(fs.writeJson);

module.exports = function (argv) {
    spinner.start("Save credentials...");
    if (argv.username && argv.password) {
        const p = path.join(homedir(), '.dsb/config.json');
        writeJson(p, {
            username: argv.username,
            password: argv.password
        }).then(() => {
            spinner.succeed("Saved login credentials.");
            process.exit(0);
        }).catch(e => {
            spinner.fail(e);
            process.exit(1);
        });
    } else {
        spinner.fail("You need to provide the login credentials!");
    }
};