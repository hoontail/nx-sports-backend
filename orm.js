const SequelizeAuto = require("sequelize-auto");
const auto = new SequelizeAuto("kosc77", "sa", "K0sc@qhDks1357@@##", {
  host: "103.7.239.136",
  port: 1433,
  dialect: "mssql",
  //noAlias: true // as 별칭 미설정 여부
  additional: {
    timestamps: false,
  },
});
auto.run((err) => {
  if (err) throw err;
});
