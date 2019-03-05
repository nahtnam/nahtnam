<template>
  <div>
    <div class="columns is-vcentered project" v-for="project in projects" :key="project.name">
      <div class="column">
        <span class="title">{{ project.name }}</span>
      </div>
      <div class="column is-one-third">
        {{ project.description }}
      </div>
      <div class="column">
        <div class="tags" v-if="project.stack">
          <span class="tag is-black" v-for="tag in project.stack.concat().sort()" :key="tag" :style="{ 'background-color': color(tag) }">{{ tag }}</span>
        </div>
      </div>
      <div class="column has-text-centered">
        <a :href="project.url" v-if="project.url" target="_blank" rel="noopener noreferrer" class="button is-info is-outlined">
          <span class="icon">
            <font-awesome-icon icon="eye" />
          </span>
          <span>View</span>
        </a>
        <a :href="project.github" v-if="project.github" target="_blank" rel="noopener noreferrer" class="button is-primary is-outlined">
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
