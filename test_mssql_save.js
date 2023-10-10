// import modules
const fs = require('fs');
const mssql_query = require('./modules/mssql_query');

(async () => {
    // read mssql data
    const query = fs.readFileSync('query/query.txt', 'utf-8');
    const recordset = await mssql_query.getResultFromSQLServer(query);
    fs.writeFileSync('data/test.json', JSON.stringify(recordset));
})();