// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const mssql_query = require('../modules/mssql_query');
const {
    getJobStatus
} = require('../modules/status_code');

module.exports.updateNbr = async (board_id, proxy, logger) => {
    logger.info(`=====> updateNbr(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items) {
        return;
    }
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/5-r.sql', 'utf-8');
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
        ["material", "Material"],
        ["description", "Description"],
        ["pick_buy", "Pick_Buy_Indicator"],
        ["status", "Status"],
        ["est_qty", "Est_Qty"],
        ["act_qty", "Act_Qty"],
        ["delta", "Delta"],
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
            if (record.Act_Qty - record.Est_Qty < 0) {
                if (!analysis.compareFields(item, record, fieldMatch)) {
                    const column_values = {
                        due_date: record.Promised_Date,
                        material: record.Material,
                        description: record.Description,
                        pick_buy: record.Pick_Buy_Indicator,
                        status: getJobStatus(record.Status),
                        est_qty: record.Est_Qty,
                        act_qty: record.Act_Qty,
                        delta: record.Delta,
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
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);
    logger.info(`${deletedCount}/${matchCount} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        if (record.Act_Qty - record.Est_Qty < 0) {
            const item_name = `${record.Job} (${record.Part_Number})`;
            const column_values = {
                due_date: record.Promised_Date,
                material: record.Material,
                description: record.Description,
                pick_buy: record.Pick_Buy_Indicator,
                status: getJobStatus(record.Status),
                est_qty: record.Est_Qty,
                act_qty: record.Act_Qty,
                delta: record.Delta,
            };
            await monday.create_item(board_id, item_name, column_values);
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateNbs = async (board_id, proxy, logger) => {
    logger.info(`=====> updateNbs(${board_id})`);
    // get items from monday.com
    const groups = await monday.getGroups(board_id);
    if (!groups)
        return;
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${groups.length} groups`);
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/5-s.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        // ["material", "Material"],
        ["due_date", "Promised_Date"],
        ["mat_desc", "Mat_Desc"],
        ["job_desc", "Job_Desc"],
        ["pick_buy", "Pick_Buy_Indicator"],
        ["status", "Status"],
        ["est_qty", "Est_Qty"],
        ["act_qty", "Act_Qty"],
        ["delta", "Delta"],
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
            // find group
            let group = groups.find(group => group.title === record.Material);
            if (!group) {
                group = await monday.create_group(board_id, record.Material, groups[groups.length - 1].id);
                groups.push(group);
            }
            if (group) {
                await monday.move_item_to_group(item.id, group.id);
            }
            if (record.Act_Qty - record.Est_Qty < 0) {
                if (!analysis.compareFields(item, record, fieldMatch)) {
                    const column_values = {
                        // material: record.Material,
                        due_date: record.Promised_Date,
                        mat_desc: record.Mat_Desc,
                        job_desc: record.Job_Desc,
                        pick_buy: record.Pick_Buy_Indicator,
                        status: getJobStatus(record.Status),
                        est_qty: record.Est_Qty,
                        act_qty: record.Act_Qty,
                        delta: record.Delta,
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
        if (record.Act_Qty - record.Est_Qty < 0) {
            // find group
            let group = groups.find(group => group.title === record.Material);
            if (!group) {
                group = await monday.create_group(board_id, record.Material, groups[groups.length - 1].id);
                groups.push(group);
            }

            const item_name = `${record.Job} (${record.Part_Number})`;
            const column_values = {
                // material: record.Material,
                due_date: record.Promised_Date,
                mat_desc: record.Mat_Desc,
                job_desc: record.Job_Desc,
                pick_buy: record.Pick_Buy_Indicator,
                status: getJobStatus(record.Status),
                est_qty: record.Est_Qty,
                act_qty: record.Act_Qty,
                delta: record.Delta,
                onhand_qty: record.On_Hand_Qty,
            };
            await monday.create_item(board_id, item_name, column_values, group.id);
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.updateNbh = async (board_id, proxy, logger) => {
    logger.info(`=====> updateNbh(${board_id})`);
    // get items from monday.com
    const groups = await monday.getGroups(board_id);
    if (!groups)
        return;
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${groups.length} groups`);
    logger.info(`${items.length} items`);

    // read mssql data
    const query = fs.readFileSync('query/5-h.sql', 'utf-8');
    let recordset;
    if (proxy)
        recordset = await mssql_query.getResultFromProxyServer(query);
    else
        recordset = await mssql_query.getResultFromSQLServer(query);
    // const recordset = JSON.parse(fs.readFileSync('query/open_job-2.json', 'utf8'));
    logger.info(`${recordset.length} records`);

    // analyze data
    const fieldMatch = [
        // ["material", "Material"],
        ["due_date", "Promised_Date"],
        ["mat_desc", "Mat_Desc"],
        ["job_desc", "Job_Desc"],
        ["pick_buy", "Pick_Buy_Indicator"],
        ["status", "Status"],
        ["est_qty", "Est_Qty"],
        ["act_qty", "Act_Qty"],
        ["delta", "Delta"],
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
            if (record.Act_Qty - record.Est_Qty < 0) {
                // find group
                let group = groups.find(group => group.title === record.Material);
                if (!group) {
                    group = await monday.create_group(board_id, record.Material, groups[groups.length - 1].id);
                    groups.push(group);
                }
                if (group) {
                    await monday.move_item_to_group(item.id, group.id);
                }
                if (!analysis.compareFields(item, record, fieldMatch)) {
                    const column_values = {
                        // material: record.Material,
                        due_date: record.Promised_Date,
                        mat_desc: record.Mat_Desc,
                        job_desc: record.Job_Desc,
                        pick_buy: record.Pick_Buy_Indicator,
                        status: getJobStatus(record.Status),
                        est_qty: record.Est_Qty,
                        act_qty: record.Act_Qty,
                        delta: record.Delta,
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
        } else {
            await monday.delete_item(item.id);
            deletedCount++;
        }
    }
    logger.info(`${updatedCount}/${items.length} items updated`);
    logger.info(`${deletedCount}/${items.length} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        if (record.Act_Qty - record.Est_Qty < 0) {
            // find group
            let group = groups.find(group => group.title === record.Material);
            if (!group) {
                group = await monday.create_group(board_id, record.Material, groups[groups.length - 1].id);
                groups.push(group);
            }

            const item_name = `${record.Job} (${record.Part_Number})`;
            const column_values = {
                // material: record.Material,
                due_date: record.Promised_Date,
                mat_desc: record.Mat_Desc,
                job_desc: record.Job_Desc,
                pick_buy: record.Pick_Buy_Indicator,
                status: getJobStatus(record.Status),
                est_qty: record.Est_Qty,
                act_qty: record.Act_Qty,
                delta: record.Delta,
                onhand_qty: record.On_Hand_Qty,
            };
            await monday.create_item(board_id, item_name, column_values, group.id);
            newCount++;
        }
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}