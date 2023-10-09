// import modules
const open_job = require('./open_job');
const machine_status = require('./machine_status');
const winston = require("winston");

const logger = winston.createLogger({
    transports: [new winston.transports.File({
        filename: 'logs.txt'
    }), new winston.transports.Console]
});

(async () => {
    logger.info(`============================== ${new Date().toISOString()} ==============================`);
    let startTime = performance.now();

    const openJobBoardId = 5249505765;
    const noJobBoardId = 5252735219;
    const machineStatusBoardId = 5240959201;

    await open_job.addNewOpenJobData(openJobBoardId, logger);
    await machine_status.updateMachineStatus(machineStatusBoardId, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
})();
