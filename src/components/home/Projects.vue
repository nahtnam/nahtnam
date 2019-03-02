<template>
  <div>
    <div class="columns">
      <div class="column" v-for="project in projects" :key="project.name">
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
                <span class="tag is-black" v-for="tag in project.stack.concat().sort()" :key="tag" :style="{ 'background-color': color(tag) }">{{ tag }}</span>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <a :href="project.url" v-if="project.url" target="_blank" rel="noopener noreferrer" class="card-footer-item">
              <span class="icon">
                <font-awesome-icon icon="eye" />
              </span>
              View
            </a>
            <a :href="project.github" v-if="project.github" target="_blank" rel="noopener noreferrer" class="card-footer-item">
              <span class="icon">
                <font-awesome-icon :icon="['fab', 'github']" />
              </span>
              Source
            </a>
          </footer>
        </div>
      </div>
    </div>
    <a class="button is-fullwidth is-info is-outlined">
      <span class="icon">
        <font-awesome-icon icon="code" />
      </span>
      <span>View All Projects</span>
    </a>
  </div>
</template>

<script>
import { projects } from '@/static/home/projects.json';
import color from '@/utils/projects/tag-color';

export default {
  data() {
    return {
      projects: Object.keys(projects).map(key => projects[key]).filter(obj => obj.showcase),
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
