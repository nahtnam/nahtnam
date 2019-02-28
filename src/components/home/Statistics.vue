<template>
  <div>
    <nav class="level">
      <div class="level-item has-text-centered">
        <div>
          <p class="title" :class="{ 'is-loading': contributions.loading }">
            {{ contributions.text }}
          </p>
          <p class="heading">
            Contributions
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title" :class="{ 'is-loading': contributions.loading }">
            TODO
          </p>
          <p class="heading">
            Posts Online
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title" :class="{ 'is-loading': contributions.loading }">
            TODO
          </p>
          <p class="heading">
            Followers
          </p>
        </div>
      </div>
      <div class="level-item has-text-centered">
        <div>
          <p class="title" :class="{ 'is-loading': age.loading }">
            {{ age.text }}
          </p>
          <p class="heading">
            Years Old
          </p>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {
      age: {
        text: '---',
        loading: true,
      },
      contributions: {
        text: '---',
        loading: true,
      },
    };
  },

  async created() {
    try {
      this.getAge();
      this.ageInterval = setInterval(this.getAge, 1000);
    } catch (_) {
      // do nothing
    }
    this.age.loading = false;

    try {
      await this.getContributions();
    } catch (_) {
      // do nothing
    }
    this.contributions.loading = false;
  },

  beforeDestroy() {
    if (!this.ageInterval) {
      return;
    }
    clearInterval(this.ageInterval);
  },

  methods: {
    async getContributions() {
      const req = await fetch('https://github-contributions-api.now.sh/v1/nahtnam');
      const { years } = await req.json();
      const total = years.reduce((acc, val) => acc + val.total, 0);
      this.contributions.text = total.toLocaleString();
    },

    getAge(birthday = 'October 10, 1999') {
      const diff = Date.now() - (new Date(birthday).getTime());
      const age = diff / (1000 * 60 * 60 * 24 * 365);
      this.age.text = age.toFixed(7);
    },
  },
};
</script>
