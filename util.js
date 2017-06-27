const fs = require('fs-extra');
const homedir = require('homedir');
const path = require('path');
const Client = require('dsbclient');
const md5 = require('md5');

module.exports = {

  createClient(username, password) {
    const cache = path.join(homedir(), '.dsb/cache/');
    fs.ensureDirSync(cache);
    return new Client(username, password, path.join(cache, md5(username+password) + '.json'));
  }
}
