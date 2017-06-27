const u = require('./util');
const spinner = require('./Spinner');
const dl = require('./downloader');
const dp3 = require('./display3');

module.exports = function(cfg, c) {
    spinner.text = "Fetch dsb...";
    const client = u.createClient(cfg.username, cfg.password);
    let xdata;
    return client.fetch().then(data => {
        spinner.succeed("Fetch successfully.");
        return Promise.resolve(data);
    }).then(data => {
        xdata = data;
        return dl(data, c);
    }).then(() => {
        return dp3(xdata, c);
    }).catch(e => {
        c.error(e);
        spinner.fail(e);
        process.exit(3);
    });
}
