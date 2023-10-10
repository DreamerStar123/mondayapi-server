const sql = require('mssql');
const config = {
    user: 'monday.com',
    password: 'YCLEPT0surpass1peruvian-heirloom8suspend',
    server: '96.95.168.117',
    database: 'PRODUCTION',
    options: {
        trustServerCertificate: true,
    },
};

module.exports.getResultFromSQLServer = async (query) => {
    try {
        await sql.connect(config);
    } catch (error) {
        console.error('Failed to connect to SQL Server:', error);
        return [];
    }

    console.log('Connected to SQL Server');

    try {
        var result = (await sql.query(query)).recordset;
    } catch (error) {
        console.error('Error executing query:', error);
        return [];
    }

    sql.close();

    return result;
}
