var DataTypes = require("sequelize").DataTypes;
var _balance_logs = require("./balance_logs");
var _level_configs = require("./level_configs");
var _sports_bet_detail = require("./sports_bet_detail");
var _sports_bet_history = require("./sports_bet_history");
var _sports_bonus_odds = require("./sports_bonus_odds");
var _sports_combine = require("./sports_combine");
var _sports_configs = require("./sports_configs");
var _sports_market = require("./sports_market");
var _sports_matches = require("./sports_matches");
var _sports_odds = require("./sports_odds");
var _sports_rate_config = require("./sports_rate_configs");
var _up_users = require("./up_users");
var _kosca_logs = require("./kosca_logs");
var _mini_bet_history = require("./mini_bet_history");
var _mini_bet_type = require("./mini_bet_type");
var _mini_configs = require("./mini_configs");
var _mini_games = require("./mini_games");

function initModels(sequelize) {
  var balance_logs = _balance_logs(sequelize, DataTypes);
  var level_configs = _level_configs(sequelize, DataTypes);
  var sports_bet_detail = _sports_bet_detail(sequelize, DataTypes);
  var sports_bet_history = _sports_bet_history(sequelize, DataTypes);
  var sports_bonus_odds = _sports_bonus_odds(sequelize, DataTypes);
  var sports_combine = _sports_combine(sequelize, DataTypes);
  var sports_configs = _sports_configs(sequelize, DataTypes);
  var sports_market = _sports_market(sequelize, DataTypes);
  var sports_matches = _sports_matches(sequelize, DataTypes);
  var sports_odds = _sports_odds(sequelize, DataTypes);
  var sports_rate_configs = _sports_rate_config(sequelize, DataTypes);
  var up_users = _up_users(sequelize, DataTypes);
  var kosca_logs = _kosca_logs(sequelize, DataTypes);
  var mini_bet_history = _mini_bet_history(sequelize, DataTypes);
  var mini_bet_type = _mini_bet_type(sequelize, DataTypes);
  var mini_configs = _mini_configs(sequelize, DataTypes);
  var mini_games = _mini_games(sequelize, DataTypes);

  return {
    balance_logs,
    level_configs,
    sports_bet_detail,
    sports_bet_history,
    sports_bonus_odds,
    sports_combine,
    sports_configs,
    sports_market,
    sports_matches,
    sports_odds,
    sports_rate_configs,
    up_users,
    kosca_logs,
    mini_bet_history,
    mini_bet_type,
    mini_configs,
    mini_games,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
