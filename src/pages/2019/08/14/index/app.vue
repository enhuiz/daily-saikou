<template>
  <saikou v-bind:postscript="postscript">
    <div class="canvas-wrapper">
      <canvas id="cvs"></canvas>
    </div>
  </saikou>
</template>

<script>
import saikou from "components/saikou.vue";
import postscript from "./postscript.md";
import gameLoop from "./core.js";

import blood from "./img/blood.png";
import hit from "./img/hit.jpg";
import idle from "./img/idle.jpg";
import crosshair from "./img/crosshair.png";
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
      crosshair: crosshair,
      gun: gun
    });
    gameLoop.start();
  }
};
</script>

<style>
.canvas-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
