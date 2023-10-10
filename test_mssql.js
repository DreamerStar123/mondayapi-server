// import modules
const fs = require('fs');
const axios = require('axios');

const headers = {
    'Content-Type': 'application/json',
};

(async () => {
    // read mssql data
    const query = fs.readFileSync('query/test.sql', 'utf-8');
    try {
        const res = await axios.post('http://localhost:3000', {headers});
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
})();