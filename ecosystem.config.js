module.exports = {
  apps: [
    {
      name: "data-capture",
      script: "serve",
      args: "-s build",
      env: {
        PORT: 3000,
      },
    },
  ],
};
