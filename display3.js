const Promise = require('bluebird');
const spinner = require('./Spinner');
const getFile = require('./getFile');
const os = require('os');
const path = require('path');
const art = require('ascii-art');
const util = require('util');
const font = function (text, font) {
    return new Promise((resolve, reject) => {
        art.font(text, font, function (rendered) {
            resolve(rendered);
        });
    });
};
const fs = require('fs-extra');
const readFile = util.promisify(fs.readFile);
const HtmlTableToJson = require('html-table-to-json');
const remove = util.promisify(fs.remove);

art.Figlet.fontPath = "./";

module.exports = function (data, c) {
    spinner.start("Render data...");
    let tiles = data.tiles;
    return renderTiles(tiles, c).then(tiles => {
        spinner.text = "All tiles rendered.";
        spinner.text = "Render timetables.";
        return renderTimetables(data.timetables, c).then(timetables => {
            spinner.succeed("Everything rendered.");
            return Promise.map(tiles, function (tile) {
                console.log(tile.title);
                console.log(tile.detail);
                return Promise.resolve();
            }).then(() => {
                return Promise.map(timetables, function (timetable) {
                    return Promise.map(timetable.tables, function (table) {
                        console.log(table);
                        return Promise.resolve();
                    });
                });
            });
        });
    }).then(() => {
        spinner.start("Clear tmp...");
        return remove(path.join(os.tmpdir(), "dsb/"));
    }).then(() => {
        spinner.succeed("Clear tmp successfully. Exit now.");
        return Promise.resolve();
    });
};

function renderTimetables(timetables, c) {
    if (timetables) {
        return Promise.map(timetables, function (table, index) {
            spinner.text = "Load timetable"
            const p = path.join(os.tmpdir(), 'dsb/timetables/' + getFile(table.src));
            return readFile(p).then(html => {
                spinner.text = "Extract tables...";
                const tables = new HtmlTableToJson(html.toString());
                spinner.text = "Extracted tables: " + tables.count;
                const headers = tables._headers;
                const contents = tables.results;
                const renderedTables = [];
                return Promise.map(headers, function (heads, index) {
                    if (heads.length === 0) return Promise.resolve();
                    let conts = contents[index];
                    return Promise.map(conts, function (line, index) {
                        for (key in line) {
                            if (line.hasOwnProperty(key)) {
                                if (line[key].trim() === "") {
                                    conts[index][key] = " --- ";
                                }
                            }
                        }
                        return Promise.resolve();
                    }).then(() => {
                        return new Promise((resolve) => {
                            //c.info(heads);
                            art.table({
                                width: process.stdout.columns,
                                columns: heads,
                                data: conts,
                                bars : 'double',
                                headerStyle : 'yellow',
                                dataStyle : 'bright_white',
                                borderColor : 'gray'
                            }, function (rendered) {
                                resolve(rendered);
                            });
                        }).then(rendered => {
                            renderedTables.push(rendered);
                            return Promise.resolve();
                        });
                    });
                }).then(() => {
                    spinner.text = "Render table #" + index;
                    timetables[index].tables = renderedTables;
                });
            });
        }).then(() => {
            return Promise.resolve(timetables);
        });
    } else {
        return Promise.resolve([]);
    }
}

function renderTiles(tiles, c) {
    if (tiles) {
        return Promise.map(tiles, (tile, index) => {
            spinner.text = "Render tile: " + tile.title;
            const p = path.join(os.tmpdir(), 'dsb/tiles/' + getFile(tile.detail));
            return font(tile.title, 'doom').then(rendered => {
                tiles[index].title = rendered;
                let img = new art.Image({
                    filepath: p,
                    alphabet: 'variant1'
                });
                let write = function () {
                    return new Promise((resolve, reject) => {
                        img.write(function (err, rendered) {
                            if (!err) {
                                resolve(rendered);
                            } else {
                                reject(err);
                            }
                        });
                    })
                };
                return write();
            }).then(rendered => {
                tiles[index].detail = rendered;
                spinner.text = "Rendered tile successfully.";
                return Promise.resolve();
            }).catch(e => {
                c.error(e);
                return Promise.resolve();
            });
        }).then(() => {
            return Promise.resolve(tiles);
        });
    } else {
        return Promise.resolve([]);
    }
}