module.exports.getSOStatus = (status) => {
    switch (status) {
        case "Backorder":
            return 0;
        case "Closed":
            return 1;
        case "Hold":
            return 2;
        case "Open":
            return 3;
        case "Shipped":
            return 4;
    }
    return 5;
}

module.exports.getPOStatus = (status) => {
    switch (status) {
        case "Unissued":
            return 0;
        case "Closed":
            return 1;
        case "Open":
            return 2;
    }
    return 5;
}

module.exports.getJobStatus = (status) => {
    switch (status) {
        case "Closed":
            return 0;
        case "Active":
            return 1;
        case "Complete":
            return 2;
        case "Hold":
            return 3;
        case "Template":
            return 4;
    }
    return 5;
}

module.exports.getShipDate = (dueDate) => {
    let shipDate = new Date(dueDate);
    shipDate.setDate(shipDate.getDate() - 1);
    if (shipDate.getDay() == 5 || shipDate.getDay() == 6)
        shipDate.setDate(shipDate.getDate() - (shipDate.getDay() - 4));
    return shipDate;
}