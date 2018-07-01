<template>
  <div v-cloak id="app">
    <div v-if="loading" class="centered">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    </div>
    <div v-else>
      <div class="centered">
        <p>
          对不起，
          <br> 今天没上班。
          <br> {{date}}，
          <br> 又偷懒了一天。
        </p>
      </div>
      <logo></logo>
    </div>
  </div>
</template>

<script>
import "assets/css/fonts.css";
import logo from "components/logo.vue";

function getDateString(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/");
}

export default {
  components: {
    logo
  },
  data() {
    return {
      date: getDateString(new Date()),
      loading: true
    };
  },
  methods: {},
  created() {
    let url = getDateString(new Date()) + "/";
    fetch(url).then(response => {
      if (response.status === 404) {
        this.loading = false;
      } else {
        location.replace(url);
      }
    });
  }
};
</script>

<style>
body {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  border-width: 0;
  overflow: hidden;
  font-family: "Noto Serif CJK SC";
  font-weight: 100;
  font-size: 20px;
  text-align: right;
}

[v-cloak] {
  display: none;
}
</style>

<style scoped>
.centered {
  position: absolute;
  width: fit-content;
  height: fit-content;
  top: 45%;
  left: 50%;
  transform: translate(-55%, -50%);
}

.spinner {
  width: 70px;
  text-align: center;
}

.spinner > div {
  width: 10px;
  height: 10px;
  background-color: #333;
  border-radius: 100%;
  display: inline-block;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  animation-delay: -0.16s;
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40%,
  60% {
    transform: scale(1);
  }
}
</style>