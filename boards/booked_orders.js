// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const transform = require('../modules/transform');
const mssql_query = require('../modules/mssql_query');
const { getSOStatus } = require('../modules/status_code');

const getColumnValues = (record) => {
    const column_values = {
        so_line: record.SO_Line,
        order_date: record.Order_Date,
        status: getSOStatus(record.Status),
        shipped_qty: record.Shipped_Qty,
        open_qty: record.Open_Qty,
        due_date1: record.Promised_Date,
        order_qty1: record.Order_Qty,
    };
    return column_values;
}

const updateGroup = async (board_id, items, recordset, logger) => {
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

    // let deletedCount = 0;
    // let recordCount = recordset.length;
    // for (const item of items) {
    //     let index = recordset.findIndex(record => {
    //         let name = item.name;
    //         let pos = name.indexOf("(");
    //         if (pos !== -1)
    //             name = name.substr(0, pos).trim();
    //         return name === record.Job && analysis.compareFields(item, record, fieldMatch);
    //     });
    //     const record = recordset[index];
    //     if (index !== -1) {
    //         recordset.splice(index, 1);
    //     } else {
    //         await monday.delete_item(item.id);
    //         deletedCount++;
    //     }
    // }
    // logger.info(`${deletedCount}/${recordCount} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        const item_name = `${record.Sales_Order} (${record.Material})`;
        await monday.create_item(board_id, item_name, getColumnValues(record));
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateBookedOrders = async (board_id, proxy, logger) => {
    logger.info(`=====> updateBookedOrders(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${items.length} items`);

    // read mssql data
    const query_today = fs.readFileSync('query/8-booked_orders.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query_today);
    else
        recordset = await mssql_query.getResultFromSQLServer(query_today);
    logger.info(`${recordset.length} records`);

    await updateGroup(board_id, items, recordset, logger);
}