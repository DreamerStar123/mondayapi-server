// import modules
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

    const rawMaterialOrdersBoardId = 5293869955;
    const openMachineBoardId = 5293870025;

    // await mat_order.addNewMatOrderData(rawMaterialOrdersBoardId, logger);
    await open_machine.addNewOpenMachineData(openMachineBoardId, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
})();
