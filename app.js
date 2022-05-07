//imports
const express = require("express")

const app = express();
const { Pool, Client } = require("pg");
const credentials = require("./credentials.js");

async function poolDemo() {
    const pool = new Pool(credentials);
    const now = await pool.query("SELECT NOW()");
    await pool.end();

    return now
}

(async () => {
    const now = await poolDemo();
    console.log(now.rows[0].now);
})();

//start server
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
