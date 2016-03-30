opstail
========

OpsTail allows you to 'tail' the logs coming from the firehose

The easiest thing to do is just run `opstail` from the terminal.

You can see the different options with `-h` or `--help` flag

To view a list of routing key run `opstail -l`

Growl Notifications
===================
To get growl notifications turned on you need to have the correct library.
### Mac OSX (Darwin)
Install [growlnotify(1)](http://growl.info/extras.php#growlnotify). On OS X 10.8, Notification Center is supported using [terminal-notifier](https://github.com/alloy/terminal-notifier). To install:

``` bash
$ sudo gem install terminal-notifier
```

### Ubuntu (Linux):
Install `notify-send` through the [libnotify-bin](http://packages.ubuntu.com/libnotify-bin) package:

``` bash
$ sudo apt-get install libnotify-bin
```

### Windows:
Download and install [Growl for Windows](http://www.growlforwindows.com/gfw/default.aspx)
Download [growlnotify](http://www.growlforwindows.com/gfw/help/growlnotify.aspx) - **IMPORTANT :** Unpack growlnotify to a folder that is present in your path!


Installation
------------

Install with `npm`:

``` bash
$ npm install -g opstail
```

Key Commands
============
There are also several key commands you can use

| Key | Description |
| --- | ----------- |
| / | Enter into filter mode, just enter a regex (Enter nothing to clear search) |
| \ | Enter into exclusion filter mode. Just enter a regex and the message will be excluded |
| t | Toggle All Stack Traces |
| m | Toggle Meta Data |
| i | Toggle info messages |
| w | Toggle warn messages |
| e | Toggle Error Messages |
| d | Toggle Debug Messages |
| shift + i | Toggle Info Stack Traces |
| shift + w | Toggle Warn Stack Traces |
| shift + e | Toggle Error Stack Traces |
| shift + d | Toggle Debug Stack Traces |

What's New
==========

1.1.0
-----
- Now supports different formats based on RoutingKey
- Now supports levelType from sand

1.0.3
-----
- Fixed reprinting of messages

1.0.2
-----
- Now supports utc with config options for time format

1.0.1
-----
- Fixed bug with time formats

1.0.0
-----
- Open Sourced OpsTail
- Now uses websockets to connect to EventsD

0.6.1
-----
- Only error stack traces are enabled by default
- Limits number of stack traces to be reprinted to 50, can be changed with `numTraces`

0.6.0
-----
- Now automatically updates itself (in order for auto update to work you need to add
  gitLabKey to your config file. You can find it [here](http://gitlab.sazze.com/profile/account)
- Improved options

0.5.0
-----
- You can now pass a config file with --config
- Reads config file in ./.opstail and ~/.opstail

0.4.1
-----
- Now listen to error and close event
- tries to reconnect on error

0.4.0
-----
- Added growl notifications

0.3.0
-----
- Added Exclusion Filtering. Type a `\` and you can exclude messages from the results. Stacks on top of
  the  `/` inclusion filter. Type a blank message to remove the filter.

0.2.2
-----
- Shortened the timestamp
- Swapped hostname and timestamp colors
- Added new line between messages

0.2.1
-----
- Added script filename to meta data

0.2.0
-----
- Added ability to filter your searches by a regex. Just type a `/` and then a regex without a delimiter.
  All filters are global and case insensitive. To clear your filter just type `/` then hist enter with a empty
  search.

0.1.0
-----
 - Changed the buffer limit from number of items to free memory in MB