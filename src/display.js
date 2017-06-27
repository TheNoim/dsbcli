const homedir = require('homedir');
const cc = require('./winston');
const util = require('util');
const fs = require('fs-extra');
const access = util.promisify(fs.access);
const path = require('path');
const read = util.promisify(fs.readJson);
const prompt = require('prompt-promise');
const spinner = require('./Spinner');

module.exports = function(argv) {
  const c = cc(argv.json);

  spinner.start("Load credentials...");
  if (!argv.username || !argv.password) {
    spinner.text = "Try to load saved credentials...";
    const home = homedir();
    if (!home) {
      spinner.fail("Can not resolve home directory. You can still use the cli but you need to provide the username and password manually.");
      c.error("Can not resolve home directory. You can still use the cli but you need to provide the username and password manually.");
      process.exit(1);
    }
    access(path.join(home, '.dsb/config.json'), fs.constants.R_OK)
      .then(() => {
        return read(path.join(home, '.dsb/config.json'));
      })
      .catch(e => {
        if (argv.json) {
          spinner.fail("Can not resolve home directory. You can still use the cli but you need to provide the username and password manually.");
          c.error("You need to provide the username and password manually.");
          process.exit(2);
        }
        spinner.info("Prompt credentials from user.");
        spinner.text = "Prompt credentials from user.";
        return promptUser();
      })
      .then(cfg => {
        if (!cfg.username || !cfg.password) {
          if (argv.json) {
            spinner.fail("You need to provide the username and password manually.");
            c.error("You need to provide the username and password manually.");
            process.exit(2);
          }
          spinner.info("Prompt credentials from user.");
          return promptUser();
        } else {
          return Promise.resolve(cfg);
        }
      })
      .then(cfg => {
        spinner.start("Credentails loaded.");
        return require('./display2')(cfg, c);
      })
      .then(() => process.exit(0))
      .catch(e => {
        spinner.fail(e);
        c.error(e);
        process.exit(1);
      });
  } else {
    spinner.text = "Use credentials from argv";
    return require('./display2')(argv, c)
      .then(() => process.exit(0));
  }
}


function promptUser() {
  let r = {};
  return prompt('username: ').then(username => {
    r.username = username;
    return prompt('password: ');
  }).then(password => {
    r.password = password;
    return Promise.resolve(r);
  })
}
