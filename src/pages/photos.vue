<template>
  <div>
    <section class="hero is-black">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="header title">
            Photos
          </h1>
          <h2 class="header subtitle is-6 has-text-weight-light">
            (click to view)
          </h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <Photos />
      </div>
    </section>
  </div>
</template>

<script>
import Photos from '@/components/photos/Photos.vue';

export default {
  components: {
    Photos,
  },
};
</script>
