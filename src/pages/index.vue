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
            <div class="column no-pad-bottom is-three-quarters">
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  About Me
                </h1>
                <AboutMe />
              </div>
              <hr>
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  Statistics
                </h1>
                <Statistics />
              </div>
              <hr>
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  Projects
                </h1>
                <Projects />
              </div>
              <hr>
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  Social Media
                </h1>
                <Social />
              </div>
              <hr>
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  Shout-Outs
                </h1>
                <Quote />
              </div>
            </div>
            <div class="column no-pad-bottom is-one-quarter">
              <hr class="is-hidden-tablet">
              <div>
                <h1 class="header title is-4 has-text-centered">
                  Work
                </h1>
                <Timeline />
              </div>
              <hr>
              <div class="has-text-centered">
                <h1 class="header title is-4">
                  Experience
                </h1>
                <Languages />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import AboutMe from '@/components/home/AboutMe.vue';
import Statistics from '@/components/home/Statistics.vue';
import Projects from '@/components/home/Projects.vue';
import Social from '@/components/home/Social.vue';
import Quote from '@/components/home/Quote.vue';
import Timeline from '@/components/home/Timeline.vue';
import Languages from '@/components/home/Languages.vue';

export default {
  components: {
    AboutMe,
    Statistics,
    Projects,
    Social,
    Quote,
    Timeline,
    Languages,
  },
};
</script>
