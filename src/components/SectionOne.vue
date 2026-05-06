<template lang="pug">
.full-width.full-height.birthday-section-frame
  .birthday-section-svg(
    v-if='svgMarkup'
    v-html='svgMarkup'
  )
  .birthday-loader(
    v-if='isSvgLoading'
    role='status'
    aria-live='polite'
    aria-label='Loading birthday section'
  )
    .birthday-spinner
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import sectionOneUrl from 'src/svg/section1.svg?url';

const svgMarkup = ref('');
const isSvgLoading = ref(true);
const abortController = new AbortController();

const loadSvgMarkup = async () => {
  isSvgLoading.value = true;

  try {
    const response = await fetch(sectionOneUrl, {
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`SVG request failed with status ${response.status}`);
    }

    svgMarkup.value = await response.text();
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Unable to load section one SVG markup', error);
    }
  } finally {
    if (!abortController.signal.aborted) {
      isSvgLoading.value = false;
    }
  }
};

onMounted(() => {
  void loadSvgMarkup();
});

onBeforeUnmount(() => {
  abortController.abort();
});
</script>
