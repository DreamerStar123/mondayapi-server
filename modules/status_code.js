module.exports.getSOStatus = (status) => {
    switch (status.toLowerCase()) {
        case "backorder":
            return 0;
        case "closed":
            return 1;
        case "hold":
            return 2;
        case "open":
            return 3;
        case "shipped":
            return 4;
    }
    return 5;
}

module.exports.getPOStatus = (status) => {
    switch (status.toLowerCase()) {
        case "unissued":
            return 0;
        case "closed":
            return 1;
        case "open":
            return 2;
    }
    return 5;
}

module.exports.getJobStatus = (status) => {
    switch (status.toLowerCase()) {
        case "closed":
            return 0;
        case "active":
            return 1;
        case "complete":
            return 2;
        case "hold":
            return 3;
        case "template":
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