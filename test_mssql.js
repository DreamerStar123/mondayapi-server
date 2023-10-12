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
        const res = await axios.post('http://184.168.31.101:3000', {query}, {headers});
        // console.log(res);
        fs.writeFileSync('data/test.json', JSON.stringify(res.data));
    } catch (err) {
        console.log(err);
    }
})();