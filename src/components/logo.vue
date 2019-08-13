<template>
  <footer>
    <div class="trim">
      <a href="https://github.com/enhuiz/daily-saikou">
        <img :src="logo" />
      </a>
    </div>
  </footer>
</template>

<script>
import logo from "assets/img/logo.png";

export default {
  name: "logo",
  data() {
    return {
      logo: logo
    };
  }
};
</script>

<style>
footer {
  position: absolute;
  bottom: 0px;
  right: 0px;
}

.trim {
  width: 70px;
  height: 80px;
  overflow: hidden;
}

img {
  width: 80px;
  height: 80px;
}
</style>
