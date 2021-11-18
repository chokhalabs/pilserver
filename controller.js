const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

function handlePillAppRequest(req, res) {
  generateProject(req.body).then(() => {
    res.json({
      generated_project: uuid
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500);
    res.end();
  });
}

function generateProject(pil) {
  const uuid = uuidv4();
  fs.mkdirSync(`./outputs/${uuid}`);
  return new Promise((resolve, reject) => {
    fs.writeFile(`./outputs/${uuid}/pil.js`, "export default " + JSON.stringify(pil), err => {
      if (err) {
        reject(err);
      } else {
        // startbuild(uuid)
        resolve(uuid);
      }
    });
  });
}

function startbuild(uuid) {
  // Copy webpack config
  // Copy image files
  // Build project with webpack
  // Zip folder 
  // Mark project build as finished
}

module.exports = handlePillAppRequest;
