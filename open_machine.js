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

    let updatedCount = 0;
    for (const item of items) {
        let index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.Job);
        });
        const record = recordset[index];
        if (index !== -1)
            recordset.splice(index, 1);
        if (record && !analysis.compareFields(item, record, fieldMatch)) {
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
            // console.log(item, record);
            await monday.change_multiple_column_values(item.id, board_id, column_values);
            updatedCount++;
        }
    }
    logger.info(`${updatedCount} items updated`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
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
    logger.info(`${newCount} items created`);
}