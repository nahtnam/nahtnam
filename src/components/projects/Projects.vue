<template>
  <div>
    <div v-for="project in projects" :key="project.name" class="columns is-vcentered project">
      <div class="column">
        <a :href="project.url || project.github" target="_blank" rel="noopener noreferrer" class="title">{{ project.name }}</a>
      </div>
      <div class="column is-one-third">
        {{ project.description }}
      </div>
      <div class="column">
        <div v-if="project.stack" class="tags">
          <span v-for="tag in project.stack.concat().sort()" :key="tag" class="tag is-black" :style="{ 'background-color': color(tag) }">{{ tag }}</span>
        </div>
      </div>
      <div class="column has-text-centered">
        <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="button is-info is-outlined">
          <span class="icon">
            <font-awesome-icon icon="eye" />
          </span>
          <span>View</span>
        </a>
        <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer" class="button is-primary is-outlined">
          <span class="icon">
            <font-awesome-icon :icon="['fab', 'github']" />
          </span>
          <span>Source</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { projects } from '@/static/home/projects.json';
import color from '@/utils/projects/tag-color';

export default {
  data() {
    return {
      projects,
    };
  },

  methods: {
    color,
  },
};
</script>

<style lang="scss" scoped>
.project {
  padding: 0.5em;
}
</style>
