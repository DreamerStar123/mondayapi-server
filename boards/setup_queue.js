// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const mssql_query = require('../modules/mssql_query');

module.exports.update = async (board_id, proxy, logger) => {
    logger.info(`=====> setup_queue.update(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/2-machine_status.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    // update items
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["po", "PO"],
        ["due_date", "Due_Date"],
        ["order_qty", "Order_Quantity"],
        ["act_qty", "Act_Qty"],
        ["type", "Type"],
    ];

    let updatedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        let record = recordset.find(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Job);
        });
        if (record) {
            matchCount++;
            if (!analysis.compareFields(item, record, fieldMatch)) {
                const column_values = {
                    vendor: record.Vendor,
                    po: record.PO,
                    due_date: record.Due_Date,
                    order_qty: record.Order_Quantity,
                    act_qty: record.Act_Qty,
                    type: record.Type,
                };
                // console.log(item, record);
                await monday.change_multiple_column_values(item.id, board_id, column_values);
                updatedCount++;
            }
        }
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);
}