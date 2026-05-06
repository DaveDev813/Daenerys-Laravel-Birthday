<template lang="pug">
.full-width.full-height
  .svg-wrapper(v-html="SuccessLogo")
</template>

<script setup>
import SuccessLogo from 'src/svg/section1.svg?raw'

</script>

<style lang="scss" scoped>
.svg-wrapper {
  :deep(svg) {
    width: 100%;
    height: 100%;
  }

}
</style>
