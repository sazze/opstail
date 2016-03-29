var fs = require('fs');
var _ = require('lodash');

var util = module.exports = {
  parseConfig: function(path) {
    if (!fs.existsSync(path)) {
      console.log(path);
      return false;
    }

    var data = fs.readFileSync(path, 'utf8');
    data = JSON.parse(data);

    return data;
  },

  getUserHome: function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }
};