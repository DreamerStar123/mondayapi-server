// import modules
const newjob = require('./newjob');
var cron = require('node-cron');
const winston = require("winston");

const logger = winston.createLogger({
    transports: [new winston.transports.File({
        filename: 'logs.txt'
    }), new winston.transports.Console]
});

cron.schedule('0 0 * * *', async () => {
    logger.info(`============================== ${new Date().toISOString()} ==============================`);
    let startTime = performance.now();

    const openJobBoardId = 5249505765;
    const noJobBoardId = 5252735219;
    await newjob.addNewOpenJobData(openJobBoardId, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
}, {
    scheduled: true,
    timezone: "America/New_York"
});
