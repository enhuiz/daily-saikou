<template>
  <saikou v-bind:postscript="postscript">
    <div class="placed">
      <p>
        <span>字</span> 大
      </p>
    </div>
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

<style scoped>
p {
  font-family: "PingFang SC", "Noto Serif CJK SC";
  width: 50px;
  line-height: 125px;
  font-weight: 100;
  font-size: 150px;
}

span {
  font-size: 200px;
}

.placed {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translate(-50%, -50%);
}
</style>