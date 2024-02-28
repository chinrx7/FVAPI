const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./configure/config.json', 'utf8'));

exports.config = config;