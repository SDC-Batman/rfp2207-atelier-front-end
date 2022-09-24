require("dotenv").config();
const express = require("express");
const cors = require('cors')
const app = express();
const path = require("path");

const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

app.listen(PORT);
console.log(`Listening at http://localhost:${PORT}`);
