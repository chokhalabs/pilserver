const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const { zipProject } = require("./controller");

function handleRequests(req, res) {
  console.log("Configs obtained: ", req.body);
  const uuid = uuidv4();
  generateProject(uuid, JSON.stringify(req.body.conf));
  res.json({generated_project: uuid})
}

function generateProject(uuid, config) {
  fs.mkdirSync(`./outputs/${uuid}`);
  fs.mkdirSync(`./outputs/${uuid}/public`);
  fs.mkdirSync(`./outputs/${uuid}/src`);
  fs.copyFileSync('./index.html', `./outputs/${uuid}/public/index.html`);
  fs.copyFileSync(`./rollup.config.js`, `./outputs/${uuid}/rollup.config.js`);
  fs.copyFileSync(`./konvaMounter.js`, `./outputs/${uuid}/src/index.js`);
  fs.copyFileSync(`./konvapackages.json`, `./outputs/${uuid}/package.json`);
  fs.writeFileSync(`./outputs/${uuid}/src/appconfig.js`, 
    `
    export default ${config}
    `
  )
  zipProject(uuid);
}

module.exports = handleRequests;
