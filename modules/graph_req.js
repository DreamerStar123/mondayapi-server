const {
    Client
} = require("@microsoft/microsoft-graph-client");
require('dotenv').config();

module.exports.getResultFromRequest = async (req) => {
    let result = null;

    const client = Client.init({
        authProvider: (done) => {
            done(null, process.env.GRAPH_API_KEY);
        },
    });

    try {
        result = await client.api(req).get();
    } catch (error) {
        console.error('Error executing query:', error);
    }

    return result;
}