const db = require("../../models");
const Op = db.Sequelize.Op;
const literal = db.Sequelize.literal;
const VrSportsConfigs = db.vr_sports_configs;
const VrConfigs = db.vr_configs;
const VrCombine = db.vr_combine;
const VrMarket = db.vr_market;
const VrBonusOdds = db.vr_bonus_odds;
const VrLeague = db.vr_league;
const VrOdds = db.vr_odds;
const Users = db.up_users;
const VrBetHistory = db.vr_bet_history;
const VrBetDetail = db.vr_bet_detail;
const VrRateConfigs = db.vr_rate_configs;

const helpers = require("../../helpers");
const moment = require("moment");

exports.getVrSportsConfigListForAdmin = async (req, res) => {
  try {
    const findList = await VrSportsConfigs.findAll({
      order: [["order", "asc"]],
    });

    return res.status(200).send(findList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrSportsConfigViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findConfig = await VrSportsConfigs.findOne({
      where: {
        id,
      },
    });

    if (!findConfig) {
      return res.status(400).send({
        message: "존재하지 않는 종목입니다",
      });
    }

    return res.status(200).send(findConfig);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrConfigForAdmin = async (req, res) => {
  try {
    const findConfig = await VrConfigs.findOne();

    return res.status(200).send(findConfig);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrCombineListForAdmin = async (req, res) => {
  const { page, size, sportsName, status, market, betType } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  const andConditions = [];

  if (market) {
    andConditions.push({
      [Op.or]: [{ market_type_1: market }, { market_type_2: market }],
    });
  }

  if (betType) {
    andConditions.push({
      [Op.or]: [{ bet_type_1: betType }, { bet_type_2: betType }],
    });
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
    const findCombineList = await VrCombine.findAndCountAll({
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

exports.getVrCombineViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findCombine = await VrCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(400).send({
        message: "존재하지 않는 조합입니다",
      });
    }

    return res.status(200).send(findCombine);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrMarketListForAdmin = async (req, res) => {
  const { page, size, sportsName, type, status } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  const sportsConfigCondition = {};

  if (sportsName) {
    sportsConfigCondition.sports_name = sportsName;
  }

  if (type) {
    condition.type = type;
  }

  if (status) {
    condition.status = status;
  }

  try {
    const findMarketList = await VrMarket.findAndCountAll({
      include: {
        model: VrSportsConfigs,
        where: sportsConfigCondition,
        required: true,
      },
      where: condition,
      offset,
      limit,
      order: [
        [VrSportsConfigs, "order", "asc"],
        ["order", "asc"],
      ],
    });

    const data = helpers.getPagingData(findMarketList, page, limit);
    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBonusListForAdmin = async (req, res) => {
  try {
    const findBonusOddsList = await VrBonusOdds.findAll();

    return res.status(200).send(findBonusOddsList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBonusViewForAdmin = async (req, res) => {
  const { id } = req.query;
  try {
    const findBonus = await VrBonusOdds.findOne({
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

exports.getVrLeagueListForAdmin = async (req, res) => {
  try {
    const findList = await VrLeague.findAll({
      include: {
        model: VrSportsConfigs,
      },
      order: [
        [VrSportsConfigs, "order", "asc"],
        ["order", "asc"],
      ],
    });

    return res.status(200).send(findList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrSportsConfigListForUser = async (req, res) => {
  try {
    const findList = await VrSportsConfigs.findAll({
      attributes: ["sports_name", "sports_name_kr", "close_time"],
      where: {
        status: 1,
      },
      order: [["order", "asc"]],
    });

    return res.status(200).send(findList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrLeagueListForUser = async (req, res) => {
  const { sportsName } = req.query;

  try {
    const findVrSportsConfig = await VrSportsConfigs.findOne({
      where: {
        sports_name: sportsName,
      },
    });

    if (!findVrSportsConfig) {
      return res.status(400).send({
        message: "존재하지 않는 종목입니다",
      });
    }

    const findVrLeagueList = await VrLeague.findAll({
      attributes: ["name", "name_kr"],
      where: {
        vr_sports_configs_id: findVrSportsConfig.id,
        status: 1,
      },
      order: [["order", "asc"]],
    });

    return res.status(200).send(findVrLeagueList);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrConfigForUser = async (req, res) => {
  try {
    const config = {
      single_min_bet_amount: 0,
      single_max_bet_amount: 0,
      single_max_win_amount: 0,
      multi_min_bet_amount: 0,
      multi_max_bet_amount: 0,
      multi_max_win_amount: 0,
    };

    const findUser = await Users.findOne({
      where: {
        username: req.username,
      },
    });

    const findVrConfig = await VrConfigs.findOne();

    config.single_min_bet_amount =
      findUser["vr_single_min_bet_amount"] ??
      findVrConfig["single_min_bet_amount"];

    config.single_max_bet_amount =
      findUser["vr_single_max_bet_amount"] ??
      findVrConfig["single_max_bet_amount"];

    config.single_max_win_amount =
      findUser["vr_single_max_win_amount"] ??
      findVrConfig["single_max_win_amount"];

    config.multi_min_bet_amount =
      findUser["vr_multi_min_bet_amount"] ??
      findVrConfig["multi_min_bet_amount"];

    config.multi_max_bet_amount =
      findUser["vr_multi_max_bet_amount"] ??
      findVrConfig["multi_max_bet_amount"];

    config.multi_max_win_amount =
      findUser["vr_multi_max_win_amount"] ??
      findVrConfig["multi_max_win_amount"];

    return res.status(200).send(config);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBonusListForUser = async (req, res) => {
  try {
    const findList = await VrBonusOdds.findAll({
      attributes: [
        "folder_count",
        "odds",
        "min_odds",
        "error_message",
        "home_name",
        "away_name",
      ],
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
exports.getVrCombineListForUser = async (req, res) => {
  try {
    const findList = await VrCombine.findAll({
      attributes: [
        "sports_name",
        "match_type",
        "market_type_1",
        "bet_type_1",
        "market_type_2",
        "bet_type_2",
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

exports.getVrOddsListForUser = async (req, res) => {
  const { sports, league } = req.query;
  let condition = {
    league_name: league,
    start_datetime: {
      [Op.gt]: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
  };

  try {
    const findVrSportsConfig = await VrSportsConfigs.findOne({
      where: {
        sports_name: sports,
        status: 1,
      },
    });

    if (!findVrSportsConfig) {
      return res.status(400).send({
        message: "존재하지 않는 종목입니다",
      });
    }

    condition.vr_sports_configs_id = findVrSportsConfig.id;

    const findMatches = await VrOdds.findAll({
      attributes: ["match_id", "start_datetime"],
      where: condition,
      limit: 3,
      order: [["start_datetime", "asc"]],
      group: ["vr_odds.match_id", "vr_odds.start_datetime"],
    });

    const matchIdArr = findMatches.map((m) => m.match_id);

    const findOdds = await VrOdds.findAll({
      include: [
        {
          attributes: ["sports_name"],
          model: VrSportsConfigs,
        },
        {
          attributes: ["type"],
          model: VrMarket,
          where: {
            status: 1,
          },
        },
      ],
      attributes: [
        "match_id",
        "odds_key",
        "market_type",
        "home_name",
        "away_name",
        "home_odds",
        "draw_odds",
        "away_odds",
        "home_image",
        "away_image",
        "start_datetime",
      ],
      where: {
        match_id: matchIdArr,
      },
      order: [
        ["start_datetime", "ASC"],
        [VrMarket, "order", "ASC"],
        [literal("TRY_CAST(away_name AS INT)"), "ASC"],
        ["away_name", "ASC"],
      ],
    });

    return res.status(200).send(findOdds);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBetHistoryForAdmin = async (req, res) => {
  const { page, size, from, to, status, username, key, sort, order } =
    req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  let orderInit = ["created_at", "desc"];

  if (from && to) {
    condition.created_at = {
      [Op.between]: [from, to],
    };
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

  try {
    const findSportsBetHistory = await VrBetHistory.findAndCountAll({
      include: [
        {
          attributes: ["id"],
          model: Users,
        },
        {
          include: [
            {
              model: VrMarket,
            },
            {
              model: VrSportsConfigs,
            },
          ],
          model: VrBetDetail,
        },
      ],
      where: condition,
      offset,
      limit,
      order: [orderInit],
      distinct: true,
    });

    const totalSummary = await VrBetHistory.findAll({
      attributes: [
        [literal(`SUM(bet_amount)`), "total_bet_amount"],
        [literal(`SUM(win_amount)`), "total_win_amount"],
      ],
      where: condition,
      raw: true,
    });

    const [summary] = totalSummary;

    const data = helpers.getPagingData(findSportsBetHistory, page, limit);
    data.total_bet_amount = summary.total_bet_amount || 0;
    data.total_win_amount = summary.total_win_amount || 0;
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBetHistoryViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findHistory = await VrBetHistory.findOne({
      include: [
        {
          attributes: ["id"],
          model: Users,
        },
        {
          include: [
            {
              model: VrMarket,
            },
            {
              model: VrSportsConfigs,
            },
          ],
          model: VrBetDetail,
        },
      ],
      where: {
        id,
      },
    });

    if (!findHistory) {
      return res.status(400).send({
        message: "존재하지 않는 베팅내역입니다",
      });
    }

    res.status(200).send(findHistory);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrBetHistoryForUser = async (req, res) => {
  const { page, status } = req.query;
  const { offset, limit } = helpers.getPagination(page, 20);
  const condition = {
    is_delete: 0,
    username: req.username,
  };

  try {
    if (status) {
      condition.status = status;
    }

    const findHistory = await VrBetHistory.findAndCountAll({
      include: {
        include: [
          {
            attributes: ["type"],
            model: VrMarket,
          },
          {
            attributes: ["sports_name_kr"],
            model: VrSportsConfigs,
          },
        ],
        attributes: [
          "home_name",
          "home_image",
          "away_name",
          "away_image",
          "league_name",
          "score",
          "start_datetime",
          "home_odds",
          "draw_odds",
          "away_odds",
          "odds",
          "bet_type",
          "result_type",
          "status",
          "market_type",
        ],
        model: VrBetDetail,
      },
      attributes: [
        "key",
        "bet_amount",
        "win_amount",
        "total_odds",
        "bonus_odds",
        "status",
        "created_at",
      ],
      where: condition,
      limit,
      offset,
      order: [["created_at", "desc"]],
      distinct: true,
    });

    const data = helpers.getPagingData(findHistory, page, limit);

    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getVrRateConfigForAdmin = async (req, res) => {
  try {
    const findSportsRateConfig = await VrRateConfigs.findAll({
      include: {
        model: VrSportsConfigs,
      },
      order: [["id", "asc"]],
    });

    return res.status(200).send(findSportsRateConfig);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
