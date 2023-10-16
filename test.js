// import modules
const open_job = require('./open_job');
const machine_status = require('./machine_status');
const mat_order = require('./mat_order');
const open_machine = require('./open_machine');
const winston = require("winston");

const logger = winston.createLogger({
    transports: [new winston.transports.File({
        filename: 'logs-test.txt'
    }), new winston.transports.Console]
});

(async () => {
    logger.info(`============================== ${new Date().toISOString()} ==============================`);
    let startTime = performance.now();

    const openJobBoardId = 5249505765;
    const noJobBoardId = 5252735219;
    const machineStatusBoardId = 5240959201;
    const rawMaterialOrdersBoardId = 5293869955;
    const openMachineBoardId = 5293870025;

    // const openJobBoardId = 1293185486;
    // const machineStatusBoardId = 1293185622;
    // const rawMaterialOrdersBoardId = 1293185685;
    // const openMachineBoardId = 1293186060;

    const proxy = true;

    await open_job.updateOpenJob(openJobBoardId, proxy, logger);
    await machine_status.updateMachineStatus(machineStatusBoardId, proxy, logger);
    await mat_order.updateMatOrder(rawMaterialOrdersBoardId, proxy, logger);
    await open_machine.updateOpenMachine(openMachineBoardId, proxy, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
})();
