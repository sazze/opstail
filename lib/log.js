var _ = require('lodash');
var clc = require('cli-color');
var growl = require('growl');
var hash = require('string-hash');

function log(message, color, showGrowl) {
  if (!_.isUndefined(showGrowl) && global.growlEnabled) {
    growl(message);
  }

  if (!_.isUndefined(clc[color])) {
    message = clc[color](message);
  }

  console.log(message);
}

module.exports = log;

log.BLACK = 'black';
log.RED = 'red';
log.GREEN = 'green';
log.YELLOW = 'yellow';
log.BLUE = 'blue';
log.MAGENTA = 'magenta';
log.CYAN = 'cyan';
log.DARK_CYAN = 'cyanBright';
log.DARK_GRAY = 'blackBright';
log.WHITE = 'white';
log.DEFAULT = '';

log.TYPE_COLORS = {
  error: log.RED,
  warn: log.YELLOW,
  info: log.BLUE,
  debug: log.MAGENTA,
  verbose: log.GREEN,
  slack: log.DARK_CYAN,
  trace: log.CYAN,
  timestamp: log.DARK_GRAY,
  host: log.DEFAULT
};

log.COLORS = [
  log.RED,
  log.GREEN,
  log.YELLOW,
  log.BLUE,
  log.MAGENTA,
  log.CYAN
];

log.color = function(message, color) {
  if (color && !_.isUndefined(clc[color])) {
    message = clc[color](message);
  }

  return message;
};

log.type = function(message, type) {
  var color = log.TYPE_COLORS[type];

  if (color) {
    return log.color(message, color);
  } else if (type === 'random') {
    return log.color(message, log.COLORS[hash(message) % log.COLORS.length]);
  }

  return message;
};