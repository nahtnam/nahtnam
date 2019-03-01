<template>
  <div>
    <div class="columns no-margin-bottom is-vcentered" v-for="language in languages" :key="language.name">
      <div class="column is-one-third header is-size-7" v-html="language.name"></div>
      <div class="column">
        <progress class="progress is-large" :class="getColor(language.experience)" :value="language.experience" max="100">
          <div class="progress-bar">
            {{ language.experience }}%
          </div>
        </progress>
      </div>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash/orderby';
import { languages } from '@/static/languages.json';

export default {
  data() {
    return {
      languages: orderBy(languages, ['experience'], ['desc']).map((lang) => {
        const dup = Object.assign(lang, {});
        dup.name = dup.name.split('/').join('/&#8203');
        return dup;
      }),
    };
  },

  methods: {
    getColor(experience) {
      if (experience < 33) {
        return 'is-danger';
      }
      if (experience < 66) {
        return 'is-info';
      }
      return 'is-success';
    },
  },
};
</script>
