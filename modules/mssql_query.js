const axios = require('axios');
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

    let result = [];
    try {
        result = (await sql.query(query)).recordset;
    } catch (error) {
        console.error('Error executing query:', error);
    }

    sql.close();

    return result;
}

module.exports.getResultFromProxyServer = async (query) => {
    const url = 'http://184.168.31.101:3000';
    const headers = {
        'Content-Type': 'application/json',
    };

    let result = [];
    try {
        const res = await axios.post('http://184.168.31.101:3000', {
            query
        }, {
            headers
        });
        result = res.data;
    } catch (err) {
        console.log(err);
    }
    return result;
}