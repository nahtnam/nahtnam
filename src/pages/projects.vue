<template>
  <div>
    <section class="hero is-black">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="header title">
            Projects
          </h1>
          <h2 class="header subtitle is-6 has-text-weight-light">
            and Open Source
          </h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <Projects />
      </div>
    </section>
  </div>
</template>

<script>
import Projects from '@/components/projects/Projects.vue';

export default {
  components: {
    Projects,
  },
};
</script>
