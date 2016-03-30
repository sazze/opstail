"use strict";

var _ = require('lodash');
var OpsMessage = require('./OpsMessage');
var input = require('./input')
var log = require('./log');
var clc = require('cli-color');
var os = require('os');
var growl = require('growl');

var client = require('socket.io-client');

function Ops(options) {
  this.options = options;
  this.numNotification = 0;
  this.lastGrowlTime = 0;
  this.lastErrorTime = 0;

  this.messages = [];
}

module.exports = Ops;

Ops.prototype = {
  printMessages: true,
  filter: null,
  excludeFilter: null,

  _socket: null,

  /**
   * Connect to amqp then bind to routing keys
   */
  start: function() {
    log(clc.reset);
    log('Welcome to OpsTail ' + require('../package.json').version, log.GREEN);
    process.once('SIGINT', this.stop.bind(this));
    this._connect();
    this.captureInput();
  },

  stop: function(exit, cb) {
    if (_.isUndefined(exit)) {
      exit = true;
    }

    if (_.isFunction(exit)) {
      cb = exit;
      exit = true;
    }

    if (_.isUndefined(cb)) {
      cb = _.noop;
    }

    process.removeAllListeners();

    if (!this._socket) {
      cb();
      if (exit) {
        process.exit(0);
      }
      return;
    }

    try {
      this._emitEventToRoutingKeys('stop', this.options.keys);
      this._socket.close();
      cb();
      if (exit) {
        process.exit(0);
      }
    } catch (e) {}
  },

  _getConsumeMessage: function(routingKey) {
    return { routingKey: routingKey };
  },

  /**
   * Connect to AMQP, then call _bindQueue
   *
   * @private
   */
  _connect: function() {
    var url = `ws://${this.options.host}:${this.options.port}`;
    log('Connecting to ' + url, log.GREEN);

    this._socket = client(url, {
      rememberUpgrade:true,
      transports: ['websocket']
    });

    this._socket.on('connect', function() {
      this._emitEventToRoutingKeys('consume', this.options.keys)
    }.bind(this));

    this._socket.on('reconnect_attempt', function () {
      log('reconnecting...', log.YELLOW)
    });

    this._socket.on('event', this._handleMessage.bind(this));

    this._socket.on('disconnect', function () {
      log('Connection closed', log.YELLOW);
    });

    this._socket.on('error', this._handleError.bind(this));
  },

  /**
   * Handle amqp errors
   *
   * @param {Error} err - the error
   * @private
   */
  _handleError: function(err) {
    var msg = err.stack || err.message || err;
    if (this.filter) {
      var regex = new RegExp(this.filter, 'ig');

      if(!regex.test(msg)) {
        this._connect(this.options.url);
        return;
      }

    }

    log(msg, log.RED, true);
    this._connect(this.options.url);
  },

  _emitEventToRoutingKeys(event, routingKeys) {
    if (!this._socket) {
      return;
    }

    _.each(routingKeys, (key) => {
      var routingKey = this.options.routingKeys[key] || key; // Get key shortcut or fallback to entered key

      if (_.isArray(routingKey)) {
        return this._sendMessageToRoutingKeys(routingKey);
      }

      if (event == 'consume') {
        log('Binding to: ' + routingKey, log.GREEN, true);
      }

      this._socket.emit(event, this._getConsumeMessage(routingKey));
    });

    log('')
  },

  /**
   * Handle the amqp message
   *
   * @param message - AMQP Message
   * @private
   */
  _handleMessage: function(message) {
    // Create new message
    try {
      var opsMessage = new OpsMessage(message, this.options);
    } catch(err) {
      var msg = err.stack || err.message || err;
      if (this.filter) {
        var regex = new RegExp(this.filter, 'ig');

        if(!regex.test(msg)) {
          return;
        }

      }

      log(msg, log.RED, true);
      return;
    }

    if (!this._isTypeEnabled(opsMessage.levelType)) {
      return;
    }

    if (this.options.serverName && !this.options.serverName.test(opsMessage.serverName)) {
      return;
    }

    this.messages.push(opsMessage);

    if (opsMessage.levelType == 'error') {
      this.numNotification++;
      var currentTime = (new Date()).getTime();

      if (global.growlEnabled && this.numNotification >= this.options.growlNumNotifications) {
        if (currentTime - this.lastGrowlTime >= this.options.growlTime && currentTime - this.lastErrorTime <= this.options.errorTime) {
          growl('Urgent: ' + this.numNotification + ' new Errors', {name: 'OpsTail'});
          this.numNotification = 0;
          this.lastGrowlTime = currentTime;
        }
      }

      this.lastErrorTime = currentTime;
    }

    var freeMemory = os.freemem() / 1024 / 1024; // Convert bytes to MB

    // are we over buffer limit
    if (freeMemory < this.options.bufferLimit) {
      // Lets delete 10%
      this.messages = this.messages.slice(this.messages.length - Math.ceil(this.messages.length / 10));
    }

    // Print message
    this._printMessage(opsMessage);
  },

  /**
   * Print the the message to stdout and possible
   * filter based on type
   *
   * @param {OpsMessage} opsMessage - OpsMessage object
   * @private
   */
  _printMessage: function(opsMessage) {
    if ((!this._isTypeEnabled(opsMessage.levelType)) || !this.printMessages) {
      return;
    }

    var msg = opsMessage.toString();

    if (this.filter) {
      var regex = new RegExp(this.filter, 'ig');

      if(!regex.test(msg) && !regex.test(opsMessage.debugString())) {
        return;
      }
    }

    if (this.excludeFilter) {
      var exRegex = new RegExp(this.excludeFilter, 'ig');

      if (exRegex.test(msg) || exRegex.test(opsMessage.debugString())) {
        return;
      }
    }

    process.stdout.write(msg.trim() + '\n');
  },

  _isTypeEnabled: function(type) {
    return this.options[type];
  },

  /**
   * Clears the screen and
   * reprints all messages in
   * buffer
   *
   * @param {string} preMessage - a message to print after screen clear
   */
  reprintMessages: function(preMessage) {
    console.log(clc.reset);

    var count = 0;

    var original = _.clone(this.options.tracesEnabled);

    _.each(this.messages, function(msg) {
      // If we are printing a lot, don't print traces
      try {
        if (this.options.numTraces && count < (this.messages.length - this.options.numTraces)) {
          this.options.tracesEnabled[msg.levelType] = false;
        } else {
          this.options.tracesEnabled[msg.levelType] = original[msg.levelType];
        }
      } catch (e) {}

      this._printMessage(msg);
      count++;
    }.bind(this));

    if (preMessage) {
      console.log(preMessage);
    }
  }
};

_.extend(Ops.prototype, input);