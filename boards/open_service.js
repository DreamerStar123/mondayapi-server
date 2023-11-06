// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const transform = require('../modules/transform');
const mssql_query = require('../modules/mssql_query');
const { getPOStatus } = require('../modules/status_code');

const getColumnValues = (record) => {
    const column_values = {
        vendor: record.Vendor,
        opr_service: record.Operation_Service,
        mat_req: record.Material_Req,
        po: record.PO,
        status: getPOStatus(record.Status),
        due_date: record.Due_Date,
        order_qty: record.Order_Quantity,
        poordered_qty: record.POOrdered_Qty,
        act_qty: record.Act_Qty,
        lastrecv_date: record.Last_Recv_Date,
    };
    return column_values;
}

const updateGroup = async (board_id, items, recordset, logger) => {
    // analyze data
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["opr_service", "Operation_Service"],
        ["mat_req", "Material_Req"],
        ["po", "PO"],
        ["status", "Status"],
        ["due_date", "Due_Date"],
        ["order_qty", "Order_Quantity"],
        ["poordered_qty", "POOrdered_Qty"],
        ["act_qty", "Act_Qty"],
        ["lastrecv_date", "Last_Recv_Date"],
    ];

    let deletedCount = 0;
    let recordCount = recordset.length;
    for (const item of items) {
        let index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return name === record.Job && analysis.compareFields(item, record, fieldMatch);
        });
        const record = recordset[index];
        if (index !== -1) {
            recordset.splice(index, 1);
        } else {
            await monday.delete_item(item.id);
            deletedCount++;
        }
    }
    logger.info(`${deletedCount}/${recordCount} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        const item_name = `${record.Job} (${record.Part_Number})`;
        await monday.create_item(board_id, item_name, getColumnValues(record));
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateOpenService = async (board_id, proxy, logger) => {
    logger.info(`=====> updateOpenService(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/8-open_service.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    await updateGroup(board_id, items, recordset, logger);
}