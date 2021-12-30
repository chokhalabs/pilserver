const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const webpack = require('webpack');
const archiver = require('archiver');
const path = require("path");
const webpackConfig = require("./webpack.config.js");


function handlePillAppRequest(req, res) {
  generateProject(req.body).then(uuid => {
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
  fs.mkdirSync(`./outputs/${uuid}/public`)
  return new Promise((resolve, reject) => {
    fs.writeFile(`./outputs/${uuid}/pil.js`, "export default " + JSON.stringify(pil), err => {
      if (err) {
        reject(err);
      } else {
        startbuild(uuid);
        resolve(uuid);
      }
    });
  });
}

function startbuild(uuid) {
  fs.readFile(`./outputs/${uuid}/pil.js`, (err, data) => {
    if (err) {
      console.error("Failed to open pil file for " + uuid);
    } else {
      const d = data.toString().replace("export default ", "");
      const pil = JSON.parse(d);

      pil.Item.images = pil.Item.images.map(image => {
        // Copy image from static assets to outputs
        fs.copyFileSync(`./staticAssets/${image.id}`, `./outputs/${uuid}/public/${image.id}`);
        image.source = `/public/${image.id}`;  
        return image;
      });

      // Copy webpack config
      fs.copyFileSync('./pillBase.js', `./outputs/${uuid}/pillBase.js`);
      fs.copyFileSync('./pilApp.js', `./outputs/${uuid}/pilApp.js`);
      fs.copyFileSync('./index.html', `./outputs/${uuid}/index.html`);

      // Build project with webpack
      webpackConfig.entry = path.join(__dirname, `./outputs/${uuid}/pilApp.js`);
      webpackConfig.output.path = path.join(__dirname, `./outputs/${uuid}/dist`);
      console.log("Webpack configs: ", webpackConfig);
      webpack(webpackConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error("Could not compile!");
          console.error(err);
          console.error(stats);
        } else {
          fs.unlinkSync(`./outputs/${uuid}/pilApp.js`);
          fs.unlinkSync(`./outputs/${uuid}/pil.js`);
          fs.unlinkSync(`./outputs/${uuid}/pillBase.js`);
          // Zip folder 
          zipProject(uuid);
        }        
      })
    }
  })
}

function zipProject(uuid) {

  var output = fs.createWriteStream(`./outputs/${uuid}.zip`);
  var archive = archiver('zip');

  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err){
      console.error("Failed to archive: ", err);
  });

  archive.pipe(output);

  archive.directory(`./outputs/${uuid}`, false);

  archive.finalize();
}

module.exports = {
  zipProject,
  handlePillAppRequest
};
