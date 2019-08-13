date=$(date +%Y/%m/%d)
dir=src/pages/$date/index

if [ -d $dir ]; then
  echo $dir exists.
  exit
fi

mkdir -p $dir

cat >$dir/app.html <<-END
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
END

cat >$dir/app.js <<-END
import Vue from 'vue';
import App from './app.vue';

new Vue({
    el: '#app',
    render: h => h(App)
});
END

cat >$dir/app.vue <<-END
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
</style>
END

touch $dir/postscript.md

echo done.
