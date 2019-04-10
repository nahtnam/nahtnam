const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const withSass = require('@zeit/next-sass');

const copyFile = promisify(fs.copyFile);

module.exports = withSass({
  exportPathMap: async (
    defaultPathMap,
    {
      dev,
      dir,
      outDir,
    },
  ) => {
    if (dev) {
      return defaultPathMap;
    }
    await copyFile(join(dir, 'static/resume.pdf'), join(outDir, 'resume.pdf'));
    return defaultPathMap;
  },
});
