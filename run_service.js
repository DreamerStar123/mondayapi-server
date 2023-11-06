// import modules
const main = require('./main');
var cron = require('node-cron');
const winston = require("winston");

cron.schedule('0 23 * * Sun', main.snapshot, {
    scheduled: true,
    timezone: "America/New_York"
});

cron.schedule('0 * * * *', main.main, {
    scheduled: true,
    timezone: "America/New_York"
});