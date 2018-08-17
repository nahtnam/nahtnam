<template>
  <nav class="navbar is-white has-shadow" id="main-navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item bold" to="/">
          <span class="is-size-5">nahtnam</span>
        </router-link>

        <div class="navbar-burger burger" :class="{ 'is-active': active }" @click="toggleActive">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': active }">
        <div class="navbar-end">
          <MenuItems />
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import MenuItems from '@/components/MenuItems.vue';

export default {
  name: 'Navigation',
  components: {
    MenuItems,
  },
  data() {
    return {
      active: false,
    };
  },
  methods: {
    toggleActive() {
      this.active = !this.active;
    },
  },
};
</script>
