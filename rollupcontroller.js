const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const { zipProject } = require("./controller");

function handleRequests(req, res) {
  console.log("Configs obtained: ", req.body);
  const uuid = uuidv4();
  const stubs = "{" + createStubsForOnClick(req.body.conf).join(", ") + "}";
  generateProject(uuid, JSON.stringify(req.body.conf, null, 4), stubs);
  res.json({generated_project: uuid})
}


function createStubsForOnClick(config) {
  const alerter = (msg) => `() => alert("${msg}")`
  let stubs = [];
  if (config.props.onClick && config.props.onClick.expr) {
    const expr = config.props.onClick.expr;
    stubs.push(`${expr.substring("$props.".length)}: ${alerter("onClick of config.id, config.type")}`)
  }
  if (config.children.length > 0) {
    let childstubs = config.children.map(child => createStubsForOnClick(child, stubs)).flat(Infinity);
    stubs = stubs.concat(childstubs);
  }
  return stubs;
}

function generateProject(uuid, config, stubs) {
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
  );
  fs.writeFileSync(`./outputs/${uuid}/src/toBeSuppliedByDevs.js`, 
    `
    export default ${stubs}
    `
  );
  zipProject(uuid);
}

module.exports = handleRequests;
