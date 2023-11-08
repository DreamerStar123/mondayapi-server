module.exports.dateString = (date) => {
    return date instanceof Date && date.toISOString() || date;
}