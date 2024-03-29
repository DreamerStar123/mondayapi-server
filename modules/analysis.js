// compare item and record on fieldMatch
module.exports.compareFields = (item, record, fieldMatch) => {
    for (const fieldPair of fieldMatch) {
        let itemField = item[fieldPair[0]];
        let recordField = record[fieldPair[1]];
        if (recordField !== 0)
            recordField = recordField || '';
        // compare field value
        if (itemField.type === "date") {
            let d = new Date(recordField);
            if (d != 'Invalid Date')
                d = d.toISOString().substr(0, 10);
            else
                d = null;
            if (itemField.value != d) {
                console.log(`${fieldPair[0]}, ${fieldPair[1]}: ${itemField.value} != ${d}`);
                return false;
            }
        } else if (itemField.type === "color") {
            if (itemField.value.toLowerCase() !== recordField.toLowerCase()) {
                console.log(`${fieldPair[0]}, ${fieldPair[1]}: ${itemField.value.toLowerCase()} != ${recordField.toLowerCase()}`);
                return false;
            }
        } else if (itemField.value != recordField) {
            console.log(`${fieldPair[0]}, ${fieldPair[1]}: ${itemField.value} != ${recordField}`);
            return false;
        }
    }
    return true;
}

module.exports.analyzeData = (items, recordset, fieldMatch) => {
    let res = {
        validItemIds: [],
        updateItemIds: [],
        invalidItemIds: [],
        recordFlags: []
    };

    if (!Array.isArray(items) || !Array.isArray(recordset)) {
        console.log('items and recordset must be array');
        return res;
    }

    for (const item of items) {
        let index = recordset.findIndex((record) => this.compareFields(item, record, fieldMatch));
        if (index !== -1) {
            res.validItemIds.push(item.id);
            res.recordFlags[index] = true;
        } else {
            res.invalidItemIds.push(item.id);
        }
    }

    return res;
}