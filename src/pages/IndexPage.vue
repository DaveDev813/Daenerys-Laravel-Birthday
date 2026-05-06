<template lang="pug">
q-page.birthday-page
  .birthday-viewport(:class='{ "birthday-viewport--mobile": isMobileViewport, "birthday-viewport--mobile-landscape": isMobileLandscape }')
    .birthday-stage(ref='stageRef')
      .birthday-section(ref='sectionOneRef')
        component(v-if='SectionOneComponent' :is='SectionOneComponent')
        .birthday-loader(
          v-else
          role='status'
          aria-live='polite'
          aria-label='Loading birthday section'
        )
          .birthday-spinner
      .birthday-section(ref='sectionTwoRef')
        component(v-if='SectionTwoComponent' :is='SectionTwoComponent')
        .birthday-loader(
          v-else
          role='status'
          aria-live='polite'
          aria-label='Loading birthday section'
        )
          .birthday-spinner

</template>

<script setup>
import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
} from 'vue';

const isMobileViewport = ref(false);
const isLandscapeViewport = ref(false);
const stageRef = ref(null);
const sectionOneRef = ref(null);
const sectionTwoRef = ref(null);
const SectionOneComponent = shallowRef(null);
const SectionTwoComponent = shallowRef(null);
const loadingSections = new Set();
let lastTouchX = 0;
let sectionObserver = null;

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

const loadSectionComponent = async (sectionName, target, loader) => {
  if (target.value || loadingSections.has(sectionName)) {
    return;
  }

  loadingSections.add(sectionName);

  try {
    const sectionModule = await loader();
    target.value = markRaw(sectionModule.default);
  } catch (error) {
    console.error(`Unable to load birthday section "${sectionName}"`, error);
  } finally {
    loadingSections.delete(sectionName);
  }
};

const loadSection = (sectionName) => {
  if (sectionName === 'one') {
    return loadSectionComponent(sectionName, SectionOneComponent, () =>
      import('../components/SectionOne.vue')
    );
  }

  return loadSectionComponent(sectionName, SectionTwoComponent, () =>
    import('../components/SectionTwo.vue')
  );
};

const isSectionInStageView = (sectionElement) => {
  if (!stageRef.value || !sectionElement) {
    return false;
  }

  const stageRect = stageRef.value.getBoundingClientRect();
  const sectionRect = sectionElement.getBoundingClientRect();

  return (
    sectionRect.bottom > stageRect.top &&
    sectionRect.top < stageRect.bottom &&
    sectionRect.right > stageRect.left &&
    sectionRect.left < stageRect.right
  );
};

const loadSectionIfVisible = (sectionElement, sectionName) => {
  if (isSectionInStageView(sectionElement)) {
    void loadSection(sectionName);
  }
};

const handleStageScroll = () => {
  loadSectionIfVisible(sectionOneRef.value, 'one');
  loadSectionIfVisible(sectionTwoRef.value, 'two');
};

const handleSectionIntersection = (entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    if (entry.target === sectionOneRef.value) {
      void loadSection('one');
    }

    if (entry.target === sectionTwoRef.value) {
      void loadSection('two');
    }

    sectionObserver?.unobserve(entry.target);
  });
};

const initSectionLoading = () => {
  if (!stageRef.value || !sectionOneRef.value || !sectionTwoRef.value) {
    return;
  }

  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver(handleSectionIntersection, {
      root: stageRef.value,
      threshold: 0.01,
    });
    sectionObserver.observe(sectionOneRef.value);
    sectionObserver.observe(sectionTwoRef.value);
    return;
  }

  handleStageScroll();
  stageRef.value.addEventListener('scroll', handleStageScroll, {
    passive: true,
  });
};

onMounted(async () => {
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

  await nextTick();
  initSectionLoading();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportState);
  window.removeEventListener('orientationchange', updateViewportState);
  window.visualViewport?.removeEventListener('resize', updateViewportState);
  stageRef.value?.removeEventListener('touchstart', handleLandscapeTouchStart);
  stageRef.value?.removeEventListener('touchmove', handleLandscapeTouchMove);
  stageRef.value?.removeEventListener('wheel', handleLandscapeWheel);
  stageRef.value?.removeEventListener('scroll', handleStageScroll);
  sectionObserver?.disconnect();
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
