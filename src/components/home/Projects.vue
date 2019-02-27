<template>
  <div>
    <div class="tabs is-centered is-boxed">
      <ul>
        <li v-for="project in projects" :key="project.name" :class="{ 'is-active': project.name === selected }">
          <a @click="select(project.name)">{{ project.name }}</a>
        </li>
      </ul>
    </div>
    TODO
  </div>
</template>

<script>
import { projects } from '@/static/projects.json';

export default {
  data() {
    return {
      selected: 'ctrl tab',
      projects: Object.keys(projects).map(key => projects[key]).filter(obj => obj.showcase),
    };
  },

  methods: {
    select(name) {
      this.selected = name;
    },
  },
};
</script>
