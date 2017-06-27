const os = require('os');
const spinner = require('./Spinner');
const fs = require('fs-extra');
const util = require('util');
const Promise = require('bluebird');
const moment = require('moment');
const axios = require('axios');
const path = require('path');
const ensureDir = util.promisify(fs.ensureDir);
const {URL} = require('url');
const promisePipe = require("promisepipe");
const getFile = require('./getFile');
const remove = util.promisify(fs.remove);

let c;

module.exports = function (data, cc) {
    c = cc;
    const ndata = [];
    for (key in data) {
        ndata.push({
            key: key,
            data: data[key]
        });
    }
    spinner.start("Download data...");
    return remove(path.join(os.tmpdir(), 'dsb/')).then(() => {
        return downloadTimetables(data).then(() => {
            return downloadTiles(data);
        }).then(() => {
            spinner.succeed("Finished downloads. " + path.join(os.tmpdir(), 'dsb/'));
            return Promise.resolve();
        });
    });
}

function downloadTiles(data) {
    //c.info(data);
    if (data.tiles && data.tiles.length > 0) {
        spinner.text = "Start downloading of all tiles. Count: " + Array.isArray(data.tiles) ? data.tiles.length : 0;
        return Promise.map(data.tiles, (tile) => {
            if (tile.detail && tile.title) {
                spinner.text = "Download tile " + tile.title + "...";
                return ensureDir(path.join(os.tmpdir(), 'dsb/tiles/')).then(() => {
                    return axios.get(tile.detail, {
                        responseType: 'stream'
                    });
                }).then(response => {
                    return promisePipe(response.data, fs.createWriteStream(path.join(os.tmpdir(), 'dsb/tiles/' + getFile(tile.detail))));
                }).then(() => {
                    spinner.text = "Saved.";
                    return Promise.resolve();
                });
            } else {
                return Promise.resolve();
            }
        });
    } else {
        return Promise.resolve();
    }
}

function downloadTimetables(data) {
    spinner.text = "Start downloading of all timetables. Count: " + Array.isArray(data.timetables) ? data.timetables.length : 0;
    if (data.timetables && data.timetables.length > 0) {
        return Promise.map(data.timetables, (table) => {
            if (table.src && table.date && table.refreshed) {
                spinner.text = "Download timetable from " + moment(table.date).format('Do MMM YYYY') + '...';
                return ensureDir(path.join(os.tmpdir(), 'dsb/timetables/')).then(() => {
                    return axios.get(table.src, {
                        responseType: 'stream'
                    });
                }).then(response => {
                    return promisePipe(response.data, fs.createWriteStream(path.join(os.tmpdir(), 'dsb/timetables/' + getFile(table.src))));
                }).then(() => {
                    spinner.text = "Saved.";
                    return Promise.resolve();
                });
            } else {
                return Promise.resolve();
            }
        });
    } else {
        return Promise.resolve();
    }
}
