<template>
  <div class="home">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container has-text-centered">
          <img src="../assets/images/nahtnam.png" style="border-radius: 50%;" width="192px">
          <h1 class="title">
            Manthan Mallikarjun
          </h1>
          <h2 class="subtitle">
            I'm also known as <a href="https://keybase.io/nahtnam" class="has-text-weight-bold" target="_blank">@nahtnam</a>.
          </h2>
        </div>
      </div>
    </section>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-two-thirds">
              <h1 class="title">
                Hello! My name is <a href="https://www.linkedin.com/in/nahtnam/" target="_blank">Manthan Mallikarjun</a>,
              </h1>
              <h2 class="subtitle">
                  but I'm known online as <a href="https://keybase.io/nahtnam" target="_blank">@nahtnam</a>.
                  I enjoy programming in languages like <strong>JavaScript</strong> (<strong>Node</strong>), exploring frameworks like <strong>Vue</strong>, and researching emerging technology like <strong>Bitcoin</strong>.
                  I also take photos when I find the time.
                  I am currently working on a few projects, including <strong><a href="https://github.com/srvrjs/srvr" target="_blank">srvr</a></strong>, and <strong><a href="https://github.com/ludicrousxyz/tab" target="_blank">ludicrous tab</a></strong>, as well as conducting research on cryptocurrencies like <strong>Ethereum</strong> at UC Santa Cruz.
              </h2>
            </div>
            <div class="column is-one-third">
              <h1 class="title">Find me everywhere.</h1>
              <div class="columns subtitle is-size-5">
                <div class="column">
                  <a href="https://github.com/nahtnam" target="_blank" class="icon-github">
                    <font-awesome-icon :icon="['fab', 'github']" />
                    <span> Github</span>
                  </a>
                  <br>
                  <a href="https://twitter.com/nahtnam" target="_blank" class="icon-twitter">
                    <font-awesome-icon :icon="['fab', 'twitter']" />
                    <span> Twitter</span>
                  </a>
                  <br>
                  <a href="https://www.instagram.com/nahtnam13/" target="_blank" class="icon-instagram">
                    <font-awesome-icon :icon="['fab', 'instagram']" />
                    <span> Instagram</span>
                  </a>
                  <br>
                  <a href="https://www.facebook.com/nahtnam" target="_blank" class="icon-facebook">
                    <font-awesome-icon :icon="['fab', 'facebook-square']" />
                    <span> Facebook</span>
                  </a>
                </div>
                <div class="column">
                  <a href="https://www.linkedin.com/in/nahtnam/" target="_blank" class="icon-linkedin">
                    <font-awesome-icon :icon="['fab', 'linkedin']" />
                    <span> LinkedIn</span>
                  </a>
                  <br>
                  <a href="https://stackoverflow.com/users/2537559/nahtnam" target="_blank" class="icon-stack-overflow">
                    <font-awesome-icon :icon="['fab', 'stack-overflow']" />
                    <span> Stack Overflow</span>
                  </a>
                  <br>
                  <a href="https://steamcommunity.com/id/nahtnam" target="_blank" class="icon-steam">
                    <font-awesome-icon :icon="['fab', 'steam-square']" />
                    <span> Steam</span>
                  </a>
                  <br>
                  <a href="https://bitcointalk.org/index.php?action=profile;u=138245" target="_blank" class="icon-bitcoin">
                    <font-awesome-icon :icon="['fab', 'bitcoin']" />
                    <span> Bitcoin Talk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <hr>
    <section class="section">
      <div class="container">
        <div class="title underline">Here are some of my projects.</div>
        <div class="columns">
          <div class="column is-one-third" v-for="project in this.projects" :key="project.name">
            <div class="card">
              <div class="card-content">
                <p class="title no-pad-bottom">
                  {{ project.name }}
                </p>
                <p class="is-size-6">
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
        <div class="has-text-centered">
          <router-link to="/projects" class="button is-info is-medium">
            <span class="icon">
              <font-awesome-icon :icon="['fa', 'code']" />
            </span>
            <span>View All Projects</span>
          </router-link>
        </div>
      </div>
    </section>
    <hr>
    <section class="section">
      <div class="container">
        <div class="title">Enjoy some of the photos I took on vacation.</div>
        <div class="columns">
          <div class="column is-one-third" v-for="photo in this.photos" :key="photo.caption">
            <a href="${photo.url}" target="_blank">
              <div class="card">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img :src="photo.url" alt="Image">
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
        <div class="has-text-centered">
          <router-link to="/photos" class="button is-info is-medium">
            <span class="icon">
              <font-awesome-icon :icon="['fa', 'camera']" />
            </span>
            <span>View All Photos</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { projects } from '@/../public/projects.json';
import { photos } from '@/../public/photos.json';

export default {
  name: 'home',
  data() {
    return {
      projects: [],
      photos: [],
    };
  },

  created() {
    this.projects = projects.slice().sort(() => 0.5 - Math.random()).slice(0, 3);
    this.photos = photos.slice().sort(() => 0.5 - Math.random()).slice(0, 3);
  },
};
</script>
