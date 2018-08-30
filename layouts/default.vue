<template>
  <div id="app">
    <Navigation />
    <main>
      <nuxt />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navigation from '~/components/Navigation.vue';
import Footer from '~/components/Footer.vue';

export default {
  components: {
    Navigation,
    Footer,
  },
};
</script>


<style lang="scss">
@import '~/assets/css/app.scss';
</style>
