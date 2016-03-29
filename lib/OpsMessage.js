"use strict";

var _ = require('lodash');
var log = require('./log');
var moment = require('moment');

function OpsMessage(message, options) {
  this.options = options;

  this.timestamp = message.time;
  this.microTime = message.microtime;
  this.message = message.msg;
  this.errorMsg = (typeof this.message.errorMsg === 'object' ? JSON.stringify(this.message.errorMsg).trim() : this.message.errorMsg.toString().trim());
  this.hostName = this.message.hostName;
  this.primaryHostName = this.message.primaryHostName;
  this.serverName = this.message.serverName;
  this.requestUri = this.message.requestUri;
  this.scriptFilename = this.message.scriptFilename;
  this.httpReferer = this.message.httpReferer;
  this.userAgent = this.message.userAgent;
  this.errorType = this.message.errorType;
  this.trace = this.message.trace;
  this.framework = this.message.framework || '';
  this.meta = message.meta || {};

  this.isSand = /^sand/i.test(this.framework);
}

module.exports = OpsMessage;

OpsMessage.prototype.getProperty = function getProperty(prop) {
  switch (prop) {
    case 'time':
      return moment(new Date(this.timestamp)).format(this.options.format.time);

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
    msg = msg.replace(matches[0], log.type(this.getProperty(prop), color))
  }.bind(this));

  return msg
};

OpsMessage.prototype.toString = function opsMessageToString() {
  if (!this.errorMsg || !_.isString(this.errorMsg)) {
    return '';
  }

  var message = this.formatMessage(this.options.format.msg);

  if (this.options.meta && (this.serverName || this.requestUri || this.scriptFilename)) {
    message += this.formatMessage(this.options.format.meta);
  }

  if (this.options.tracesEnabled[this.errorType] && this.trace) {
    message += log.type(this.trace.trim(), 'trace') + '\n';
  }

  return message + (this.options.doubleSpaced ? '\n' : '');
};

OpsMessage.prototype.debugString = function() {
  return JSON.stringify(this);
};