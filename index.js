const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require("fs");
const pillAppHandler = require("./controller");

const upload = multer({
  dest: 'staticAssets'
});

const app = express();

app.use(express.json());
app.use(cors());

const port = 3030;

app.post('/', pillAppHandler);

app.post('/images', upload.single('image'), (req, res) => {
  const file = req.file;
  res.json({
    filename: file.filename
  });
});

app.use('/image', express.static('./staticAssets'));

// app.get('/:{uuid}', downloadZipFile);

app.listen(port, () => {
  console.log(`App listening at: http://localhost:${port}`)
})
