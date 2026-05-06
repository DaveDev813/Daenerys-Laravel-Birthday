<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-one(
  :style='sectionOneStyle'
)
  img.birthday-section-one__image(
    :src='sectionOneUrl'
    :class='{ "birthday-section-one__image--visible": isImageVisible }'
    alt=''
    aria-hidden='true'
  )
</template>

<script setup>
import { onMounted, ref } from 'vue';
import bg1Url from 'src/assets/images/bg/bg1.png';
import sectionOneUrl from 'src/assets/images/schedule.png';

const isImageVisible = ref(false);
const sectionOneStyle = {
  backgroundImage: `url(${bg1Url})`,
};

onMounted(() => {
  requestAnimationFrame(() => {
    isImageVisible.value = true;
  });
});
</script>

<style lang="scss" scoped>
.birthday-section-one {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.birthday-section-one__image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  filter: blur(18px);
  transform: translateY(48px);
  transition:
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 900ms ease,
    opacity 650ms ease;
  will-change: transform, filter, opacity;
}

.birthday-section-one__image--visible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .birthday-section-one__image {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }
}
</style>
