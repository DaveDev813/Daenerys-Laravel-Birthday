<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-three(
  :style='sectionThreeStyle'
)
</template>

<script setup>
import bg1Url from 'src/assets/images/bg/bg1.png';

const sectionThreeStyle = {
  backgroundImage: `url(${bg1Url})`,
};
</script>

<style lang="scss" scoped>
.birthday-section-three {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
