<template lang="pug">
q-page.birthday-page
  //- div.embed-frame-wrapper
    //- iframe(
    //-   class='embed-frame'
    //-   title='Birthday presentation'
    //-   loading='lazy'
    //-   src='https://www.canva.com/design/DAHGtsPmOsc/EXoz4BvkUK8L6LmeXHPbqQ/watch?embed&autoplay=1'
    //-   allowfullscreen
    //-   allow='autoplay; fullscreen'
  //- )
  .birthday-viewport(:class='{ "birthday-viewport--mobile": isMobileViewport, "birthday-viewport--mobile-landscape": isMobileLandscape }')
    .birthday-stage(ref='stageRef')
      .birthday-section
        SectionOne
      .birthday-section
        SectionTwo

</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import SectionOne from '../components/SectionOne.vue';
import SectionTwo from '../components/SectionTwo.vue';

const isMobileViewport = ref(false);
const isLandscapeViewport = ref(false);
const stageRef = ref(null);
let lastTouchX = 0;

const isMobileLandscape = computed(
  () => isMobileViewport.value && isLandscapeViewport.value
);

const updateViewportState = () => {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const hasMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    );
  const hasTouchInput =
    window.matchMedia('(pointer: coarse)').matches ||
    window.navigator.maxTouchPoints > 0;

  isMobileViewport.value = hasMobileUserAgent || hasTouchInput;
  isLandscapeViewport.value = viewportWidth > viewportHeight;
};

const handleLandscapeTouchStart = (event) => {
  lastTouchX = event.touches[0]?.clientX ?? 0;
};

const handleLandscapeTouchMove = (event) => {
  if (
    !isMobileLandscape.value ||
    !stageRef.value ||
    event.touches.length === 0
  ) {
    return;
  }

  const touchX = event.touches[0].clientX;
  const deltaX = lastTouchX - touchX;

  stageRef.value.scrollTop += deltaX;
  lastTouchX = touchX;
  event.preventDefault();
};

const handleLandscapeWheel = (event) => {
  if (!isMobileLandscape.value || !stageRef.value || event.deltaX === 0) {
    return;
  }

  stageRef.value.scrollTop += event.deltaX;
  event.preventDefault();
};

onMounted(() => {
  updateViewportState();

  window.addEventListener('resize', updateViewportState);
  window.addEventListener('orientationchange', updateViewportState);
  window.visualViewport?.addEventListener('resize', updateViewportState);
  stageRef.value?.addEventListener('touchstart', handleLandscapeTouchStart, {
    passive: true,
  });
  stageRef.value?.addEventListener('touchmove', handleLandscapeTouchMove, {
    passive: false,
  });
  stageRef.value?.addEventListener('wheel', handleLandscapeWheel, {
    passive: false,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState);
  window.removeEventListener('orientationchange', updateViewportState);
  window.visualViewport?.removeEventListener('resize', updateViewportState);
  stageRef.value?.removeEventListener('touchstart', handleLandscapeTouchStart);
  stageRef.value?.removeEventListener('touchmove', handleLandscapeTouchMove);
  stageRef.value?.removeEventListener('wheel', handleLandscapeWheel);
});
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
