<template>
  <div class="projects">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Photos
          </h1>
          <h2 class="subtitle">
            I try to take photos whenever I go out. Here are some of my best shots.
          </h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns" v-for="group in this.photos" :key="`group-${group[0].caption}`">
          <div class="column is-one-third" v-for="photo in group" :key="photo.caption">
            <a :href="photo.url" target="_blank">
              <div class="card">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img :src="photo.url" :alt="photo.caption">
                  </figure>
                </div>
                <div class="card-content">
                  <div class="media-content">
                    <p class="title is-4">{{ photo.caption }}</p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { photos } from '@/../public/photos.json';

export default {
  name: 'home',
  data() {
    return {
      photos: [],
    };
  },

  created() {
    this.photos = photos.map((e, i) => ((i % 3 === 0) ? photos.slice(i, i + 3) : null)).filter(e => e);
  },
};
</script>
