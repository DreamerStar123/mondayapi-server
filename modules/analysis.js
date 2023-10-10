// compare item and record on fieldMatch
module.exports.compareFields = (item, record, fieldMatch) => {
    for (const fieldPair of fieldMatch) {
        let itemField = item[fieldPair[0]];
        let recordField = record[fieldPair[1]] || '';
        // compare field value
        if (itemField.type === "date") {
            let d = new Date(recordField).toISOString().substr(0, 10);
            if (itemField.value != d)
                return false;
        } else if (!(!itemField.value && recordField === 0) && itemField.value != recordField) {
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