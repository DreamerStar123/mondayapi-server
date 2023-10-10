// import modules
const fs = require('fs');
const monday = require('./modules/monday');
const analysis = require('./modules/analysis');
const mssql_query = require('./modules/mssql_query');

module.exports.addNewOpenJobData = async (board_id, logger) => {
    logger.info(`addNewOpenJobData(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        logger.info('getItems failed');
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/open_job.sql', 'utf-8');
    const recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["date4", "Promised_Date"],
        ["text", "Sales_Order"],
        ["text0", "SO_Line"],
        ["numbers", "Order_Qty"],
        ["numbers1", "Shipped_Qty"],
        ["numbers7", "Open_Qty"],
    ];

    let res = analysis.analyzeData(items, recordset, fieldMatch);
    logger.info(`${res.validItemIds.length} matching items`);

    // add new items
    let newCount = 0;
    for (let i = 0; i < recordset.length; i++) {
        const record = recordset[i];
        const flag = res.recordFlags[i];
        if (!flag) {
            let item_name = "No job";
            let status = 5;
            if (record.Job) {
                item_name = `${record.Job} (${record.Part_Number})`;
                if (record.SO_Status === 'Backorder')
                    status = 2;
            } else {
                if (record.SO_Status === 'Backorder')
                    status = 1;
                else if (record.SO_Status === 'Open')
                    status = 0;
            }
            let dueDate = new Date(record.Promised_Date);
            let shipDate = new Date(dueDate);
            shipDate.setDate(shipDate.getDate() - 1);
            if (shipDate.getDay() == 5 || shipDate.getDay() == 6)
                shipDate.setDate(shipDate.getDate() - (shipDate.getDay() - 4));
            dueDate = dueDate.toISOString().substr(0, 10);
            shipDate = shipDate.toISOString().substr(0, 10);

            const column_values = {
                date4: dueDate,
                date: shipDate,
                text: record.Sales_Order,
                text0: record.SO_Line,
                status3: status,
                numbers: record.Order_Qty,
                numbers1: record.Shipped_Qty,
                numbers7: record.Open_Qty
            };
            await monday.create_item(board_id, item_name, column_values);
            newCount++;
        }
    }
    logger.info(`${newCount} items created`);
}