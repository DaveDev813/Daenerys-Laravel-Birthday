<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-three(
  :style='sectionThreeStyle'
)
  .q-pa-md.textss
    .text-h4(style='font-family: cursive;')
      | Church Location:
    .text-h6
      | <b> Santuario Di San Paolo </b>
      | Universita St., Corner Gesu St., Casa Milan Gate 3, Neopolitan V, Greater Lagro, Quezon City

    .map-actions.q-mt-md.text-center
      q-btn.map-action.map-action--google(
        :href='googleMapsUrl'
        target='_blank'
        rel='noopener noreferrer'
        no-caps
        unelevated
      )
        img.map-action__icon(:src='googleMapIcon' alt='' aria-hidden='true')
        span Google Map
      q-btn.map-action.map-action--waze(
        :href='wazeUrl'
        target='_blank'
        rel='noopener noreferrer'
        no-caps
        unelevated
      )
        img.map-action__icon(:src='wazeIcon' alt='' aria-hidden='true')
        span Waze

    iframe(
      src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.790323152602!2d121.05848837510854!3d14.724443285776724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b110d5cc2595%3A0x31d7f40dae252af!2sBonamy%20Building!5e0!3m2!1sen!2sph!4v1778401711485!5m2!1sen!2sph'
      width='100%' height='450'
      style='border:0;'
      allowfullscreen=''
      loading='lazy'
      referrerpolicy='no-referrer-when-downgrade'
    )
</template>

<script setup>
import bg1Url from 'src/assets/images/bg/bg2.png';
import googleMapIcon from 'src/assets/images/googleMap.png';
import wazeIcon from 'src/assets/images/waze.png';

const googleMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=Bonamy%20Building%2C%20Sforza%2C%20Novaliches%2C%20Quezon%20City%2C%20Metro%20Manila';
const wazeUrl =
  'https://waze.com/ul?q=Bonamy%20Building%2C%20Sforza%2C%20Novaliches%2C%20Quezon%20City%2C%20Metro%20Manila&navigate=yes';

const sectionThreeStyle = {
  backgroundImage: `url(${bg1Url})`,
};
</script>

<style lang="scss" scoped>
.textss {
  font-family: serif;
  margin-top: 30%;
}

.birthday-section-three {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.map-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  justify-content: center;
}

.map-action {
  min-width: 148px;
  height: 44px;
  border-radius: 6px;
  font-family: Arial, sans-serif;
  font-weight: 700;
  letter-spacing: 0;
}

.map-action :deep(.q-btn__content) {
  gap: 8px;
  flex-wrap: nowrap;
}

.map-action__icon {
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.map-action--google {
  background: #1a73e8;
  color: #fff;
}

.map-action--waze {
  background: #05c8f7;
  color: #092632;
}
</style>
