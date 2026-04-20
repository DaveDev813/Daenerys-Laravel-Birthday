<template lang="pug">
q-page
  div.embed-frame-wrapper
    iframe(
      class='embed-frame'
      title='Birthday presentation'
      loading='lazy'
      src='https://www.canva.com/design/DAHGtsPmOsc/EXoz4BvkUK8L6LmeXHPbqQ/watch?embed&autoplay=1'
      allowfullscreen
      allow='autoplay; fullscreen'
    )

</template>

<script setup>


</script>

<style lang="scss" scoped>
.embed-frame-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 177.7778%;
  padding-bottom: 0;
  margin-top: 1.6em;
  margin-bottom: 0.9em;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(63, 69, 81, 0.16);
  will-change: transform;
}

.embed-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
}
</style>
