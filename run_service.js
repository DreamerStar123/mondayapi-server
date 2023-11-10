// import modules
const main = require('./main');
var cron = require('node-cron');
const winston = require("winston");

cron.schedule('0,15,30,45 * * * *', main.onQuarter, {
    scheduled: true,
    timezone: "America/New_York"
});

cron.schedule('0 23 * * Sun', main.onSunday, {
    scheduled: true,
    timezone: "America/New_York"
});

cron.schedule('0 * * * *', main.main, {
    scheduled: true,
    timezone: "America/New_York"
});