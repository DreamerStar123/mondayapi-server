// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const mssql_query = require('../modules/mssql_query');

module.exports.updateOpenMachine = async (board_id, proxy, logger) => {
    logger.info(`=====> updateOpenMachine(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/4-open_machine.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["job_order_qty", "Job_Order_Qty"],
        ["opr_service", "Operation_Service"],
        ["po", "PO"],
        ["due_date", "Due_Date"],
        ["po_order_qty", "PO_Order_Qty"],
        ["act_qty", "Act_Qty"],
        ["last_recv_date", "Last_Recv_Date"],
        ["issued_by", "Issued_By"],
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
                    vendor: record.Vendor,
                    job_order_qty: record.Job_Order_Qty,
                    opr_service: record.Operation_Service,
                    po: record.PO,
                    due_date: record.Due_Date,
                    po_order_qty: record.PO_Order_Qty,
                    act_qty: record.Act_Qty,
                    last_recv_date: record.Last_Recv_Date,
                    issued_by: record.Issued_By,
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
        const item_name = `${record.Job} (${record.Part_Number})`;
        const column_values = {
            vendor: record.Vendor,
            job_order_qty: record.Job_Order_Qty,
            opr_service: record.Operation_Service,
            po: record.PO,
            due_date: record.Due_Date,
            po_order_qty: record.PO_Order_Qty,
            act_qty: record.Act_Qty,
            last_recv_date: record.Last_Recv_Date,
            issued_by: record.Issued_By,
        };
        await monday.create_item(board_id, item_name, column_values);
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}