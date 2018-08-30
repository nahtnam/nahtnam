<template>
  <nav class="navbar is-white has-shadow" id="main-navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item has-text-weight-bold" to="/">
          <span class="is-size-5">nahtnam</span>
        </router-link>

        <div class="navbar-burger burger" :class="{ 'is-active': active }" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': active }">
        <div class="navbar-end">
          <nuxt-link to="/" class="navbar-item" active-class="is-active" @click.native="closeMenu" exact>Home</nuxt-link>
          <nuxt-link to="/projects" class="navbar-item" active-class="is-active" @click.native="closeMenu">Projects</nuxt-link>
          <nuxt-link to="/photos" class="navbar-item" active-class="is-active" @click.native="closeMenu">Photos</nuxt-link>
          <a href="/resume.pdf" class="navbar-item">Résumé</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navigation',
  data() {
    return {
      active: false,
    };
  },
  methods: {
    closeMenu() {
      this.active = false;
    },
    toggleMenu() {
      this.active = !this.active;
    },
  },
};
</script>
