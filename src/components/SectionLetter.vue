<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-zero(
  :style='sectionZeroStyle'
)
  .birthday-section-zero__name(:style='nameStyle')
    .letterTo Letter to:
    .text-capitalize
     | {{ guestName }}
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import bg1Url from 'src/assets/images/bg/bg2.png';
import envelopeUrl from 'src/assets/images/envelope.png';

const route = useRoute();

const sectionZeroStyle = {
  backgroundImage: `url(${bg1Url})`,
};

const nameStyle = {
  backgroundImage: `url(${envelopeUrl})`,
};

const guestName = computed(() => {
  const nameFromQuery = route.query.n;
  const queryValue = Array.isArray(nameFromQuery)
    ? nameFromQuery.find((value) => typeof value === 'string' && value.trim())
    : nameFromQuery;

  return typeof queryValue === 'string' ? queryValue.trim() : '';
});
</script>

<style lang="scss" scoped>
.birthday-section-zero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  text-align: center;
}

.birthday-section-zero__name {
  transform: rotate(-9deg);
  width: 308.016px;
  aspect-ratio: 3 / 2;
  margin: 0;
  padding: 81px 21px 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  overflow-wrap: anywhere;
  color: #af2e43;
  font-family: cursive;
  font-size: 35px;
  font-weight: 700;
  line-height: 1.12;

  .letterTo {
    font-weight: bolder;
    margin-right: 176px;
    display: block;
    margin-bottom: 8px;
    font-size: 18px;
    color: #6d2b35;
  }
}
</style>
