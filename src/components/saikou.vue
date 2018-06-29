<template>
  <div v-cloak class="main">
  
    <div v-if="expired">
      <div class="expired">
        哎呀，
        <br>
        这个内容过期了{{calcDuration()}}天。
      </div>
      <logo></logo>
    </div>
  
    <swiper v-else :options="swiperOption">
      <swiper-slide>
        <slot></slot>
      </swiper-slide>
      <swiper-slide>
        <div class="md-body">
          <span v-html="ps"></span>
        </div>
        <logo></logo>
      </swiper-slide>
    </swiper>
  
  </div>
</template>

<script>
import { swiper, swiperSlide } from "vue-awesome-swiper";

import logo from "components/logo.vue";

import "swiper/dist/css/swiper.css";
import "assets/css/fonts.css";
import "assets/css/markdown.css";

function getToday() {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDueString() {
  return document.location.pathname.replace("index.html", "").slice(1);
}

function getDue() {
  return new Date(getDueString());
}

export default {
  name: "saikou",
  props: ["ps"],
  filters: {
    formatDate(date) {
      return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join(
        "/"
      );
    }
  },
  components: {
    swiper,
    swiperSlide,
    logo
  },
  data() {
    return {
      expired: true,
      swiperOption: {
        direction: "vertical"
      },
      due: getDue(),
      today: getToday()
    };
  },
  methods: {
    calcDuration() {
      return (this.today - this.due) / (1000 * 3600 * 24).toFixed();
    }
  },
  created() {
    this.expired = this.today > this.due;
    if (this.expired) {
      document.title = getDueString();
      setTimeout(function() {
        location.replace("../../../");
      }, 3000);
    }
  }
};
</script>
 
<style>
[v-cloak] {
  display: none;
}

html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "Noto Serif CJK SC";
  font-weight: 100;
  font-size: 20px;
}
</style>

<style scoped>
.main {
  width: 100%;
  height: 100%;
}

.expired {
  position: absolute;
  width: fit-content;
  height: fit-content;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.swiper-container {
  height: 100%;
  width: 100%;
}

.swiper-slide {
  height: 100%;
  width: 100%;
}
</style>