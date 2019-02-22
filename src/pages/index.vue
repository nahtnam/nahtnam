<template>
  <div>
    <section class="hero is-fullheight-with-navbar is-black">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="header title">
            Hi, I'm Manthan.
          </h1>
          <h2 class="header subtitle is-6 has-text-weight-light">
            I'm known online as <a href="https://keybase.io/nahtnam" class="has-text-weight-bold is-lowercase" target="_blank" rel="noopener noreferrer">@nahtnam</a>.
          </h2>
        </div>
      </div>
      <div class="hero-foot has-text-centered">
        <span class="icon">
          <font-awesome-icon icon="chevron-down" size="lg" />
        </span>
        <br>
        <br>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-one-third is-offset-two-thirds">
            <h1 class="header subtitle has-text-centered">Work Experience</h1>
            <Timeline />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Timeline from '@/components/resume/Timeline.vue';

export default {
  components: {
    Timeline,
  },
};
</script>
