<template>
  <saikou v-bind:postscript="postscript">
    <center>
      <canvas id="cvs"></canvas>
    </center>
  </saikou>
</template>

<script>
import saikou from "components/saikou.vue";
import postscript from "./postscript.md";
import gameLoop from "./core.js";

import blood from "./img/blood.png";
import hit from "./img/hit.jpg";
import idle from "./img/idle.jpg";
import mark from "./img/mark.png";
import gun from "./img/gun.png";

export default {
  components: {
    saikou
  },
  data() {
    return {
      postscript: postscript
    };
  },
  mounted() {
    gameLoop.init("cvs", {
      blood: blood,
      hit: hit,
      idle: idle,
      mark: mark,
      gun: gun
    });
    gameLoop.start();
  }
};
</script>
  
<style>
</style>
