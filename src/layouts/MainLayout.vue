<template lang="pug">
q-layout(:class="$q.platform.is.mobile ? 'isMobile' : ''")
  q-page-container
    router-view
</template>

<script setup>


</script>

<style lang="scss" scoped></style>
