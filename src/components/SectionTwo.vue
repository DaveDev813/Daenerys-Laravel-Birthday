<template lang="pug">
.full-width.full-height
  .svg-wrapper(v-html="Section2")
</template>

<script setup>
import Section2 from 'src/svg/section2.svg?raw'

</script>

<style lang="scss" scoped>
.svg-wrapper {
  :deep(svg) {
    width: 100%;
    height: 100%;
  }

}
</style>
