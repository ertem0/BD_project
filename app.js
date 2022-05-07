//imports
const express = require("express")

const app = express();

//start server
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
