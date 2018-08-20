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
          <router-link to="/" class="navbar-item" active-class="is-active" exact @click.native="closeMenu">Home</router-link>
          <router-link to="/projects" class="navbar-item" active-class="is-active" @click.native="closeMenu">Projects</router-link>
          <router-link to="/photos" class="navbar-item" active-class="is-active" @click.native="closeMenu">Photos</router-link>
          <a href="https://blog.nahtnam.com" class="navbar-item">Blog</a>
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
