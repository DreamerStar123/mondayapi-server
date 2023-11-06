// import modules
const fs = require('fs');
const monday = require('../modules/monday');
const analysis = require('../modules/analysis');
const transform = require('../modules/transform');
const mssql_query = require('../modules/mssql_query');
const graph_req = require('../modules/graph_req');
const {
    getSOStatus
} = require('../modules/status_code');

const getColumnValues = (record) => {
    const column_values = {
        date_added: new Date(record.DateAdded),
        customer: record.Customer,
        cr_duedate: new Date(record.CRDueDate),
        linenumber: record.LineNumber,
        revision: record.Revision,
        status: getSOStatus(record.Status),
    };
    return column_values;
}

const updateGroup = async (board_id, items, recordset, logger) => {
    // analyze data
    const fieldMatch = [
        ["date_added", "DateAdded"],
        ["customer", "Customer"],
        ["cr_duedate", "CRDueDate"],
        ["revision", "Revision"],
        ["status", "Status"],
    ];

    let updatedCount = 0;
    let deletedCount = 0;
    for (const item of items) {
        const index = recordset.findIndex(record => {
            let name = item.name;
            let pos = name.indexOf("(");
            if (pos !== -1)
                name = name.substr(0, pos).trim();
            return (name === record.OrderNumbr && item.linenumber.value === record.LineNumber);
        });
        if (index !== -1) {
            const record = recordset[index];
            recordset.splice(index, 1);
            if (!analysis.compareFields(item, record, fieldMatch)) {
                await monday.change_multiple_column_values(item.id, board_id, getColumnValues(record));
                updatedCount++;
            }
        } else {
            await monday.delete_item(item.id);
            deletedCount++;
        }
    }
    logger.info(`${updatedCount}/${recordset.length} items updated`);
    logger.info(`${deletedCount}/${recordset.length} items deleted`);

    // add new items
    let newCount = 0;
    for (const record of recordset) {
        const name = `${record.OrderNumbr} (${record.PartNumber})`;
        await monday.create_item(board_id, name, getColumnValues(record));
        newCount++;
    }
    logger.info(`${newCount}/${recordset.length} items created`);
}

module.exports.update = async (board_id, logger) => {
    logger.info(`=====> contract_review.update(${board_id})`);
    // get items from monday.com
    const items = await monday.getItems(board_id);
    if (!items)
        return;
    logger.info(`${items.length} items`);

    const url = `/drives/b!RB3ashFls0upqKrDqkvmp8POBIRuRKpOhCECab39U5c8czzVwKViSoSGMxyYu2r1/items/01J2HDBH6GVJYP4II3URHYYMDENJNRL5RL/workbook/worksheets/sheet1/usedRange`;
    const drive = await graph_req.getResultFromRequest(url);
    const table = drive.text;
    const columns = table[0];
    const arr = drive.text.slice(1);
    let recordset = [];
    for (const item of arr) {
        let record = {};
        for (let i = 0; i < columns.length; i++)
            record[columns[i]] = item[i];
        recordset.push(record);
    }
    logger.info(`${recordset.length} records`);

    await updateGroup(board_id, items, recordset, logger);
}