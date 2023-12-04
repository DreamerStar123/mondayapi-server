// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const transform = require('../modules/transform');
const mssql_query = require('../modules/mssql_query');
const {
    getSOStatus
} = require('../modules/status_code');
const {
    dateString
} = require('../modules/utils');

function getColumnValues(record, rsun) {
    const column_values = {
        so_line: record.SO_Line,
        order_date: record.Order_Date,
        status: getSOStatus(record.Status),
        shipped_qty: record.Shipped_Qty,
        open_qty: record.Open_Qty,
        due_date1: rsun.Promised_Date,
        order_qty1: rsun.Order_Qty,
        due_date2: record.Promised_Date,
        order_qty2: record.Order_Qty,
    };
    return column_values;
}

const updateGroup = async (board_id, sun_rs, recordset, logger) => {
    // analyze data
    const fieldMatch = [
        ["so_line", "SO_Line"],
        ["order_date", "Order_Date"],
        ["status", "Status"],
        ["shipped_qty", "Shipped_Qty"],
        ["open_qty", "Open_Qty"],
        ["due_date1", "Promised_Date"],
        ["order_qty1", "Order_Qty"],
    ];

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        let rsun = sun_rs.find(rsun => {
            return record.Sales_Order === rsun.Sales_Order && record.SO_Line === rsun.SO_Line;
        });
        if (rsun && (dateString(record.Promised_Date) != rsun.Promised_Date || record.Order_Qty != rsun.Order_Qty)) {
            const item_name = `${record.Sales_Order} (${record.Material})`;
            await monday.create_item(board_id, item_name, getColumnValues(record, rsun));
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.update = async (board_id, proxy, logger) => {
    logger.info(`=====> booked_orders.update(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${items.length} items`);

    for (const item of items)
        await monday.delete_item(item.id);
    logger.info(`board cleaned`);

    const sun_rs = JSON.parse(fs.readFileSync('data/8-booked_orders.json', 'utf-8'));
    const query = fs.readFileSync('query/8-booked_orders.sql', 'utf-8');
    let recordset;
        logger.info(proxy);

    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${sun_rs.length} sunday records`);
    logger.info(`${recordset.length} current records`);
        console.log(recordset.length);
    await updateGroup(board_id, sun_rs, recordset, logger);
}

module.exports.snapshot = async (proxy, logger) => {
    logger.info(`=====> booked_orders.snapshot()`);
    const query = fs.readFileSync('query/8-booked_orders.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);
    fs.writeFileSync('data/8-booked_orders.json', JSON.stringify(recordset), 'utf-8');
}
