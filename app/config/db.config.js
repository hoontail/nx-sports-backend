module.exports = {
  HOST: "103.7.239.136",
  USER: "sa",
  PASSWORD: "K0sc@qhDks1357@@##",
  DB: "kosc77",
  dialect: "mssql",
  timezone: "+09:00",
  dialectOptions: {
    options: {
      requestTimeout: 300000,
    },
  },
  pool: {
    max: 214,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    timestamps: true,
  },
};
