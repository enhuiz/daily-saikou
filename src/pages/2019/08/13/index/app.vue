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
