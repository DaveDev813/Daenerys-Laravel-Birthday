<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-three(
  ref='sectionRef'
  :style='sectionThreeStyle'
)
  iframe.birthday-section-three__short(
    v-if='isShortLoaded'
    :src='youtubeShortEmbedUrl'
    title='Birthday YouTube Short'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    referrerpolicy='strict-origin-when-cross-origin'
    allowfullscreen
  )
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import bg1Url from 'src/assets/images/bg/bg1.png';

const sectionRef = ref(null);
const isShortLoaded = ref(false);
const youtubeShortId = 'DB0qEwxM0rQ';
const youtubeShortEmbedUrl = `https://www.youtube.com/embed/${youtubeShortId}?autoplay=1&playsinline=1&playlist=${youtubeShortId}&rel=0`;
const sectionThreeStyle = {
  backgroundImage: `url(${bg1Url})`,
};
let sectionObserver = null;

const loadShort = () => {
  isShortLoaded.value = true;
  sectionObserver?.disconnect();
  sectionObserver = null;
};

onMounted(() => {
  const sectionElement = sectionRef.value;

  if (!sectionElement) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    loadShort();
    return;
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const isSectionInView = entries.some(
        (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5
      );

      if (isSectionInView) {
        loadShort();
      }
    },
    {
      root: sectionElement.closest('.birthday-stage'),
      threshold: [0.5],
    }
  );

  sectionObserver.observe(sectionElement);
});

onBeforeUnmount(() => {
  sectionObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
.birthday-section-three {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: #000;
}

.birthday-section-three__short {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
