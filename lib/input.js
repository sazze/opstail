var _ = require('lodash');
var log = require('./log');
var readline = require('readline');
var growl = require('growl');

module.exports = {
  inputMode: false,

  stdin: null,

  captureInput: function() {
    var self = this;

    this.stdin = process.openStdin();
    process.stdin.setRawMode(true);

    this.stdin.on('data', function(key) {
      if (self.inputMode) {
        return;
      }

      if (!_.isUndefined(process.stdout.clearLine)) {
        process.stdout.clearLine();
      }

      key = key.toString();

      self._handleInput.call(self, key);
    });
  },

  _handleInput: function(key) {
    switch(key) {
      // Error
      case 'e':
        this.toggleMessages('error');
        break;

      case 'E':
        this.toggleTracesByType('error');
        break;

      // Warn
      case 'w':
        this.toggleMessages('warn');
        break;

      case 'W':
        this.toggleTracesByType('warn');
        break;

      // Info
      case 'i':
        this.toggleMessages('info');
        break;

      case 'I':
        this.toggleTracesByType('info');
        break;

      // Debug
      case 'd':
        this.toggleMessages('debug');
        break;

      case 'D':
        this.toggleTracesByType('debug');
        break;

      // Verbose
      case 'v':
        this.toggleMessages('verbose');
        break;

      case 'V':
        this.toggleTracesByType('verbose');
        break;

      // Slack
      case 's':
        this.toggleMessages('slack');
        break;

      case 'S':
        this.toggleTracesByType('slack');
        break;

      case 't':
        this.toggleStackTraces();
        break;

      case 'm':
        this.toggleMetaInfo();
        break;

      case '/':
        this.turnOnSearchMode();
        break;

      case '\\':
        this.turnOnExclusionMode();
        break;

      case '\u0003':
        this.stop();
    }
  },

  toggleTracesByType: function(type) {
    this.options.tracesEnabled[type] = !this.options.tracesEnabled[type];

    this.reprintMessages(optionChangeMessage('Stack trace have been ' + (this.options.tracesEnabled[type] ? 'enabled' : 'disabled') + ' for ' + type + '!'));
  },

  toggleStackTraces: function() {
    this.options.tracesEnabled.all = !this.options.tracesEnabled.all;

    _.each(this.options.tracesEnabled, function(traces, key) {
      if (key === 'all') {
        return;
      }

      this.options.tracesEnabled[key] = this.options.tracesEnabled.all;
    }, this);

    this.reprintMessages(optionChangeMessage('Stack trace have been ' + (this.options.tracesEnabled.all ? 'enabled' : 'disabled') + '!'));
  },

  toggleMessages: function(type) {
    try {
      this.options[type] = !this.options[type];
      this.reprintMessages(optionChangeMessage((type.charAt(0).toUpperCase() + type.slice(1)) + ' Messages have been ' + (this.options[type] ? 'enabled' : 'disabled') + '!'));
    } catch(e) {
      console.log(e);
    }
  },

  toggleMetaInfo: function() {
    this.options.meta = !this.options.meta;

    this.reprintMessages(optionChangeMessage('Meta info has been ' + (this.options.meta ? 'enabled' : 'disabled') + '!'));
  },

  turnOnSearchMode: function() {
    this.inputMode = true;
    this.printMessages = false;

    // Need to remove the data listener otherwise we get duplicate listeners
    this.stdin.removeAllListeners('data');

    var rl = readline.createInterface(process.stdin, process.stdout);

    var self = this;
    rl.question('/', function (res) {
      // Reset Modes
      self.printMessages = true;
      self.inputMode = false;

      // Process Search
      self.filter = res.trim() || null;
      self.showFilteringMessage();

      // Close Readline and open capture input
      rl.close();
      self.captureInput();
    });
  },

  turnOnExclusionMode: function() {
    this.inputMode = true;
    this.printMessages = false;

    // Need to remove the data listener otherwise we get duplicate listeners
    this.stdin.removeAllListeners('data');

    var rl = readline.createInterface(process.stdin, process.stdout);

    var self = this;
    rl.question('\\', function (res) {
      // Reset Modes
      self.printMessages = true;
      self.inputMode = false;

      // Process Search
      self.excludeFilter = res || null;

      self.showFilteringMessage();

      // Close Readline and open capture input
      rl.close();
      self.captureInput();
    });
  },

  showFilteringMessage: function() {
    var msg = '';

    if (this.filter) {
      msg = 'Filtering by ' + this.filter;
    }

    if (this.filter && this.excludeFilter) {
      msg += ' and ';
    }

    if (this.excludeFilter) {
      msg += 'Excluding ' + this.excludeFilter;
    }

    if (!this.filter && !this.excludeFilter) {
      msg = 'Showing all messages';
    }

    this.reprintMessages(optionChangeMessage(msg));
  }
};

function optionChangeMessage(message) {
  if (global.growlEnabled) {
    growl(message);
  }

  return log.color('\n' + message + '\n', log.GREEN);
}

function logOptionChange(message) {
  console.log(optionChangeMessage(message));
}