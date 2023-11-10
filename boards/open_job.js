// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const mssql_query = require('../modules/mssql_query');
const {
    getSOStatus,
} = require('../modules/status_code');
const {
    getShipDate,
    checkAfterYesterday
} = require('../modules/utils');

const getColumnValues_Open = (record) => {
    let dueDate = new Date(record.Promised_Date);
    let shipDate = getShipDate(dueDate);
    dueDate = dueDate.toISOString().substr(0, 10);
    shipDate = shipDate.toISOString().substr(0, 10);

    const column_values = {
        date4: dueDate,
        date: shipDate,
        text: record.Sales_Order,
        text0: record.SO_Line,
        status3: getSOStatus(record.SO_Status),
        numbers: record.Order_Qty,
        numbers1: record.Shipped_Qty,
        numbers7: record.Open_Qty
    };
    return column_values;
}

const getColumnValues_No = (record) => {
    let dueDate = new Date(record.Promised_Date);
    let shipDate = getShipDate(dueDate);
    dueDate = dueDate.toISOString().substr(0, 10);
    shipDate = shipDate.toISOString().substr(0, 10);

    const column_values = {
        due_date: dueDate,
        ship_date: shipDate,
        // sales_order: record.Sales_Order,
        so_line: record.SO_Line,
        status: getSOStatus(record.Status),
        order_qty: record.Order_Qty,
        shipped_qty: record.Shipped_Qty,
        open_qty: record.Open_Qty,
        hand_qty: record.On_Hand_Qty,
        part_number: record.Material,
    };
    return column_values;
}

module.exports.updateOpenJob = async (board_id, proxy, logger) => {
    logger.info(`=====> updateOpenJob(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        logger.info('getItems failed');
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/1-open_job.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["date4", "Promised_Date"],
        ["text", "Sales_Order"],
        ["text0", "SO_Line"],
        ["numbers", "Order_Qty"],
        ["numbers1", "Shipped_Qty"],
        ["numbers7", "Open_Qty"],
        ["status3", "SO_Status"],
    ];

    let updatedCount = 0;
    let deletedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        if (item.status3.value === 'Shipped') {
            await monday.delete_item(item.id);
            deletedCount++;
            continue;
        }

        let index = recordset.findIndex(record => item.text.value === record.Sales_Order && item.text0.value === record.SO_Line);
        let record = recordset[index];
        if (index !== -1) {
            recordset.splice(index, 1);
            matchCount++;
        } else {
            console.log(`${item.name} doesn't match`);
        }
        if (record && !analysis.compareFields(item, record, fieldMatch)) {
            if (record.SO_Status === 'Shipped') {
                await monday.delete_item(item.id);
                deletedCount++;
            } else {
                await monday.change_multiple_column_values(item.id, board_id, getColumnValues_Open(record));
                updatedCount++;
            }
        }
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);
    logger.info(`${deletedCount}/${matchCount} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        if (checkAfterYesterday(record.Last_Updated) &&
            ((record.SO_Status === 'Open' && record.Order_Qty - record.Shipped_Qty !== 0 && record.Job_Status === 'Active') ||
                record.SO_Status === 'Backorder')) {
            const item_name = `${record.Job} (${record.Part_Number})`;
            await monday.create_item(board_id, item_name, getColumnValues_Open(record));
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateNoJob = async (board_id, proxy, logger) => {
    logger.info(`=====> updateNoJob(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        logger.info('getItems failed');
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/1-no_job.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["due_date", "Promised_Date"],
        ["order_qty", "Order_Qty"],
        ["shipped_qty", "Shipped_Qty"],
        ["open_qty", "Open_Qty"],
        ["status", "Status"],
        ["hand_qty", "On_Hand_Qty"],
        ["part_number", "Material"],
    ];

    let updatedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        let index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Sales_Order && item.so_line.value === record.SO_Line);
        });
        let record = recordset[index];
        if (index !== -1) {
            recordset.splice(index, 1);
            matchCount++;
        }
        if (record && !analysis.compareFields(item, record, fieldMatch)) {
            // console.log(item, record);
            await monday.change_multiple_column_values(item.id, board_id, getColumnValues_No(record));
            updatedCount++;
        }
    }
    logger.info(`${updatedCount}/${items.length} items updated`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        if (record.Order_Qty - record.Shipped_Qty > 0 &&
            (record.Status === 'Open' || record.Status === 'Backorder') &&
            !record.Job) {
            const item_name = `${record.Sales_Order} (${record.Material})`;
            await monday.create_item(board_id, item_name, getColumnValues_No(record));
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}