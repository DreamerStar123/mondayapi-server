const fs = require('fs');

module.exports.dateString = (date) => {
    return date instanceof Date && date.toISOString() || date;
}

module.exports.getShipDate = (dueDate) => {
    let shipDate = new Date(dueDate);
    shipDate.setDate(shipDate.getDate() - 1);
    if (shipDate.getDay() == 5 || shipDate.getDay() == 6)
        shipDate.setDate(shipDate.getDate() - (shipDate.getDay() - 4));
    return shipDate;
}

module.exports.checkAfterYesterday = (date) => {
    // Set yesterday's date by subtracting 1 day from the current date in EDT
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Set the time to midnight in EDT
    yesterday.toLocaleString("en-US", {
        timeZone: "America/New_York"
    });

    // Assuming the given date is stored in a variable called 'givenDate'
    var givenDate = new Date(date); // Replace with your own given date
    givenDate.setHours(0, 0, 0, 0); // Set the time to midnight in UTC
    givenDate.toLocaleString("en-US", {
        timeZone: "America/New_York"
    });

    return givenDate >= yesterday;
}

module.exports.checkToday = (date) => {
    // Set today's date from the current date in EDT
    var today = new Date();
    today.setDate(today.getDate());
    today.setHours(0, 0, 0, 0); // Set the time to midnight in EDT
    today.toLocaleString("en-US", {
        timeZone: "America/New_York"
    });

    // Assuming the given date is stored in a variable called 'givenDate'
    var givenDate = new Date(date); // Replace with your own given date
    givenDate.setHours(0, 0, 0, 0); // Set the time to midnight in UTC
    givenDate.toLocaleString("en-US", {
        timeZone: "America/New_York"
    });

    return givenDate >= today;
}

module.exports.readJsonArray = filename => {
    try {
        const arr = JSON.parse(fs.readFileSync(filename));
        return arr;
    } catch (error) {
        console.log(error);
        return [];
    }
}

module.exports.writeJsonArray = (filename, arr) => {
    try {
        const text = JSON.stringify(arr);
        fs.writeFileSync(filename, text);
    } catch (error) {
        console.log(error);
    }
}