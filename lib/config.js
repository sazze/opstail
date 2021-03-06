module.exports = {
  host: '',
  port: 8151,
  routingKeys: {
    "all": "event.#",
    "error": "event.error.env.#",
    "syslog": "event.syslog.env.#"
  },

  formats: {
    "event.error.env.#": {
      time: {
        format: 'M/DD h:mm:ss A',
        utc: false
      },
      msg: '#{time} [#{host}] #{errorType}: #{errorMsg|errorType}\n',
      meta: '[#{serverName}] #{requestUri} (#{scriptFilename})[#{remoteIpAddress}]\n'
    },

    "event.syslog.env.#": {
      time: {
        format: 'M/DD h:mm:ss A',
        utc: false
      },
      msg: '#{time} [#{hostname|host}] #{syslogtag|errorType}: #{msg|errorType}\n',
      meta: '[facility:#{syslogfacility}] #{app-name} (#{procid})\n'
    }
  },

  format: {
    time: {
      format: 'M/DD h:mm:ss A',
      utc: false
    },
    msg: '#{time} [#{host}] #{errorType}: #{errorMsg|errorType}\n',
    meta: '[#{serverName}] #{requestUri} (#{scriptFilename})[#{remoteIpAddress}]\n'
  },

  ioOptions: {
    rememberUpgrade: true,
    transports: ['websocket']
  },

  // Default stack trace visibility settings
  tracesEnabled: {
    all: true,
    error: true,
    warn: false,
    info: false,
    debug: false,
    verbose: false,
    slack: false
  },

  // Default message visibility settings
  error: true,
  warn: true,
  info: true,
  debug: false,
  verbose: false,
  slack: false,

  // Server name filter regex
  serverName: '',

  errorTime: 10000, // in milliseconds
  growlTime: 10000, // in milliseconds
  growlNumNotifications: 5,
  growl: true,
  gitLabKey: '',
  checkForUpdatesTime: 1800000,
  numTraces: 50,
  doubleSpaced: true,

  // Message colors
  typeColors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'white',
    verbose: 'greenBright',
    slack: 'cyanBright',
    trace: 'cyan',
    time: 'blackBright',
    host: ''
  }
};