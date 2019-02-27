<template>
  <div>
    <div class="tabs is-centered is-boxed">
      <ul>
        <li class="is-active" v-for="project in projects" :key="project.name">
          <a>{{ project.name }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { projects } from '@/static/projects.json';

export default {
  data() {
    return {
      projects: Object.keys(projects).map(key => projects[key]).filter(obj => obj.showcase),
    };
  },
};
</script>
