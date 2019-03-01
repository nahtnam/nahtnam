<template>
  <v-app>
    <Navigation />
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
import Navigation from '@/components/Navigation.vue';

export default {
  components: {
    Navigation,
  },
};
</script>1
