// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const transform = require('../modules/transform');
const mssql_query = require('../modules/mssql_query');

const getColumnValues = (record) => {
    const column_values = {
        employee: record.Employee,
        work_center: record.Work_Center,
        opr_service: record.Operation_Service,
        act_setup_hrs: record.Act_Setup_Hrs,
        act_run_hrs: record.Act_Run_Hrs,
        act_run_qty: record.Act_Run_Qty,
        act_scrap_qty: record.Act_Scrap_Qty,
        work_date: record.Work_Date,
    };
    return column_values;
}

const updateGroup = async (board_id, group_id, items, recordset, logger) => {
    // analyze data
    const fieldMatch = [
        ["employee", "Employee"],
        ["work_center", "Work_Center"],
        ["opr_service", "Operation_Service"],
        ["act_setup_hrs", "Act_Setup_Hrs"],
        ["act_run_hrs", "Act_Run_Hrs"],
        ["act_run_qty", "Act_Run_Qty"],
        ["act_scrap_qty", "Act_Scrap_Qty"],
        ["work_date", "Work_Date"],
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
        await monday.create_item(board_id, item_name, getColumnValues(record), group_id);
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateWorkAct = async (board_id, mach_board_id, proxy, logger) => {
    logger.info(`=====> updateWorkAct(${board_id}, ${mach_board_id})`);
    // get items from monday.com
    const items_today = await monday.getGroupItems(board_id, "today");
    if (!items_today)
        return;
    const items_yest = await monday.getGroupItems(board_id, "yesterday");
    if (!items_yest)
        return;
    logger.info(`${items_today.length} today items`);
    logger.info(`${items_yest.length} yesterday items`);

    // read mssql data
    const query_today = fs.readFileSync('query/7-work_today.sql', 'utf-8');
    const query_yest = fs.readFileSync('query/7-work_yesterday.sql', 'utf-8');
    let rs_today, rs_yest;
    if (proxy) {
        rs_today = await mssql_query.getResultFromProxyServer(query_today);
        rs_yest = await mssql_query.getResultFromProxyServer(query_yest);
    } else {
        rs_today = await mssql_query.getResultFromSQLServer(query_today);
        rs_yest = await mssql_query.getResultFromSQLServer(query_yest);
    }
    logger.info(`${rs_today.length} today records`);
    logger.info(`${rs_yest.length} yesterday records`);

    await updateGroup(board_id, "today", items_today, rs_today, logger);
    await updateGroup(board_id, "yesterday", items_yest, rs_yest, logger);

    await transform.pullColumnDataFromOtherBoard(mach_board_id, "status64", board_id, "location", logger);
}