<template>
  <div>
    <div class="columns is-gapless is-multiline">
      <div class="column is-one-third photo" v-for="photo in photos" :key="photo.url">
        <a :href="photo.url" target="_blank" rel="noopener noreferrer">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img :src="photo.url" :alt="photo.caption">
              </figure>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { photos } from '@/static/data/photos.json';

export default {
  data() {
    return {
      photos,
    };
  },
};
</script>

<style lang="scss" scoped>
.photo {
  border: 1px solid white;
}
</style>
