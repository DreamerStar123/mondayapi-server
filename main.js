// import modules
const open_job = require('./open_job');
const machine_status = require('./machine_status');
const mat_order = require('./mat_order');
const open_machine = require('./open_machine');
const not_bought = require('./not_bought');
const gantt = require('./gantt');
const winston = require("winston");

const logger = winston.createLogger({
    transports: [new winston.transports.File({
        filename: 'logs.txt'
    }), new winston.transports.Console]
});

module.exports.main = async () => {
    logger.info(`============================== ${new Date().toISOString()} ==============================`);
    let startTime = performance.now();

    const openJobBoardId = 5249505765;
    const noJobBoardId = 5252735219;
    const machineStatusBoardId = 5240959201;
    const rawMaterialOrdersBoardId = 5293869955;
    const openMachineBoardId = 5293870025;
    const nbrBoardId = 5333111913;
    const nbsBoardId = 5340444856;
    const nbhBoardId = 5338470037;
    const ganttBoardId = 5343813711;

    const proxy = false;

    await open_job.updateOpenJob(openJobBoardId, proxy, logger);
    await open_job.updateNoJob(noJobBoardId, proxy, logger);
    await machine_status.updateMachineStatus(machineStatusBoardId, proxy, logger);
    await mat_order.updateMatOrder(rawMaterialOrdersBoardId, proxy, logger);
    await open_machine.updateOpenMachine(openMachineBoardId, proxy, logger);
    await not_bought.updateNbr(nbrBoardId, proxy, logger);
    await not_bought.updateNbs(nbsBoardId, proxy, logger);
    await not_bought.updateNbh(nbhBoardId, proxy, logger);
    await gantt.updateGantt(ganttBoardId, proxy, logger);

    const seconds = (performance.now() - startTime) / 1000;
    logger.info(`****************************** Elapsed time: ${seconds} seconds. ******************************`);
}