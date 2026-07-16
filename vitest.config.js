module.exports = {
  test: {
    dir: './test/unit',
    globals: true,
    environment: 'node',
    include: ['test/unit/**/*.test.js'],
    timeout: 10000,
  },
};
