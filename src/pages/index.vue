<template>
  <v-content>
    <v-container fluid class="black white--text text-xs-center hero">
      <h1 class="display-1 caps font-weight-bold">Hi, I'm Manthan.</h1>
      <h2 class="subheading caps">I'm known online as <a href="https://keybase.io/nahtnam" class="text-none font-weight-bold no-underline white--text" target="_blank" rel="noopener noreferrer">@nahtnam</a>.</h2>
    </v-container>
    <v-container>
      <v-layout row wrap>
        <v-flex md9>
          <v-card dark color="primary">
            <v-card-text class="px-0">12</v-card-text>
          </v-card>
        </v-flex>
        <v-flex md3>
          <Timeline />
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
import Timeline from '@/components/index/Timeline.vue';

export default {
  components: {
    Timeline,
  },
};
</script>

<style lang="scss" scoped>
.hero {
  padding-top: 10em;
  padding-bottom: 10em;
}
</style>
