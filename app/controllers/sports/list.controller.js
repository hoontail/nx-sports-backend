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
    let findSportsMatches = await SportsMatches.findAll({
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
          is_delete: 0,
        },
      },
      attributes: [
        "match_id",
        "sports_name",
        "sports_name_kr",
        "status_kr",
        "period_id",
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

    const unablePeriodMap = {
      soccer: (x) =>
        x.status_kr === "경기중" ? ["전반전", "연장제외", "연장포함"] : [],
      baseball: (x) => {
        const arr = [];
        const p = x.period_id;
        if (p >= 201) arr.push("1이닝", "5이닝합계", "연장제외", "연장포함");
        if (p >= 202) arr.push("2이닝");
        if (p >= 203) arr.push("3이닝");
        if (p >= 204) arr.push("4이닝");
        if (p >= 205) arr.push("5이닝");
        if (p >= 206) arr.push("6이닝");
        if (p >= 207) arr.push("7이닝");
        if (p >= 208) arr.push("8이닝");
        if (p >= 209) arr.push("9이닝");
        return arr;
      },
      icehockey: (x) => {
        const arr = [];
        const p = x.period_id;
        if (p >= 401) arr.push("1피리어드", "연장제외", "연장포함");
        if (p >= 402) arr.push("2피리어드");
        if (p >= 403) arr.push("3피리어드");
        return arr;
      },
      basketball: (x) => {
        const arr = [];
        const p = x.period_id;
        if (p >= 301) arr.push("1쿼터", "연장제외", "연장포함");
        if (p >= 302) arr.push("2쿼터");
        if (p >= 303 && p !== 305) arr.push("3쿼터");
        if (p >= 304) arr.push("4쿼터");
        return arr;
      },
      volleyball: (x) => {
        const arr = [];
        const p = x.period_id;
        if (p >= 501) arr.push("1세트", "연장제외", "연장포함");
        if (p >= 502) arr.push("2세트");
        if (p >= 503) arr.push("3세트");
        if (p >= 504) arr.push("4세트");
        if (p >= 505) arr.push("5세트");
        return arr;
      },
    };

    if (gameType === "special") {
      findSportsMatches.forEach((match) => {
        const { sports_name } = match;

        if (sports_name === "esports") {
          const isInvalid =
            match.status_kr !== "경기전" ||
            match.start_datetime < moment().format("YYYY-MM-DD HH:mm:ss");

          if (isInvalid) {
            match.setDataValue("sports_odds", []);
            return;
          }
        }

        const getUnablePeriods = unablePeriodMap[sports_name];
        const unablePeriods = getUnablePeriods ? getUnablePeriods(match) : [];

        match.setDataValue(
          "sports_odds",
          match.sports_odds.filter(
            (odds) => !unablePeriods.includes(odds.sports_market.period)
          )
        );
      });

      // soccer, esports + 경기중은 제외
      findSportsMatches = findSportsMatches.filter(
        (x) =>
          (x.sports_name !== "soccer" && x.sports_name !== "esports") ||
          x.status_kr !== "경기중"
      );
    }

    const sportsNames = [
      "soccer",
      "americanfootball",
      "boxingufc",
      "tennis",
      "baseball",
      "icehockey",
      "basketball",
      "handball",
      "volleyball",
      "tabletennis",
      "esports",
    ];

    // 종목별 경기수
    const sportsCount = sportsNames.reduce((acc, name) => {
      acc[name] = findSportsMatches.filter(
        (x) =>
          x.sports_name === name &&
          (x.getDataValue("sports_odds") || []).length > 0
      ).length;
      return acc;
    }, {});

    // 종목 필터
    if (sports && sports !== "") {
      findSportsMatches = findSportsMatches.filter(
        (x) => x.sports_name === sports
      );
    }

    return res.status(200).send({
      list: findSportsMatches,
      count: sportsCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
