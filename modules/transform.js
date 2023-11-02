const {
    log
} = require('winston');
const monday = require('./monday');

const getLocation = (val) => {
    let index = 5;
    if (val)
        index = JSON.parse(val).index;
    return index;
}

module.exports.pullColumnDataFromOtherBoard = async (board_id_fr, column_id_fr, board_id_to, column_id_to, logger) => {
    // get items from monday.com
    const items_fr = await monday.getItemValues(board_id_fr);
    if (!items_fr) {
        logger.info(`getItems(${board_id_fr}) failed`);
        return;
    }
    logger.info(`${items_fr.length} from items`);
    const items_to = await monday.getItemValues(board_id_to);
    if (!items_to) {
        logger.info(`getItems(${board_id_to}) failed`);
        return;
    }
    logger.info(`${items_to.length} to items`);

    let updatedCount = 0;
    let matchCount = 0;
    for (const item_to of items_to) {
        const item_fr = items_fr.find((item_fr) => item_fr.name === item_to.name);
        if (item_fr) {
            let index_fr = getLocation(item_fr[column_id_fr].value);
            let index_to = getLocation(item_to[column_id_to].value);
            if (index_fr !== index_to) {
                await monday.change_simple_column_value(item_to.id, board_id_to, column_id_to, index_fr);
                updatedCount++;
            }
            matchCount++;
        }
    }
    logger.info(`${updatedCount}/${matchCount} items updated`);
}