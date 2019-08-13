const path = require('path');
const fs = require('fs');
const LoaderUtiles = require('loader-utils');
const Fontmin = require('fontmin');

module.exports = function (content) {
    const callback = this.async();
    let options = LoaderUtiles.getOptions(this) || {};
    let config = {
        name: options.name || '[name].[ext]',
        text: options.text || ''
    };

    new Promise((resolve, reject) => {
        const fontmin = new Fontmin().src(content);

        config.text && fontmin.use(Fontmin.glyph({
            text: config.text
        }));

        fontmin.run((err, files) => {
            if (err) {
                reject(err);
            }
            let resultContent = files[0].contents;

            let url = LoaderUtiles.interpolateName(this, config.name, {
                content: resultContent,
            });

            let publicPath = "__webpack_public_path__ + " + JSON.stringify(url);

            this.emitFile(url, resultContent);
            callbackParam = "module.exports = " + publicPath + ";";

            console.log(url);

            resolve(callbackParam);
        });
    }).then(param => callback(null, param), callback);
};

module.exports.raw = true;