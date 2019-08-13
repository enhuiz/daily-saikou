const glob = require("glob");
const fs = require("fs");
const LoaderUtiles = require("loader-utils");
const Fontmin = require("fontmin");

function scanCharacters() {
  let characters = new Set();

  function updateCharacters(path) {
    let str = fs.readFileSync(path, "utf8") || "";
    characters = new Set([...characters, ...str]);
  }

  glob.sync("./src/pages/**/*.{html,md,vue}").forEach(updateCharacters);
  glob.sync("./src/components/*.vue").forEach(updateCharacters);

  let digits = "0123456789";
  characters = new Set([...characters, ...digits]);
  return [...characters].sort();
}

let text = scanCharacters().join("");

module.exports = function(content) {
  const callback = this.async();
  let options = LoaderUtiles.getOptions(this) || {};
  let config = {
    name: options.name || "[name].[ext]",
    text: options.text || ""
  };

  new Promise((resolve, reject) => {
    const fontmin = new Fontmin().src(content);

    fontmin.use(
      Fontmin.glyph({
        text: text
      })
    );

    fontmin.run((err, files) => {
      if (err) {
        reject(err);
      }
      let resultContent = files[0].contents;

      let url = LoaderUtiles.interpolateName(this, config.name, {
        content: resultContent
      });

      let publicPath = "__webpack_public_path__ + " + JSON.stringify(url);

      this.emitFile(url, resultContent);
      callbackParam = "module.exports = " + publicPath + ";";

      resolve(callbackParam);
    });
  }).then(param => callback(null, param), callback);
};

module.exports.raw = true;
