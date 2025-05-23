const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
  timezone: config.timezone,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  logging: false,
});

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sports_matches.hasMany(db.sports_odds, {
  foreignKey: "match_id",
  sourceKey: "match_id",
});

db.sports_odds.belongsTo(db.sports_matches, {
  foreignKey: "match_id",
  targetKey: "match_id",
});

db.sports_odds.hasOne(db.sports_market, {
  foreignKey: "market_id",
  sourceKey: "market_id",
});

db.up_users.hasMany(db.sports_bet_history, {
  foreignKey: "username",
  sourceKey: "username",
});

db.sports_bet_history.belongsTo(db.up_users, {
  foreignKey: "username",
  targetKey: "username",
});

db.sports_bet_detail.hasOne(db.sports_market, {
  foreignKey: "market_id",
  sourceKey: "market_id",
});

db.sports_bet_history.hasMany(db.sports_bet_detail, {
  foreignKey: "sports_bet_history_id",
  sourceKey: "id",
});

db.sports_bet_detail.belongsTo(db.sports_bet_history, {
  foreignKey: "sports_bet_history_id",
  targetKey: "id",
});

db.mini_bet_history.hasOne(db.mini_bet_type, {
  foreignKey: "id",
  sourceKey: "mini_bet_type_id",
});

db.mini_bet_history.hasOne(db.up_users, {
  foreignKey: "username",
  sourceKey: "username",
});

module.exports = db;
