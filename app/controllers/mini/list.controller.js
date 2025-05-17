const db = require("../../models");
const Op = db.Sequelize.Op;
const literal = db.Sequelize.literal;
const MiniGames = db.mini_games;
const MiniConfigs = db.mini_configs;
const MiniBetType = db.mini_bet_type;
const MiniBetHistory = db.mini_bet_history;
const Users = db.up_users;

const helpers = require("../../helpers");
const moment = require("moment");

exports.getNextRoundForUser = async (req, res) => {
  const { game, minute } = req.query;

  try {
    const findLastGame = await MiniGames.findOne({
      where: {
        game,
        minute,
        is_result: 1,
      },
      order: [["start_datetime", "desc"]],
    });

    let nextDate;
    let nextDateRound;

    const conditionChecks = [
      { date_round: 288, minute: 5 },
      { date_round: 360, minute: 4 },
      { date_round: 480, minute: 3 },
      { date_round: 720, minute: 2 },
      { date_round: 1440, minute: 1 },
    ];

    const matchingCondition = conditionChecks.find(
      (condition) =>
        condition.date_round === findLastGame.date_round &&
        condition.minute === findLastGame.minute
    );

    if (matchingCondition) {
      nextDate = moment(findLastGame.date).add(1, "days").format("YYYY-MM-DD");
      nextDateRound = 1;
    } else {
      nextDate = findLastGame.date;
      nextDateRound = findLastGame.date_round + 1;
    }

    const findNextGame = await MiniGames.findOne({
      where: {
        game,
        minute,
        is_result: 0,
        date: nextDate,
        date_round: nextDateRound,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    const closeTime = findMiniConfigs[`${game}_${minute}_close_time`];

    const findBetType = await MiniBetType.findAll({
      attributes: ["name", "odds", "type"],
      where: {
        game,
        status: 1,
      },
      order: [["order", "asc"]],
    });

    const returnData = {
      date: findNextGame.date,
      round: findNextGame.date_round,
      resultTime: moment
        .utc(findNextGame.start_datetime)
        .add(minute, "minutes")
        .format("YYYY-MM-DD HH:mm:ss"),
      closeTime: moment
        .utc(findNextGame.start_datetime)
        .add(minute, "minutes")
        .subtract(closeTime, "seconds")
        .format("YYYY-MM-DD HH:mm:ss"),
      betType: findBetType,
    };

    return res.status(200).send(returnData);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniBetHistoryForUser = async (req, res) => {
  const { page, size, game, status } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {
    is_delete: 0,
    username: req.username,
  };

  try {
    if (game) {
      condition.game = game;
    }

    if (status) {
      condition.status = status;
    }

    const findHistory = await MiniBetHistory.findAndCountAll({
      include: {
        attributes: ["name"],
        model: MiniBetType,
      },
      attributes: [
        "key",
        "game",
        "minute",
        "date_round",
        "date",
        "start_datetime",
        "status",
        "bet_amount",
        "win_amount",
        "odds",
        "created_at",
      ],
      where: condition,
      offset,
      limit,
      order: [["created_at", "desc"]],
    });

    const data = helpers.getPagingData(findHistory, page, limit);

    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniConfigForUser = async (req, res) => {
  try {
    const config = {
      min_bet_amount: 0,
      max_bet_amount: 0,
      max_win_amount: 0,
    };

    const findUser = await Users.findOne({
      where: {
        username: req.username,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    config.min_bet_amount =
      findUser["mini_min_bet_amount"] ?? findMiniConfigs["min_bet_amount"];

    config.max_bet_amount =
      findUser["mini_max_bet_amount"] ?? findMiniConfigs["max_bet_amount"];

    config.max_win_amount =
      findUser["mini_max_win_amount"] ?? findMiniConfigs["max_win_amount"];

    return res.status(200).send(config);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniConfigForAdmin = async (req, res) => {
  try {
    const findMiniConfigs = await MiniConfigs.findOne();

    return res.status(200).send(findMiniConfigs);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniBetTypeListForAdmin = async (req, res) => {
  const { page, size, game, name, status } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};

  try {
    if (game) {
      condition.game = game;
    }

    if (name) {
      condition.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (status) {
      condition.status = status;
    }

    const findBetTypeList = await MiniBetType.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [
        ["game", "asc"],
        ["order", "asc"],
      ],
    });

    const data = helpers.getPagingData(findBetTypeList, page, limit);

    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniBetTypeViewForAdmin = async (req, res) => {
  const { id } = req.query;

  try {
    const findMiniBetType = await MiniBetType.findOne({
      where: {
        id,
      },
    });

    if (!findMiniBetType) {
      return res.status(400).send({
        message: "존재하지 않는 베팅 타입입니다",
      });
    }

    return res.status(200).send(findMiniBetType);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniBetHistoryForAdmin = async (req, res) => {
  const {
    page,
    size,
    from,
    to,
    game,
    minute,
    betTypeId,
    username,
    round,
    key,
    status,
    sort,
    order,
  } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {};
  let orderInit = ["start_datetime", "desc"];

  try {
    if (from && to) {
      condition.created_at = {
        [Op.between]: [from, to],
      };
    }

    if (game) {
      condition.game = game;
    }

    if (minute) {
      condition.minute = minute;
    }

    if (betTypeId) {
      condition.mini_bet_type_id = betTypeId;
    }

    if (username) {
      condition.username = {
        [Op.like]: `%${username}%`,
      };
    }

    if (round) {
      condition.date_round = round;
    }

    if (key) {
      condition.key = key;
    }

    if (status) {
      condition.status = status;
    }

    if (sort && order) {
      orderInit = [sort, order];
    }

    const findMiniBetHistory = await MiniBetHistory.findAndCountAll({
      include: [
        {
          model: Users,
        },
        {
          model: MiniBetType,
        },
      ],
      where: condition,
      limit,
      offset,
      order: [orderInit],
    });

    const totalSummary = await MiniBetHistory.findAll({
      attributes: [
        [literal(`SUM(bet_amount)`), "total_bet_amount"],
        [literal(`SUM(win_amount)`), "total_win_amount"],
      ],
      where: condition,
      raw: true,
    });

    const [summary] = totalSummary;

    const data = helpers.getPagingData(findMiniBetHistory, page, limit);
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
