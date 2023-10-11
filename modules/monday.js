// import modules
const axios = require('axios');
require('dotenv').config();

const headers = {
    'Content-Type': 'application/json',
    'Authorization': (process.env.TEST_MODE === "true" ? process.env.TEST_API_KEY : process.env.MONDAY_API_KEY),
    'X-Api-Version': '2023-10'
};

module.exports.getItems = async (board_id) => {
    // GraphQL query to monday.com
    const query = `{
        boards(ids: ${board_id}) {
            items {
                id
                name
                column_values {
                    id
                    title
                    type
                    text
                }
            }
        }
    }`;
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    const items = res.data.boards[0].items;
    for (const item of items) {
        for (const col of item.column_values) {
            item[col.id] = {
                type: col.type,
                value: col.text
            };
        }
    }
    return items;
}

module.exports.delete_item = async (item_id) => {
    // GraphQL query to monday.com
    const query = `
        mutation {
            delete_item(item_id: ${item_id}) {
                id
            }
        }
    `;
    return await safeExecQuery(query);
}

function validateDate(value) {
    if (typeof value === 'object' && value instanceof Date) {
        return value.toISOString().substr(0, 10);
    }
    const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})(Z|[+-]\d{2}:\d{2})$/;
    if (typeof value === 'string' && pattern.test(value)) {
        return value.substr(0, 10);
    }
    return value;
}

module.exports.create_item = async (board_id, item_name, column_values, group_id = null) => {
    let gid = (group_id ? `group_id: "${group_id}"` : '');
    // GraphQL query to monday.com
    let colvals = "";
    for (const id in column_values) {
        if (colvals !== "")
            colvals += ', ';
        let value = column_values[id] || '';
        value = validateDate(value);
        colvals += `\\"${id}\\":\\"${value}\\"`;
    }
    const query = `
        mutation {
            create_item(
                board_id: ${board_id}
                item_name: "${item_name}"
                ${gid}
                column_values: "{${colvals}}"
            ) {
                id
                name
            }
        }
    `;
    // console.log(query);
    return await safeExecQuery(query);
}

module.exports.create_column = async (board_id, id, title, column_type) => {
    const query = `
        mutation {
            create_column(
                board_id: ${board_id}
                id: "${id}"
                title: "${title}"
                column_type: ${column_type}
            ) {
                id
                title
            }
        }`;
    return await safeExecQuery(query, 1);
}

module.exports.change_simple_column_value = async (item_id, board_id, column_id, value) => {
    query = `
        mutation {
            change_simple_column_value(
                item_id: ${item_id}
                board_id: ${board_id}
                column_id: "${column_id}"
                value: "${value}"
            ) {
                id
            }
        }`;
    return await safeExecQuery(query);
}

module.exports.change_multiple_column_values = async (item_id, board_id, column_values) => {
    let colvals = "";
    for (const id in column_values) {
        if (colvals !== "")
            colvals += ', ';
        let value = column_values[id] || '';
        value = validateDate(value);
        colvals += `\\"${id}\\":\\"${value}\\"`;
    }
    query = `
        mutation {
            change_multiple_column_values(
                item_id: ${item_id}
                board_id: ${board_id}
                column_values: "{${colvals}}"
            ) {
                id
                name
                column_values {
                    title
                    value
                }
            }
        }`;
    return await safeExecQuery(query);
}

const safeExecQuery = async (query, max_cycle = 100) => {
    for (let i = 0; i < max_cycle; i++) {
        try {
            const res = await axios.post(process.env.API_URL, {
                query
            }, {
                headers
            });
            console.log(res.data);
            if (res.data.errors === undefined) {
                return res.data;
            }
        } catch (err) {
            console.log(err.hostname, "error query:", query);
            return null;
        }
    }
    return null;
}