const db = require("../../models");
const MiniGames = db.mini_games;
const MiniConfigs = db.mini_configs;
const MiniBetType = db.mini_bet_type;
const MiniBetHistory = db.mini_bet_history;
const Users = db.up_users;

const helpers = require("../../helpers");
const moment = require("moment");

exports.updateMiniConfigForAdmin = async (req, res) => {
  const {
    minBetAmount,
    maxBetAmount,
    maxWinAmount,
    coinPowerball3CloseTime,
    coinPowerball5CloseTime,
    coinLadder3CloseTime,
    coinLadder5CloseTime,
    eosPowerball1CloseTime,
    eosPowerball2CloseTime,
    eosPowerball3CloseTime,
    eosPowerball4CloseTime,
    eosPowerball5CloseTime,
    coinPowerball3Status,
    coinPowerball5Status,
    coinLadder3Status,
    coinLadder5Status,
    eosPowerball1Status,
    eosPowerball2Status,
    eosPowerball3Status,
    eosPowerball4Status,
    eosPowerball5Status,
    coinPowerball3CloseMessage,
    coinPowerball5CloseMessage,
    coinLadder3CloseMessage,
    coinLadder5CloseMessage,
    eosPowerball1CloseMessage,
    eosPowerball2CloseMessage,
    eosPowerball3CloseMessage,
    eosPowerball4CloseMessage,
    eosPowerball5CloseMessage,
    coinPowerball3MaxBetCount,
    coinPowerball5MaxBetCount,
    coinLadder3MaxBetCount,
    coinLadder5MaxBetCount,
    eosPowerball1MaxBetCount,
    eosPowerball2MaxBetCount,
    eosPowerball3MaxBetCount,
    eosPowerball4MaxBetCount,
    eosPowerball5MaxBetCount,
  } = req.body;

  try {
    const values = Object.values(req.body);
    if (values.some((v) => v === undefined || v === "")) {
      return res.status(400).send({ message: "모든 값을 입력해주세요." });
    }

    await MiniConfigs.update(
      {
        min_bet_amount: minBetAmount,
        max_bet_amount: maxBetAmount,
        max_win_amount: maxWinAmount,
        coin_powerball_3_close_time: coinPowerball3CloseTime,
        coin_powerball_5_close_time: coinPowerball5CloseTime,
        coin_ladder_3_close_time: coinLadder3CloseTime,
        coin_ladder_5_close_time: coinLadder5CloseTime,
        eos_powerball_1_close_time: eosPowerball1CloseTime,
        eos_powerball_2_close_time: eosPowerball2CloseTime,
        eos_powerball_3_close_time: eosPowerball3CloseTime,
        eos_powerball_4_close_time: eosPowerball4CloseTime,
        eos_powerball_5_close_time: eosPowerball5CloseTime,
        coin_powerball_3_status: coinPowerball3Status,
        coin_powerball_5_status: coinPowerball5Status,
        coin_ladder_3_status: coinLadder3Status,
        coin_ladder_5_status: coinLadder5Status,
        eos_powerball_1_status: eosPowerball1Status,
        eos_powerball_2_status: eosPowerball2Status,
        eos_powerball_3_status: eosPowerball3Status,
        eos_powerball_4_status: eosPowerball4Status,
        eos_powerball_5_status: eosPowerball5Status,
        coin_powerball_3_close_message: coinPowerball3CloseMessage,
        coin_powerball_5_close_message: coinPowerball5CloseMessage,
        coin_ladder_3_close_message: coinLadder3CloseMessage,
        coin_ladder_5_close_message: coinLadder5CloseMessage,
        eos_powerball_1_close_message: eosPowerball1CloseMessage,
        eos_powerball_2_close_message: eosPowerball2CloseMessage,
        eos_powerball_3_close_message: eosPowerball3CloseMessage,
        eos_powerball_4_close_message: eosPowerball4CloseMessage,
        eos_powerball_5_close_message: eosPowerball5CloseMessage,
        coin_powerball_3_max_bet_count: coinPowerball3MaxBetCount,
        coin_powerball_5_max_bet_count: coinPowerball5MaxBetCount,
        coin_ladder_3_max_bet_count: coinLadder3MaxBetCount,
        coin_ladder_5_max_bet_count: coinLadder5MaxBetCount,
        eos_powerball_1_max_bet_count: eosPowerball1MaxBetCount,
        eos_powerball_2_max_bet_count: eosPowerball2MaxBetCount,
        eos_powerball_3_max_bet_count: eosPowerball3MaxBetCount,
        eos_powerball_4_max_bet_count: eosPowerball4MaxBetCount,
        eos_powerball_5_max_bet_count: eosPowerball5MaxBetCount,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: 1,
        },
      }
    );

    return res.status(200).send({
      message: "미니게임 설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMiniBetTypeForAdmin = async (req, res) => {
  const { id, name, odds, status, order } = req.body;

  try {
    if (!name) {
      return res.status(400).send({
        message: "베팅명을 입력해주세요",
      });
    }

    if (!odds) {
      return res.status(400).send({
        message: "배당을 입력해주세요",
      });
    }

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

    await MiniBetType.update(
      {
        name,
        odds,
        status,
        order,
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "미니게임 베팅 설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
