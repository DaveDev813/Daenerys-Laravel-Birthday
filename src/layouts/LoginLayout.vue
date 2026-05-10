<template lang="pug">

q-layout(view='lHh Lpr lFf')
  .row.q-mb-md#login-layout
    .col-6#left-side
      q-img(src='../assets/images/contact.jpg').tint2.fit
    .col-6#right-side
      q-page-container
        router-view

  q-footer.bg-primary-8.text-accent
    q-toolbar
      q-toolbar-title.text-secondary
        #footer.text-left.q-pr-md
          | Daenerys Laravel Bobadilla -Christening & Birthday

</template>

<script>
import { defineComponent } from 'vue';
import LogoImg from '../assets/images/logo/logo.png';
import InstallPWAButton from 'components/InstallPWAButton.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    InstallPWAButton
  },
  data() {
    return {
      LogoImg,
      APP_VERSION: process.env.APP_VERSION,
      API_VERSION: process.env.API_VERSION,
      SERVER_ENV: process.env.SERVER_ENV,
    };
  },

  setup() {
    console.log(
      '%c APP VERSION v' + process.env.APP_VERSION + ' ',
      'background-color: #00d82a; font-weight: bolder; color: #252725'
    );
    console.log(
      '%c API VERSION v' + process.env.API_VERSION + ' ',
      'background-color: #bb3a00; font-weight: bolder; color: #feb898'
    );

    return {};
  },
});
</script>

<style lang="scss" scoped>
@media (max-width: 860px) {
  #login-layout {
    #left-side {
      display: none;
    }

    #right-side {
      width: 100%;
    }
  }
}
</style>
