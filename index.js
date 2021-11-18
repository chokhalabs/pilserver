const express = require('express');
const cors = require('cors');
const fs = require("fs");
const pillAppHandler = require("./controller");

const app = express();

app.use(express.json());
app.use(cors());

const port = 3030;

app.post('/', pillAppHandler);

// app.get('/:{uuid}', downloadZipFile);

app.listen(port, () => {
  console.log(`App listening at: http://localhost:${port}`)
})
