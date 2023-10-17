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