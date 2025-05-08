const SequelizeAuto = require("sequelize-auto");
const auto = new SequelizeAuto("kosc77", "kosc_user1", "plS7Z_K9N6TH", {
  host: "111.92.246.87",
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
