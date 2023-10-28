// import modules
const work_act = require('./work_act');
var cron = require('node-cron');
const winston = require("winston");

const logger = winston.createLogger({
    transports: [new winston.transports.File({
        filename: 'logs.txt'
    }), new winston.transports.Console]
});

cron.schedule('0,15,30,45 * * * *', async () => {
    logger.info(`============================== ${new Date().toISOString()} ==============================`);
    let startTime = performance.now();

    const machineStatusBoardId = 5240959201;
    const workActBoardId = 5382069579;

    const proxy = false;

    await work_act.updateWorkAct(workActBoardId, machineStatusBoardId, proxy, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
}, {
    scheduled: true,
    timezone: "America/New_York"
});