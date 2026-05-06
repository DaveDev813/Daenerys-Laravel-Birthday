<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-two(
  :style='sectionTwoStyle'
)
  img.birthday-section-two__image(
    :src='sectionTwoUrl'
    :class='{ "birthday-section-two__image--visible": isImageVisible }'
    alt=''
    aria-hidden='true'
  )
  button.birthday-section-two__option.birthday-section-two__option--join(
    type='button'
    aria-label='I love to come'
    @click='handleJoinClick'
  )
  button.birthday-section-two__option.birthday-section-two__option--decline(
    type='button'
    aria-label='Sorry, I cannot join'
    @click='handleDeclineClick'
  )
</template>

<script setup>
import { onMounted, ref } from 'vue';
import bg1Url from 'src/assets/images/bg/bg1.png';
import sectionTwoUrl from 'src/assets/images/section2.png';

const isImageVisible = ref(false);
const sectionTwoStyle = {
  backgroundImage: `url(${bg1Url})`,
};

const handleJoinClick = () => {
  window.alert('You selected: I love to come!');
};

const handleDeclineClick = () => {
  window.alert("You selected: Sorry, I can't join.");
};

onMounted(() => {
  requestAnimationFrame(() => {
    isImageVisible.value = true;
  });
});
</script>

<style lang="scss" scoped>
.birthday-section-two {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.birthday-section-two__image {
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

.birthday-section-two__image--visible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

.birthday-section-two__option {
  position: absolute;
  z-index: 1;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}

.birthday-section-two__option:focus-visible {
  outline: 2px solid rgba(175, 46, 67, 0.7);
  outline-offset: 4px;
  border-radius: 16px;
}

.birthday-section-two__option--join {
  left: 26.8%;
  top: 36.6%;
  width: 45.9%;
  height: 22.3%;
}

.birthday-section-two__option--decline {
  left: 26.9%;
  top: 62.7%;
  width: 46.3%;
  height: 21.3%;
}

@media (prefers-reduced-motion: reduce) {
  .birthday-section-two__image {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }
}
</style>
