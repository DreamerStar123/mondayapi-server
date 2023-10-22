// import modules
const fs = require('fs');
const monday = require('./modules/monday');
const analysis = require('./modules/analysis');
const mssql_query = require('./modules/mssql_query');
const {
    getSOStatus
} = require('./modules/status_code');

module.exports.updateGantt = async (board_id, proxy, logger) => {
    logger.info(`=====> updateGantt(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/6-gantt.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["due_date", "Promised_Date"],
        ["customer", "Customer"],
        // ["material", "Material"],
        ["order_qty", "Order_Qty"],
        ["shipped_qty", "Shipped_Qty"],
        ["delta", "Delta"],
        ["status", "Status"],
        ["onhand_qty", "On_Hand_Qty"],
    ];

    let updatedCount = 0;
    let deletedCount = 0;
    let matchCount = 0;
    for (const item of items) {
        let index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Job);
        });
        const record = recordset[index];
        if (index !== -1) {
            recordset.splice(index, 1);
            matchCount++;
        }
        if (record) {
            if (!analysis.compareFields(item, record, fieldMatch)) {
                const column_values = {
                    due_date: record.Promised_Date,
                    customer: record.Customer,
                    // material: record.Material,
                    order_qty: record.Order_Qty,
                    shipped_qty: record.Shipped_Qty,
                    delta: record.Delta,
                    status: getSOStatus(record.Status),
                    onhand_qty: record.On_Hand_Qty,
                };
                // console.log(item, record);
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
    for (const record of recordset) {
        const item_name = (record.Job ? `${record.Job} (${record.Material || ''})` : 'No Job');
        const column_values = {
            due_date: record.Promised_Date,
            customer: record.Customer,
            // material: record.Material,
            order_qty: record.Order_Qty,
            shipped_qty: record.Shipped_Qty,
            delta: record.Delta,
            status: getSOStatus(record.Status),
            onhand_qty: record.On_Hand_Qty,
        };
        await monday.create_item(board_id, item_name, column_values);
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}