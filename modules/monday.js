// import modules
const axios = require('axios');
require('dotenv').config();

const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': process.env.TEST_API_KEY,
    'Authorization': process.env.MONDAY_API_KEY,
    'X-Api-Version': '2023-10'
};

module.exports.getItems = async (board_id) => {
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

module.exports.getItemValues = async (board_id) => {
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
                    value
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
        for (const col of item.column_values)
            item[col.id] = col;
    }
    return items;
}

module.exports.getGroupItems = async (board_id, group_id) => {
    const query = `{
        boards(ids: ${board_id}) {
            groups(ids: ${group_id}) {
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
        }
    }`;
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    const items = res.data.boards[0].groups[0].items;
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

module.exports.getGroups = async (board_id) => {
    const query = `{
            boards(ids: ${board_id}) {
                groups {
                    id
                    title
                }
            }
        }
    `;
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    const groups = res.data.boards[0].groups;
    return groups;
}

module.exports.delete_item = async (item_id) => {
    const query = `
        mutation {
            delete_item(item_id: ${item_id}) {
                id
                name
            }
        }
    `;
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    return res.data.delete_item;
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
    let colvals = "";
    for (const id in column_values) {
        if (colvals !== "")
            colvals += ', ';
        let value = column_values[id];
        if (value === null)
            value = '';
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
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    return res.data.create_item;
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
    const res = await safeExecQuery(query, 1);
    if (!res || res.errors !== undefined) {
        return null;
    }
    return res.data.create_column;
}

module.exports.create_group = async (board_id, group_name, relative_to = '') => {
    const query = `
        mutation {
            create_group(
                board_id: ${board_id}
                group_name: "${group_name}"
                relative_to: "${relative_to}"
            ) {
                id
                title
            }
        }
    `;
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    return res.data.create_group;
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
    const res = await safeExecQuery(query);
    if (!res || res.errors !== undefined) {
        return null;
    }
    return res.data.change_simple_column_value;
}

module.exports.change_multiple_column_values = async (item_id, board_id, column_values) => {
    let colvals = "";
    for (const id in column_values) {
        if (colvals !== "")
            colvals += ', ';
        let value = column_values[id];
        if (value === null)
            value = '';
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
    const res = await safeExecQuery(query);
    if (!res || res.errors || res.error_data) {
        return null;
    }
    return res.data.change_multiple_column_values;
}

module.exports.move_item_to_group = async (item_id, group_id) => {
    const query = `
        mutation {
            move_item_to_group(item_id: ${item_id} group_id: "${group_id}") {
                id
                group {
                    id
                }
            }
        }`;
    const res = await safeExecQuery(query);
    if (!res || res.errors || res.error_data) {
        return null;
    }
    return res.data.move_item_to_group;
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