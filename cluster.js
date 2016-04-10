// Include the cluster module
var cluster = require('cluster');
var config = require('./config/local');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;
    console.log("all:", cpuCount);
    var cpuCount = Math.ceil(cpuCount * 4 / 4);
    console.log("used:", cpuCount);

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function(worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        if (worker.id < 10) {
            cluster.fork();
        }

    });

    // Code to run if we're in a worker process
} else {
    var server = require("./server").server;
    server({
        log: config.middleware.logger_dev
    });
}