<template>
  <div>
    <section class="hero is-medium is-black">
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
    </section>
    <div id="content">
      <section id="first-section" class="section">
        <div class="container">
          <div class="columns">
            <div class="column is-three-quarters">
              <div class="has-text-centered">
                <h1 class="header subtitle">
                  Shout-Outs
                </h1>
                <Quote />
              </div>
            </div>
            <div class="column is-one-quarter">
              <h1 class="header subtitle has-text-centered">
                Work Experience
              </h1>
              <Timeline />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Timeline from '@/components/home/Timeline.vue';
import Quote from '@/components/home/Quote.vue';

export default {
  components: {
    Timeline,
    Quote,
  },
};
</script>
