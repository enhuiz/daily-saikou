let fs = require('fs');
let mkdirp = require('mkdirp');

function getDateString(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/");
}

function makeDir(date) {
    let dir = 'src/pages/' + getDateString(date) + '/index/';
    mkdirp.sync(dir);
    return dir;
}

function logExists(target) {
    if (fs.existsSync(target)) {
        console.log('Error: "' + target + '" exists');
        return true;
    }
    return false;
}

function writeHTML(target) {
    let content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="format-detection" content="telephone=no,email=no">
  <title></title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`;
    fs.writeFileSync(target, content);
}

function writeJS(target) {
    let content = `
import Vue from 'vue';
import App from './app.vue';

new Vue({
    el: '#app',
    render: h => h(App)
});
    `;
    fs.writeFileSync(target, content);
}

function writeVue(target) {
    let content = `
<template>
    <saikou v-bind:postscript="postscript">
    </saikou>
</template>

<script>
import saikou from "components/saikou.vue";
import postscript from "./postscript.md";

export default {
  components: {
    saikou
  },
  data() {
    return {
      postscript: postscript
    };
  }
};
</script>
  
<style>
</style>`;
    fs.writeFileSync(target, content);
}

function writeMd(target) {
    let content = `
    `;
    fs.writeFileSync(target, content);
}

// decorate
[writeHTML, writeJS, writeVue, writeMd] = (funcArray => {
    return funcArray.map(func => {
        return target => {
            if (fs.existsSync(target)) {
                console.log('Fail: ' + target + ' exists.');
            } else {
                func(target);
                console.log('Success: ' + target + ' created')
            }
        }
    });
})([writeHTML, writeJS, writeVue, writeMd]);


function writeFiles(dir) {
    writeHTML(dir + '/app.html');
    writeJS(dir + '/app.js');
    writeVue(dir + '/app.vue');
    writeMd(dir + '/postscript.md');
}

function createToday() {
    let dir = makeDir(new Date());
    writeFiles(dir);
}

createToday();