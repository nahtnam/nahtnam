<template>
  <div>
    <div class="columns">
      <div class="column">
        <div>
          <p class="title is-marginless" :class="{ 'is-loading': contributions.loading }">
            {{ contributions.text }}+
          </p>
          <p class="heading">
            Contributions on GitHub
          </p>
        </div>
      </div>
      <div class="column">
        <div>
          <p class="title is-marginless" :class="{ 'is-loading': age.loading }">
            {{ age.text }}
          </p>
          <p class="heading">
            Years Old
          </p>
        </div>
      </div>
      <div class="column">
        <div>
          <p class="title is-marginless" :class="{ 'is-loading': repos.loading }">
            {{ repos.text }}+
          </p>
          <p class="heading">
            Repos Created
          </p>
        </div>
      </div>
    </div>
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
      repos: {
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

    await Promise.all([this.getContributions(), this.getRepos()]);
  },

  beforeDestroy() {
    if (!this.ageInterval) {
      return;
    }
    clearInterval(this.ageInterval);
  },

  methods: {
    async getRepos() {
      try {
        const users = ['nahtnam', 'j-tester', 'ludicrousxyz', 'srvrjs'];
        const reqsArr = users.map(usr => fetch(`https://api.github.com/users/${usr}`));
        const reqs = await Promise.all(reqsArr);
        const res = await Promise.all(reqs.map(r => r.json()));
        const reposCount = res.reduce((acc, val) => acc + val.public_repos, 0);
        this.repos.text = reposCount;
      } catch (_) {
        // do nothing
      }
      this.repos.loading = false;
    },

    async getContributions() {
      try {
        const req = await fetch('https://github-contributions-api.now.sh/v1/nahtnam');
        const { years } = await req.json();
        const total = years.reduce((acc, val) => acc + val.total, 0);
        this.contributions.text = total.toLocaleString();
      } catch (_) {
        // do nothing
      }
      this.contributions.loading = false;
    },

    getAge(birthday = 'October 10, 1999') {
      const diff = Date.now() - (new Date(birthday).getTime());
      const age = diff / (1000 * 60 * 60 * 24 * 365);
      this.age.text = age.toFixed(7);
    },
  },
};
</script>
