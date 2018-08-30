<template>
  <div class="projects">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Projects
          </h1>
          <h2 class="subtitle">
            I work on side-projects in different frameworks and programming languages whenever I find the time.
          </h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns content" v-for="group in this.projects" :key="`group-${group[0].name}`">
          <div class="column is-one-third" v-for="project in group" :key="project.name">
            <div class="card">
              <div class="card-content">
                <p class="title no-pad-bottom">
                  {{ project.name }}
                </p>
                <p class="is-size-5">
                  {{ project.description }}
                </p>
              </div>
              <footer class="card-footer">
                <a :href="project.github" v-if="project.github" target="_blank" class="card-footer-item">View on GitHub</a>
                <a :href="project.url" v-if="project.url" target="_blank" class="card-footer-item">View Project</a>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { projects } from '~/assets/data/projects.json';

export default {
  name: 'home',
  data() {
    return {
      projects: [],
    };
  },

  created() {
    this.projects = projects.map((e, i) => ((i % 3 === 0) ? projects.slice(i, i + 3) : null)).filter(e => e);
  },
};
</script>
