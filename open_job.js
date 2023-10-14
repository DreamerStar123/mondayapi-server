// import modules
const fs = require('fs');
const monday = require('./modules/monday');
const analysis = require('./modules/analysis');
const mssql_query = require('./modules/mssql_query');

const getStatus = (record) => {
    let status = 5;
    if (record.Job) {
        if (record.SO_Status === 'Backorder')
            status = 2;
    } else {
        if (record.SO_Status === 'Backorder')
            status = 1;
        else if (record.SO_Status === 'Open')
            status = 0;
    }
    return status;
}

const getColumnValues = (record) => {
    let status = getStatus(record);
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
    const query = fs.readFileSync('query/open_job.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
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
        ["status3", "SO_Status"],
    ];

    let updatedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        let index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Job);
        });
        let record = recordset[index];
        if (index !== -1) {
            recordset.splice(index, 1);
            matchCount++;
        }
        if (record && !analysis.compareFields(item, record, fieldMatch)) {
            // console.log(item, record);
            await monday.change_multiple_column_values(item.id, board_id, getColumnValues(record));
            updatedCount++;
        }
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        const item_name = `${record.Job} (${record.Part_Number})`;
        await monday.create_item(board_id, item_name, getColumnValues(record));
        newCount++;
    }
    logger.info(`${newCount} items created`);
}