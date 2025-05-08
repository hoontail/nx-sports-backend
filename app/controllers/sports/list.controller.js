const db = require("../../models");
const Op = db.Sequelize.Op;
const literal = db.Sequelize.literal;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const SportsConfigs = db.sports_configs;
const SportsBetHistory = db.sports_bet_history;
const SportsBetDetail = db.sports_bet_detail;
const Users = db.up_users;

const helpers = require("../../helpers");
const moment = require("moment");

exports.getSportsMatchListForUser = async (req, res) => {
  const { sports, gameType } = req.query;
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

  const getSportsCount = (matches, isInplay) => {
    return sportsNames.reduce((acc, name) => {
      acc[name] = matches.filter(
        (x) =>
          x.sports_name === name &&
          (isInplay
            ? x.sports_odds.length > 0
            : x.getDataValue("sports_odds").length > 0)
      ).length;
      return acc;
    }, {});
  };

  let condition = {
    is_delete: 0,
  };
  let marketCondition = {};

  if (gameType === "크로스" || gameType === "승무패" || gameType === "핸디캡") {
    condition.status_kr = "경기전";
    condition.start_datetime = {
      [Op.between]: [
        moment().format("YYYY-MM-DD HH:mm:ss"),
        `${moment().add(24, "hours").format("YYYY-MM-DD HH:mm:ss")}`,
      ],
    };

    if (gameType === "크로스") marketCondition.is_cross = 1;
    if (gameType === "승무패") marketCondition.is_winlose = 1;
    if (gameType === "핸디캡") marketCondition.is_handicap = 1;
  } else if (gameType === "스페셜") {
    condition.sports_name = [
      "soccer",
      "baseball",
      "icehockey",
      "basketball",
      "volleyball",
      "esports",
    ];
    condition.status_kr = ["경기전", "경기중"];
    condition.start_datetime = {
      [Op.between]: [
        moment().subtract(12, "hours").format("YYYY-MM-DD HH:mm:ss"),
        moment().format("YYYY-MM-DD HH:mm:ss"),
      ],
    };
    marketCondition.is_special = 1;
  } else if (gameType === "라이브") {
    condition.sports_name = [
      "soccer",
      "baseball",
      "icehockey",
      "basketball",
      "volleyball",
    ];
    condition.is_inplay_ing = 1;
    condition.inplay_id = {
      [Op.ne]: 0,
    };
    condition.is_inplay_stop = 0;
    condition.is_inplay_delete = 0;
    marketCondition.is_inplay = 1;
  }
  try {
    let findSportsMatches = await SportsMatches.findAll({
      include: [
        {
          include: [
            {
              attributes: [
                "type",
                "period",
                "name",
                "is_cross",
                "is_winlose",
                "is_handicap",
                "is_inplay",
              ],
              model: SportsMarket,
              where: marketCondition,
            },
          ],
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
          required: gameType === "스페셜" ? false : true,
        },
      ],
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
        [literal("CAST([sports_odds].[odds_line] AS FLOAT)"), "ASC"],
      ],
    });

    const unablePeriodMap = {
      soccer: (x) =>
        x.status_kr === "경기중" ||
        moment.utc(x.start_datetime).format("YYYY-MM-DD HH:mm:ss") <=
          moment().format("YYYY-MM-DD HH:mm:ss")
          ? ["전반전", "연장제외", "연장포함"]
          : [],
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
      esports: (x) => {
        const arr = [];
        if (
          x.status_kr !== "경기전" ||
          moment.utc(match.start_datetime).format("YYYY-MM-DD HH:mm:ss") <
            moment().format("YYYY-MM-DD HH:mm:ss")
        ) {
          arr.push(
            "1세트",
            "2세트",
            "3세트",
            "4세트",
            "5세트",
            "연장제외",
            "연장포함"
          );
        }
        return arr;
      },
    };

    if (gameType === "스페셜") {
      findSportsMatches.forEach((match) => {
        const { sports_name } = match;

        const unablePeriodsFunc = unablePeriodMap[sports_name];

        if (unablePeriodsFunc) {
          const unablePeriods = unablePeriodsFunc(match);

          match.setDataValue(
            "sports_odds",
            match.sports_odds.filter(
              (odds) => !unablePeriods.includes(odds.sports_market.period)
            )
          );
        }
      });

      // soccer, esports + 경기중은 제외
      findSportsMatches = findSportsMatches.filter(
        (x) =>
          (x.sports_name !== "soccer" && x.sports_name !== "esports") ||
          x.status_kr !== "경기중"
      );
    }

    // 종목별 경기수
    const sportsCount = getSportsCount(findSportsMatches, false);

    // 종목 필터
    if (sports && sports !== "") {
      if (sports === "etc") {
        findSportsMatches = findSportsMatches.filter((x) =>
          ["americanfootball", "boxingufc", "tennis", "tabletennis"].includes(
            x.sports_name
          )
        );
      } else {
        findSportsMatches = findSportsMatches.filter(
          (x) => x.sports_name === sports
        );
      }
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

exports.getBonusListForUser = async (req, res) => {
  try {
    const findList = await SportsBonusOdds.findAll({
      attributes: ["folder_count", "odds", "min_odds", "error_message"],
      where: {
        status: 1,
      },
      order: [["folder_count", "asc"]],
    });

    return res.status(200).send(findList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getCombineListForUser = async (req, res) => {
  try {
    const findList = await SportsCombine.findAll({
      attributes: [
        "game_type",
        "sports_name",
        "sports_name_kr",
        "league_type",
        "match_type",
        "market_type_1",
        "bet_type_1",
        "period_type_1",
        "market_type_2",
        "bet_type_2",
        "period_type_2",
        "error_message",
      ],
      where: {
        status: 1,
      },
    });

    return res.status(200).send(findList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMySportsConfigForUser = async (req, res) => {
  try {
    const config = {
      single_min_bet_amount: 0,
      single_max_bet_amount: 0,
      single_max_win_amount: 0,
      multi_min_bet_amount: 0,
      multi_max_bet_amount: 0,
      multi_max_win_amount: 0,
      single_minus_odds: 0,
      two_minus_odds: 0,
    };

    const findUser = await Users.findOne({
      where: {
        username: req.username,
      },
    });

    const findSportsConfig = await SportsConfigs.findOne();

    config.single_min_bet_amount =
      findUser["sports_single_min_bet_amount"] ??
      findSportsConfig["single_min_bet_amount"];

    config.single_max_bet_amount =
      findUser["sports_single_max_bet_amount"] ??
      findSportsConfig["single_max_bet_amount"];

    config.single_max_win_amount =
      findUser["sports_single_max_win_amount"] ??
      findSportsConfig["single_max_win_amount"];

    config.multi_min_bet_amount =
      findUser["sports_multi_min_bet_amount"] ??
      findSportsConfig["multi_min_bet_amount"];

    config.multi_max_bet_amount =
      findUser["sports_multi_max_bet_amount"] ??
      findSportsConfig["multi_max_bet_amount"];

    config.multi_max_win_amount =
      findUser["sports_multi_max_win_amount"] ??
      findSportsConfig["multi_max_win_amount"];

    config.single_minus_odds = findSportsConfig.single_minus_odds;
    config.two_minus_odds = findSportsConfig.two_minus_odds;

    return res.status(200).send(config);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getSportsConfigForAdmin = async (req, res) => {
  try {
    const findSportsConfig = await SportsConfigs.findOne();

    return res.status(200).send(findSportsConfig);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getBonusListForAdmin = async (req, res) => {
  try {
    const findBonusOddsList = await SportsBonusOdds.findAll();

    return res.status(200).send(findBonusOddsList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getBonusViewForAdmin = async (req, res) => {
  const { id } = req.query;
  try {
    const findBonus = await SportsBonusOdds.findOne({
      where: {
        id,
      },
    });

    if (!findBonus) {
      return res.status(400).send({
        message: "존재하지 않는 보너스입니다",
      });
    }

    return res.status(200).send(findBonus);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getCombineListForAdmin = async (req, res) => {
  const { page, size, gameType, sportsName, status, market, period, betType } =
    req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  const andConditions = [];

  if (market) {
    andConditions.push({
      [Op.or]: [{ market_type_1: market }, { market_type_2: market }],
    });
  }

  if (period) {
    andConditions.push({
      [Op.or]: [{ period_type_1: period }, { period_type_2: period }],
    });
  }

  if (betType) {
    andConditions.push({
      [Op.or]: [{ bet_type_1: betType }, { bet_type_2: betType }],
    });
  }

  if (gameType) {
    condition.game_type = gameType;
  }

  if (sportsName) {
    condition.sports_name = sportsName;
  }

  if (status) {
    condition.status = status;
  }

  if (andConditions.length > 0) {
    condition[Op.and] = andConditions;
  }

  try {
    const findCombineList = await SportsCombine.findAndCountAll({
      where: condition,
      offset,
      limit,
      order: [["created_at", "desc"]],
    });

    const data = helpers.getPagingData(findCombineList, page, limit);
    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getCombineViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findCombine = await SportsCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(400).send({
        message: "존재하지 않는 스포츠 조합 설정입니다",
      });
    }

    return res.status(200).send(findCombine);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMarketListForAdmin = async (req, res) => {
  const {
    page,
    size,
    sportsName,
    type,
    period,
    isCross,
    isWinlose,
    isHandicap,
    isSpecial,
    isInplay,
  } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};

  if (sportsName) {
    condition.sports_name = sportsName;
  }

  if (type) {
    condition.type = type;
  }

  if (period) {
    condition.period = period;
  }

  if (isCross) {
    condition.is_cross = isCross;
  }

  if (isWinlose) {
    condition.is_winlose = isWinlose;
  }

  if (isHandicap) {
    condition.is_handicap = isHandicap;
  }

  if (isSpecial) {
    condition.is_special = isSpecial;
  }

  if (isInplay) {
    condition.is_inplay = isInplay;
  }
  try {
    const findMarketList = await SportsMarket.findAndCountAll({
      where: condition,
      offset,
      limit,
      order: [["order", "asc"]],
    });

    const data = helpers.getPagingData(findMarketList, page, limit);
    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMarketViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findMarket = await SportsMarket.findOne({
      where: {
        id,
      },
    });

    if (!findMarket) {
      return res.status(400).send({
        message: "존재하지 않는 마켓입니다",
      });
    }

    return res.status(200).send(findMarket);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getSportsMatchListForAdmin = async (req, res) => {
  const {
    page,
    size,
    from,
    to,
    statusId,
    sportsName,
    teamName,
    leagueName,
    country,
    isDelete,
    sort,
    order,
  } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  let orderInit = ["start_datetime", "desc"];

  if (from && to) {
    condition.start_datetime = {
      [Op.between]: [from, to],
    };
  }

  if (sportsName) {
    condition.sports_name = sportsName;
  }

  if (statusId) {
    condition.status_id = JSON.parse(statusId);
  }

  if (teamName) {
    condition[Op.or] = [
      {
        home_name: {
          [Op.like]: `%${teamName}%`,
        },
      },
      {
        away_name: {
          [Op.like]: `%${teamName}%`,
        },
      },
    ];
  }

  if (leagueName) {
    condition.league_name = {
      [Op.like]: `%${leagueName}%`,
    };
  }

  if (country) {
    condition.country_kr = {
      [Op.like]: `%${country}%`,
    };
  }

  if (isDelete) {
    condition.is_delete = isDelete;
  }

  const betAmountQuery = literal(`(
    SELECT ISNULL(SUM(distinct_bets.bet_amount), 0)
    FROM (
      SELECT DISTINCT bh.id, bh.bet_amount
      FROM sports_bet_detail bd
      JOIN sports_bet_history bh ON bd.sports_bet_history_id = bh.id
      WHERE bd.match_id = sports_matches.match_id AND bh.status != 3
    ) AS distinct_bets
  )`);

  const winAmountQuery = literal(`(
    SELECT ISNULL(SUM(distinct_bets.win_amount), 0)
    FROM (
      SELECT DISTINCT bh.id, bh.win_amount
      FROM sports_bet_detail bd
      JOIN sports_bet_history bh ON bd.sports_bet_history_id = bh.id
      WHERE bd.match_id = sports_matches.match_id AND bh.status != 3
    ) AS distinct_bets
  )`);

  if (sort && order) {
    if (sort === "bet_amount") {
      orderInit = [betAmountQuery, order];
    } else if (sort === "win_amount") {
      orderInit = [winAmountQuery, order];
    } else {
      orderInit = [sort, order];
    }
  }

  try {
    const findSportsMatches = await SportsMatches.findAndCountAll({
      attributes: {
        include: [
          [betAmountQuery, "bet_amount"],
          [winAmountQuery, "win_amount"],
        ],
      },
      where: condition,
      offset,
      limit,
      order: [orderInit],
    });

    const data = helpers.getPagingData(findSportsMatches, page, limit);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getSportsMatchViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const betAmountQuery = literal(`(
      SELECT ISNULL(SUM(distinct_bets.bet_amount), 0)
      FROM (
        SELECT DISTINCT bh.id, bh.bet_amount
        FROM sports_bet_detail bd
        JOIN sports_bet_history bh ON bd.sports_bet_history_id = bh.id
        WHERE bd.match_id = sports_matches.match_id AND bh.status != 3
      ) AS distinct_bets
    )`);

    const winAmountQuery = literal(`(
      SELECT ISNULL(SUM(distinct_bets.win_amount), 0)
      FROM (
        SELECT DISTINCT bh.id, bh.win_amount
        FROM sports_bet_detail bd
        JOIN sports_bet_history bh ON bd.sports_bet_history_id = bh.id
        WHERE bd.match_id = sports_matches.match_id AND bh.status != 3
      ) AS distinct_bets
    )`);

    const findMatch = await SportsMatches.findOne({
      attributes: {
        include: [
          [betAmountQuery, "bet_amount"],
          [winAmountQuery, "win_amount"],
        ],
      },
      include: {
        include: {
          model: SportsMarket,
        },
        model: SportsOdds,
      },
      where: {
        id,
      },
      order: [
        [SportsOdds, SportsMarket, "order", "ASC"],
        [literal("CAST([sports_odds].[odds_line] AS FLOAT)"), "ASC"],
      ],
    });

    if (!findMatch) {
      return res.status(400).send({
        message: "존재하지 않는 경기입니다",
      });
    }

    return res.status(200).send(findMatch);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getSportsBetHistoryForAdmin = async (req, res) => {
  const {
    page,
    size,
    from,
    to,
    gameType,
    status,
    username,
    key,
    sort,
    order,
    matchId,
  } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  const detailCondition = {};
  let orderInit = ["created_at", "desc"];

  if (from && to) {
    condition.created_at = {
      [Op.between]: [from, to],
    };
  }

  if (gameType) {
    condition.game_type = gameType;
  }

  if (status && status !== "") {
    condition.status = status;
  }

  if (username) {
    condition.username = username;
  }

  if (key) {
    condition.key = key;
  }

  if (sort && order) {
    orderInit = [sort, order];
  }

  if (matchId) {
    detailCondition.match_id = matchId;
  }

  try {
    const findSportsBetHistory = await SportsBetHistory.findAndCountAll({
      include: {
        include: {
          model: SportsMarket,
        },
        model: SportsBetDetail,
        where: detailCondition,
      },
      where: condition,
      offset,
      limit,
      order: [orderInit],
      distinct: true,
    });

    const data = helpers.getPagingData(findSportsBetHistory, page, limit);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
