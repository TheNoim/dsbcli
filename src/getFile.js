const {
    URL
} = require('url');
const path = require('path');

function getFile(url) {
    const murl = new URL(url);
    const purl = murl.pathname;
    return path.basename(purl);
}

module.exports = getFile;
