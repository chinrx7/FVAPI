var Service = require('node-windows').Service;
var svc = new Service({
    name:'FV API',
    description: 'Service for all solar of this universe.',
    script: 'D:\\FVApp\\FVAPI\\app.js'
});

svc.on('install',function(){
    svc.start();
});

svc.install();