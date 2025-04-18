module.exports = {
  apps: [
    {
      name: "server",
      script: "./server.js",
      instance_var: "INSTANCE_ID",
      instances: 8,
      exec_mode: "cluster",
      wait_ready: true,
      listen_timeout: 50000,
    },
  ],
};
