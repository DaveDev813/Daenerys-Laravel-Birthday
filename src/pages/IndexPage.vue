<template lang="pug">
q-page.birthday-page
  .birthday-viewport(:class='{ "birthday-viewport--mobile": isMobileViewport, "birthday-viewport--mobile-landscape": isMobileLandscape }')
    .birthday-stage(ref='stageRef')
      .birthday-section(
        v-for='section in birthdaySections'
        :key='section.id'
        :ref='(element) => setSectionRef(section.id, element)'
      )
        component(
          v-if='loadedSectionComponents[section.id]'
          :is='loadedSectionComponents[section.id]'
        )
        .birthday-loader(
          v-else
          role='status'
          aria-live='polite'
          aria-label='Loading birthday section'
        )
          .birthday-spinner
  img.scroll-down-indicator(
    :src='scrollDownImage'
    alt='Scroll down'
  )

</template>

<script setup>
import {
  computed,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowReactive,
} from 'vue';
import scrollDownImage from '../assets/images/scroll_down.png';

const isMobileViewport = ref(false);
const isLandscapeViewport = ref(false);
const stageRef = ref(null);
const sectionElements = new Map();
const loadedSectionComponents = shallowReactive({});
const loadingSections = new Set();
// Add new src/components/Section*.vue files and they will render here.
const sectionComponentModules = import.meta.glob('../components/Section*.vue');
const sectionNameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const sectionNumberNames = new Map([
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['eleven', 11],
  ['twelve', 12],
  ['thirteen', 13],
  ['fourteen', 14],
  ['fifteen', 15],
  ['sixteen', 16],
  ['seventeen', 17],
  ['eighteen', 18],
  ['nineteen', 19],
  ['twenty', 20],
]);
let lastTouchX = 0;
let sectionObserver = null;

const isMobileLandscape = computed(
  () => isMobileViewport.value && isLandscapeViewport.value
);

const getFileName = (path) => path.split('/').pop() ?? path;

const getSectionBaseName = (path) =>
  getFileName(path)
    .replace(/^Section/i, '')
    .replace(/\.vue$/i, '');

const getSectionId = (path) =>
  getSectionBaseName(path)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const getSectionOrder = (sectionId) => {
  if (/^\d+$/.test(sectionId)) {
    return Number(sectionId);
  }

  return sectionNumberNames.get(sectionId) ?? Number.MAX_SAFE_INTEGER;
};

const birthdaySections = Object.entries(sectionComponentModules)
  .map(([path, loader]) => ({
    id: getSectionId(path),
    path,
    loader,
  }))
  .sort((sectionA, sectionB) => {
    const sectionAOrder = getSectionOrder(sectionA.id);
    const sectionBOrder = getSectionOrder(sectionB.id);

    if (sectionAOrder !== sectionBOrder) {
      return sectionAOrder - sectionBOrder;
    }

    return sectionNameCollator.compare(
      getFileName(sectionA.path),
      getFileName(sectionB.path)
    );
  });

const setSectionRef = (sectionId, sectionElement) => {
  if (sectionElement) {
    sectionElements.set(sectionId, sectionElement);
    return;
  }

  sectionElements.delete(sectionId);
};

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

const loadSectionComponent = async (section) => {
  if (loadedSectionComponents[section.id] || loadingSections.has(section.id)) {
    return;
  }

  loadingSections.add(section.id);

  try {
    const sectionModule = await section.loader();
    loadedSectionComponents[section.id] = markRaw(sectionModule.default);
  } catch (error) {
    console.error(`Unable to load birthday section "${section.id}"`, error);
  } finally {
    loadingSections.delete(section.id);
  }
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

const loadSectionIfVisible = (section) => {
  const sectionElement = sectionElements.get(section.id);

  if (isSectionInStageView(sectionElement)) {
    void loadSectionComponent(section);
  }
};

const handleStageScroll = () => {
  birthdaySections.forEach(loadSectionIfVisible);
};

const getSectionByElement = (sectionElement) => {
  return birthdaySections.find(
    (section) => sectionElements.get(section.id) === sectionElement
  );
};

const handleSectionIntersection = (entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const section = getSectionByElement(entry.target);
    if (!section) {
      return;
    }

    void loadSectionComponent(section);
    sectionObserver?.unobserve(entry.target);
  });
};

const initSectionLoading = () => {
  const allSectionElementsReady = birthdaySections.every((section) =>
    sectionElements.has(section.id)
  );

  if (!stageRef.value || !allSectionElementsReady) {
    return;
  }

  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver(handleSectionIntersection, {
      root: stageRef.value,
      rootMargin: '200% 0px',
      threshold: 0.01,
    });
    birthdaySections.forEach((section) => {
      sectionObserver.observe(sectionElements.get(section.id));
    });
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

.scroll-down-indicator {
  position: fixed;
  left: 90%;
  bottom: -89px;
  z-index: 20;
  width: 100px;
  height: auto;
  pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.28));
  transform: translate3d(-50%, 0, 0);
  animation: scroll-down-indicator-bounce 1.35s ease-in-out infinite;
  will-change: transform;
}

@keyframes scroll-down-indicator-bounce {

  0%,
  100% {
    transform: translate3d(-50%, 0, 0);
  }

  50% {
    transform: translate3d(-50%, -12px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-down-indicator {
    animation: none;
  }
}
</style>
