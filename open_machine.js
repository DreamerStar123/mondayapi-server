// import modules
const fs = require('fs');
const monday = require('./modules/monday');
const analysis = require('./modules/analysis');
const mssql_query = require('./modules/mssql_query');

module.exports.addNewOpenMachineData = async (board_id, logger) => {
    logger.info(`addNewOpenMachineData(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/open_machine.sql', 'utf-8');
    const recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        ["vendor", "Vendor"],
        ["job_order_qty", "Job_Order_Qty"],
        ["opr_service", "Operation_Service"],
        ["mat_req", "Material_Req"],
        ["po", "PO"],
        ["due_date", "Due_Date"],
        ["po_order_qty", "PO_Order_Qty"],
        ["act_qty", "Act_Qty"],
        ["last_recv_date", "Last_Recv_Date"],
    ];

    // analysis.compareFields(items[0], recordset[0], fieldMatch);
    let res = analysis.analyzeData(items, recordset, fieldMatch);
    logger.info(`${res.validItemIds.length} matching items`);

    // add new items
    let newCount = 0;
    for (let i = 0; i < recordset.length; i++) {
        const record = recordset[i];
        const flag = res.recordFlags[i];
        if (!flag) {
            const item_name = `${record.Job} (${record.Part_Number})`;
            const column_values = {
                vendor: record.Vendor,
                job_order_qty: record.Job_Order_Qty,
                opr_service: record.Operation_Service,
                mat_req: record.Material_Req,
                po: record.PO,
                due_date: record.Due_Date,
                po_order_qty: record.PO_Order_Qty,
                act_qty: record.Act_Qty,
                last_recv_date: record.Last_Recv_Date,
            };
            await monday.create_item(board_id, item_name, column_values);
            newCount++;
        }
    }
    logger.info(`${newCount} items created`);
}
