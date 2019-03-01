<template>
  <div>
    <v-navigation-drawer v-model="active" absolute temporary>
      <v-list>
        <v-list-tile v-for="item in menu" :key="item.title" @click="go(item.to)">
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar dark color="black" class="elevation-0" clipped-left>
      <v-toolbar-side-icon class="hidden-sm-and-up"></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">nahtnam</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only" v-for="item in menu" :key="item.title">
        <v-btn :to="item.to" flat>{{ item.title }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: true,
      menu: [
        {
          title: 'Home',
          to: '/',
        },
      ],
    };
  },

  methods: {
    go(to) {
      this.$router.push({
        path: to,
      });
    },
  },
};
</script>
