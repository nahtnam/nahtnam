<template>
  <div>
    <div class="columns">
      <div v-for="project in projects" :key="project.name" class="column">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title is-centered">
              {{ project.name }}
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              <p>{{ project.description }}</p>
              <div class="tags">
                <span v-for="tag in project.stack.concat().sort()" :key="tag" class="tag is-black" :style="{ 'background-color': color(tag) }">{{ tag }}</span>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="card-footer-item">
              <span class="icon">
                <font-awesome-icon icon="eye" />
              </span>
              View
            </a>
            <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="card-footer-item">
              <span class="icon">
                <font-awesome-icon :icon="['fab', 'github']" />
              </span>
              Source
            </a>
          </footer>
        </div>
      </div>
    </div>
    <nuxt-link to="/projects">
      <a class="button is-fullwidth is-info is-outlined">
        <span class="icon">
          <font-awesome-icon icon="code" />
        </span>
        <span>View All Projects</span>
      </a>
    </nuxt-link>
  </div>
</template>

<script>
import { projects } from '@/static/home/projects.json';
import color from '@/utils/projects/tag-color';

export default {
  data() {
    return {
      projects: projects.filter(obj => obj.showcase),
    };
  },

  methods: {
    color,
  },
};
</script>

<style lang="scss" scoped>
.card-footer-item .icon {
  padding-right: 1em;
}
</style>
