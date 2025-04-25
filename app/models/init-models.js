var DataTypes = require("sequelize").DataTypes;
var _balance_logs = require("./balance_logs");
var _level_configs = require("./level_configs");
var _rolling_points = require("./rolling_points");
var _sports_bet_detail = require("./sports_bet_detail");
var _sports_bet_history = require("./sports_bet_history");
var _sports_bonus_odds = require("./sports_bonus_odds");
var _sports_combine = require("./sports_combine");
var _sports_configs = require("./sports_configs");
var _sports_market = require("./sports_market");
var _sports_matches = require("./sports_matches");
var _sports_odds = require("./sports_odds");
var _up_users = require("./up_users");

function initModels(sequelize) {
  var balance_logs = _balance_logs(sequelize, DataTypes);
  var level_configs = _level_configs(sequelize, DataTypes);
  var rolling_points = _rolling_points(sequelize, DataTypes);
  var sports_bet_detail = _sports_bet_detail(sequelize, DataTypes);
  var sports_bet_history = _sports_bet_history(sequelize, DataTypes);
  var sports_bonus_odds = _sports_bonus_odds(sequelize, DataTypes);
  var sports_combine = _sports_combine(sequelize, DataTypes);
  var sports_configs = _sports_configs(sequelize, DataTypes);
  var sports_market = _sports_market(sequelize, DataTypes);
  var sports_matches = _sports_matches(sequelize, DataTypes);
  var sports_odds = _sports_odds(sequelize, DataTypes);
  var up_users = _up_users(sequelize, DataTypes);

  return {
    balance_logs,
    level_configs,
    rolling_points,
    sports_bet_detail,
    sports_bet_history,
    sports_bonus_odds,
    sports_combine,
    sports_configs,
    sports_market,
    sports_matches,
    sports_odds,
    up_users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
