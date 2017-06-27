module.exports = function (json) {
  const winston = require('winston');

  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    json: !!json,
    colorize: true,
    prettyPrint: true,
    humanReadableUnhandledException: true,
    stringify: true,
    timestamp: true
  });

  return winston;
};
