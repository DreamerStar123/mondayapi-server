// import modules
const fs = require('fs');
const monday = require('./modules/monday');
const analysis = require('./modules/analysis');
const mssql_query = require('./modules/mssql_query');

module.exports.addNewMatOrderData = async (board_id, logger) => {
    logger.info(`addNewMatOrderData(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/query-mat.txt', 'utf-8');
    const recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["po", "PO"],
        ["due_date", "Due_Date"],
        ["job_qty", "Job_Qty"],
        ["order_qty", "Order_Quantity"],
        ["act_qty", "Act_Qty"],
    ];

    // analysis.compareFields(items[0], recordset[0], fieldMatch);
    let res = analysis.analyzeData(items, recordset, fieldMatch);
    logger.info(`${res.validItemIds.length} matching items`);

    // add new items
    let newCount = 0;
    for (let i = 0; i < recordset.length; i++) {
        const record = recordset[i];
        const flag = res.recordFlags[i];
        if (!flag && record.Order_Quantity > record.Act_Qty) {
            const item_name = `${record.Job} (${record.Part_Number})`;
            const column_values = {
                vendor: record.Vendor,
                po: record.PO,
                due_date: record.Due_Date,
                job_qty: record.Job_Qty,
                order_qty: record.Order_Quantity,
                act_qty: record.Act_Qty,
            };
            if (record.PO)
                await monday.create_item(board_id, item_name, column_values, "ordered");
            else
                await monday.create_item(board_id, item_name, column_values, "unordered");
            newCount++;
        }
    }
    logger.info(`${newCount} items created`);

    let delCount = 0;
    for (const item of items) {
        if (item.order_qty.value <= item.act_qty.value) {
            await monday.delete_item(item.id);
        }
    }
    logger.info(`${delCount} items deleted`);
}
