const db = require("../../models");
const Op = db.Sequelize.Op;
const helpers = require("../../helpers");
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;

const moment = require("moment");

exports.getSportsListForUser = async (req, res) => {
  const { sports, gameType } = req.query;
  let condition = {
    is_delete: 0,
  };
  let marketCondition = {};

  if (sports && sports !== "") {
    condition.sports_name = sports;
  }

  if (
    gameType === "cross" ||
    gameType === "winlose" ||
    gameType === "handicap"
  ) {
    condition.status_kr = "경기전";
    condition.start_datetime = {
      [Op.between]: [
        moment().format("YYYY-MM-DD HH:mm:ss"),
        `${moment().add(24, "hours").format("YYYY-MM-DD HH:mm:ss")}`,
      ],
    };

    if (gameType === "cross") marketCondition.is_cross = 1;
    if (gameType === "winlose") marketCondition.is_winlose = 1;
    if (gameType === "handicap") marketCondition.is_handicap = 1;
  } else if (gameType === "special") {
    condition.status_kr = ["경기전", "경기중"];
    condition.start_datetime = {
      [Op.between]: [
        moment().subtract(12, "hours").format("YYYY-MM-DD HH:mm:ss"),
        moment().format("YYYY-MM-DD HH:mm:ss"),
      ],
    };
    marketCondition.is_special = 1;
  }

  try {
    const findSportsMatches = await SportsMatches.findAll({
      include: {
        include: {
          attributes: ["type", "period", "name"],
          model: SportsMarket,
          where: marketCondition,
        },
        attributes: [
          "is_market_stop",
          "is_odds_stop",
          "odds_line",
          "home_odds",
          "draw_odds",
          "away_odds",
          "odds_key",
          "is_home_stop",
          "is_draw_stop",
          "is_away_stop",
        ],
        model: SportsOdds,
        where: {
          is_market_stop: 0,
          is_odds_stop: 0,
        },
      },
      attributes: [
        "match_id",
        "sports_name",
        "sports_name_kr",
        "status_kr",
        "period_kr",
        "league_id",
        "league_name",
        "league_image",
        "home_name",
        "home_image",
        "away_name",
        "away_image",
        "country",
        "country_kr",
        "country_image",
        "start_datetime",
      ],
      where: condition,
      order: [
        ["start_datetime", "asc"],
        ["league_id", "ASC"],
        [SportsOdds, SportsMarket, "order", "ASC"],
      ],
    });

    return res.status(200).send(findSportsMatches);
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
