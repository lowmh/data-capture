module.exports = {
  apps: [
    {
      name: "react-app",
      script: "serve",
      args: "build -l 3000 --no-cache",
      watch: ["build"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
