"use strict";

var _ = require('lodash');
var log = require('./log');
var moment = require('moment');
var eventsd = require('eventsd');

function OpsMessage(message, options) {
  _.extend(this, message);
  _.extend(this, this.msg);
  delete this.msg;
  this.options = options;
  this.errorMsg = (typeof this.errorMsg === 'object' ? JSON.stringify(this.errorMsg).trim() : this.errorMsg.toString().trim());
  this.isSand = /^sand/i.test(this.framework);

  this.levelType = this.levelType || this.errorType;
}

module.exports = OpsMessage;

OpsMessage.prototype.getProperty = function getProperty(prop) {
  var format = this.getFormat();
  switch (prop) {
    case 'time':
      var timeOptions = format.time;
      if (_.isString(timeOptions)) {
        timeOptions = { format: timeOptions }
      }

      var m = moment(new Date(this.time));
      if (timeOptions.utc) {
        m = m.utc();
      }

      return m.format(timeOptions.format);

    case 'host':
      return this.hostName;

    default:
      return _.property(prop)(this);
  }
};

OpsMessage.prototype.formatMessage = function formatMessage(msg) {
  var fmtMatches = msg.match(/#{([\w\.]+)\|?(\w+)?}/ig);

  _.each(fmtMatches, function(match) {
    var matches = match.match(/#{([\w\.]+)\|?(\w+)?}/);
    if (!matches) {
      return;
    }

    var prop = matches[1];
    var color = matches[2] || prop;
    try {
      msg = msg.replace(matches[0], log.type(this.getProperty(prop), color))
    } catch(e) {
      log("Invalid format string message", log.RED, true);
    }
  }.bind(this));

  return msg
};

OpsMessage.prototype.getFormat = function() {
  var formats = this.options.formats;
  var format = this.options.format;
  var routingKey = this.routingKey;


  for (var key in formats) {
    if (!formats.hasOwnProperty(key)) {
      continue;
    }

    if (eventsd.getRoutingKeyRegExp(key).test(routingKey)) {
      format = _.defaults(formats[key], format);
      break;
    }
  }

  return format;
};

OpsMessage.prototype.toString = function opsMessageToString() {
  var format = this.getFormat();

  var message = _.isFunction(format.msg) ? format.msg(this, log) : this.formatMessage(this.options.format.msg);

  if (this.options.meta) {
    message += _.isFunction(format.meta) ? format.meta(this, log) : this.formatMessage(this.options.format.meta);
  }

  if ((this.options.tracesEnabled[this.levelType] || this.options.tracesEnabled[this.levelType]) && this.trace) {
    message += log.type(this.trace.trim(), this.levelType) + '\n';
  }

  return message + (this.options.doubleSpaced ? '\n' : '');
};

OpsMessage.prototype.debugString = function() {
  return JSON.stringify(this);
};