// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const mssql_query = require('../modules/mssql_query');

module.exports.updateMatOrder = async (board_id, proxy, logger) => {
    logger.info(`=====> updateMatOrder(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/3-mat_order.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    // group by job
    let groupRecords = [];
    while (recordset.length > 0) {
        let row = recordset.shift();
        const equalJobs = recordset.filter(record => row.Job === record.Job);
        for (const record of equalJobs) {
            row.Vendor = row.Vendor || record.Vendor;
            row.PO = row.PO || record.PO;
            row.Due_Date = row.Due_Date || record.Due_Date;
            row.Job_Qty = row.Job_Qty || record.Job_Qty;
            row.Order_Quantity = row.Order_Quantity || record.Order_Quantity;
            row.Act_Qty = (row.Act_Qty || 0) + record.Act_Qty;
        }
        groupRecords.push(row);
        recordset = recordset.filter(record => row.Job !== record.Job);
    }
    logger.info(`${groupRecords.length} group records`);

    // analyze data
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["po", "PO"],
        ["due_date", "Due_Date"],
        ["job_qty", "Job_Qty"],
        ["order_qty", "Order_Quantity"],
        ["act_qty", "Act_Qty"],
        ["issued_by", "Issued_By"],
    ];

    let updatedCount = 0;
    let deletedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        let index = groupRecords.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Job);
        });
        const record = groupRecords[index];
        if (index !== -1) {
            groupRecords.splice(index, 1);
            matchCount++;
        }
        if (record) {
            if (!analysis.compareFields(item, record, fieldMatch)) {
                const column_values = {
                    vendor: record.Vendor,
                    po: record.PO,
                    due_date: record.Due_Date,
                    job_qty: record.Job_Qty,
                    order_qty: record.Order_Quantity,
                    act_qty: record.Act_Qty,
                    issued_by: record.Issued_By,
                };
                await monday.change_multiple_column_values(item.id, board_id, column_values);
                updatedCount++;
            }
        } else {
            await monday.delete_item(item.id);
            deletedCount++;
        }
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);
    logger.info(`${deletedCount}/${matchCount} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of groupRecords) {
        const item_name = `${record.Job} (${record.Part_Number})`;
        const column_values = {
            vendor: record.Vendor,
            po: record.PO,
            due_date: record.Due_Date,
            job_qty: record.Job_Qty,
            order_qty: record.Order_Quantity,
            act_qty: record.Act_Qty,
            issued_by: record.Issued_By,
        };
        if (record.PO)
            await monday.create_item(board_id, item_name, column_values, "ordered");
        else
            await monday.create_item(board_id, item_name, column_values, "unordered");
        newCount++;
    }
    logger.info(`${newCount}/${groupRecords.length} items created`);
}