const db = require("../../models");
const MiniGames = db.mini_games;
const MiniBetHistory = db.mini_bet_history;
const MiniBetType = db.mini_bet_type;
const MiniConfigs = db.mini_configs;
const Users = db.up_users;
const BalanceLogs = db.balance_logs;
const KoscaLogs = db.kosca_logs;
const LevelConfigs = db.level_configs;

const axios = require("axios");
const moment = require("moment");

exports.coinPowerballResult = async () => {
  try {
    console.log("코인 파워볼 결과처리 시작");

    const minutes = [3, 5];
    const endPoint = "https://updownscore.com/api/last?g_type=coinpowerball";

    const axiosInstance = axios.create({
      timeout: 10000,
    });

    for await (const minute of minutes) {
      const result = await axiosInstance.get(`${endPoint}${minute}`);

      if (result) {
        const data = {
          date: result.data.g_date,
          round: result.data.date_round,
          bsum: result.data.n_sum,
          pb: result.data.p_ball,
        };

        const findGame = await MiniGames.findOne({
          where: {
            game: "coin_powerball",
            minute,
            date: data.date,
            date_round: data.round,
            is_result: 0,
          },
        });

        if (findGame) {
          await MiniGames.update(
            {
              is_result: 1,
              result_data: JSON.stringify(data),
              resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              where: {
                id: findGame.id,
              },
            }
          );

          await this.powerballCalc("coin_powerball", minute, data);
        }
      }
    }
    console.log("코인 파워볼 결과처리 완료");
  } catch (err) {
    console.error("코인 파워볼 결과처리 실패", err);
  } finally {
    setTimeout(() => {
      this.coinPowerballResult();
    }, 15000);
  }
};

exports.coinLadderResult = async () => {
  try {
    console.log("코인 사다리 결과처리 시작");

    const minutes = [3, 5];
    const endPoint = "https://updownscore.com/api/last?g_type=coinladder";

    const axiosInstance = axios.create({
      timeout: 10000,
    });

    for await (const minute of minutes) {
      const result = await axiosInstance.get(`${endPoint}${minute}`);

      if (result) {
        const data = {
          date: result.data.g_date,
          round: result.data.date_round,
          lr: result.data.lr,
          line: result.data.line,
          oe: result.data.oe,
        };

        const findGame = await MiniGames.findOne({
          where: {
            game: "coin_ladder",
            minute,
            date: data.date,
            date_round: data.round,
            is_result: 0,
          },
        });

        if (findGame) {
          await MiniGames.update(
            {
              is_result: 1,
              result_data: JSON.stringify(data),
              resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              where: {
                id: findGame.id,
              },
            }
          );

          await this.ladderCalc("coin_ladder", minute, data);
        }
      }
    }
    console.log("코인 사다리 결과처리 완료");
  } catch (err) {
    console.error("코인 사다리 결과처리 실패", err);
  } finally {
    setTimeout(() => {
      this.coinLadderResult();
    }, 15000);
  }
};

exports.eosPowerballResult = async () => {
  try {
    console.log("EOS 파워볼 결과처리 시작");

    const minutes = [1, 2, 3, 4, 5];
    const endPoint = "https://updownscore.com/api/last?g_type=eospowerball";

    const axiosInstance = axios.create({
      timeout: 10000,
    });

    for await (const minute of minutes) {
      const result = await axiosInstance.get(`${endPoint}${minute}`);

      if (result) {
        const data = {
          date: result.data.g_date,
          round: result.data.date_round,
          bsum: result.data.n_sum,
          pb: result.data.p_ball,
        };

        const findGame = await MiniGames.findOne({
          where: {
            game: "eos_powerball",
            minute,
            date: data.date,
            date_round: data.round,
            is_result: 0,
          },
        });

        if (findGame) {
          await MiniGames.update(
            {
              is_result: 1,
              result_data: JSON.stringify(data),
              resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              where: {
                id: findGame.id,
              },
            }
          );

          await this.powerballCalc("eos_powerball", minute, data);
        }
      }
    }
    console.log("EOS 파워볼 결과처리 완료");
  } catch (err) {
    console.error("EOS 파워볼 결과처리 실패", err);
  } finally {
    setTimeout(() => {
      this.eosPowerballResult();
    }, 15000);
  }
};

exports.powerballCalc = async (game, minute, data) => {
  try {
    const findHistory = await MiniBetHistory.findAll({
      include: [
        {
          model: Users,
        },
        {
          model: MiniBetType,
        },
      ],
      where: {
        status: 0,
        game,
        minute,
        date: data.date,
        date_round: data.round,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    const pb = data.pb;
    let nSize;
    let pOddEven;
    let pUnderOver;
    let nOddEven;
    let nUnderOver;

    if (data.bsum <= 64) {
      nSize = "소";
    } else if (data.bsum >= 65 && data.bsum <= 80) {
      nSize = "중";
    } else if (data.bsum >= 81) {
      nSize = "대";
    }

    if (data.pb % 2 === 1) {
      pOddEven = "홀";
    } else if (data.pb % 2 === 0) {
      pOddEven = "짝";
    }

    if (data.pb < 5) {
      pUnderOver = "언더";
    } else {
      pUnderOver = "오버";
    }

    if (data.bsum % 2 === 1) {
      nOddEven = "홀";
    } else if (data.bsum % 2 === 0) {
      nOddEven = "짝";
    }

    if (data.bsum < 73) {
      nUnderOver = "언더";
    } else {
      nUnderOver = "오버";
    }

    const conditionMap = {
      파홀: () => pOddEven === "홀",
      파짝: () => pOddEven === "짝",
      파오버: () => pUnderOver === "오버",
      파언더: () => pUnderOver === "언더",
      일홀: () => nOddEven === "홀",
      일짝: () => nOddEven === "짝",
      일오버: () => nUnderOver === "오버",
      일언더: () => nUnderOver === "언더",
      파홀오버: () => pOddEven === "홀" && pUnderOver === "오버",
      파홀언더: () => pOddEven === "홀" && pUnderOver === "언더",
      파짝오버: () => pOddEven === "짝" && pUnderOver === "오버",
      파짝언더: () => pOddEven === "짝" && pUnderOver === "언더",
      일홀오버: () => nOddEven === "홀" && nUnderOver === "오버",
      일홀언더: () => nOddEven === "홀" && nUnderOver === "언더",
      일짝오버: () => nOddEven === "짝" && nUnderOver === "오버",
      일짝언더: () => nOddEven === "짝" && nUnderOver === "언더",
      일홀대: () => nOddEven === "홀" && nSize === "대",
      일홀중: () => nOddEven === "홀" && nSize === "중",
      일홀소: () => nOddEven === "홀" && nSize === "소",
      일짝대: () => nOddEven === "짝" && nSize === "대",
      일짝중: () => nOddEven === "짝" && nSize === "중",
      일짝소: () => nOddEven === "짝" && nSize === "소",
      대: () => nSize === "대",
      중: () => nSize === "중",
      소: () => nSize === "소",
      파홀일홀: () => pOddEven === "홀" && nOddEven === "홀",
      파홀일짝: () => pOddEven === "홀" && nOddEven === "짝",
      파짝일홀: () => pOddEven === "짝" && nOddEven === "홀",
      파짝일짝: () => pOddEven === "짝" && nOddEven === "짝",
      일홀오버파홀: () =>
        nOddEven === "홀" && nUnderOver === "오버" && pOddEven === "홀",
      일홀오버파짝: () =>
        nOddEven === "홀" && nUnderOver === "오버" && pOddEven === "짝",
      일홀언더파홀: () =>
        nOddEven === "홀" && nUnderOver === "언더" && pOddEven === "홀",
      일홀언더파짝: () =>
        nOddEven === "홀" && nUnderOver === "언더" && pOddEven === "짝",
      일짝오버파홀: () =>
        nOddEven === "짝" && nUnderOver === "오버" && pOddEven === "홀",
      일짝오버파짝: () =>
        nOddEven === "짝" && nUnderOver === "오버" && pOddEven === "짝",
      일짝언더파홀: () =>
        nOddEven === "짝" && nUnderOver === "언더" && pOddEven === "홀",
      일짝언더파짝: () =>
        nOddEven === "짝" && nUnderOver === "언더" && pOddEven === "짝",
      파0: () => pb == 0,
      파1: () => pb == 1,
      파2: () => pb == 2,
      파3: () => pb == 3,
      파4: () => pb == 4,
      파5: () => pb == 5,
      파6: () => pb == 6,
      파7: () => pb == 7,
      파8: () => pb == 8,
      파9: () => pb == 9,
    };

    for await (const history of findHistory) {
      const type = history.mini_bet_type.type;
      const checkFn = conditionMap[type];
      let rollingPercentage = 0;

      const findLevelConfig = await LevelConfigs.findOne({
        where: {
          level: history.up_user.user_level,
        },
      });

      const rollingType = history.up_user.rolling_point_type;
      if (rollingType === "LEVEL") {
        rollingPercentage =
          findLevelConfig[`rolling_mini_game_percentage`] || 0;
      } else if (rollingType === "AGENT") {
        const findAgent = await Users.findOne({
          where: {
            username: history.up_user.agent_username,
          },
        });

        if (findAgent) {
          rollingPercentage = findAgent[`rolling_mini_game_percentage`] || 0;
        }
      } else if (rollingType === "INDIVIDUAL") {
        rollingPercentage =
          history.up_user[`rolling_mini_game_percentage`] || 0;
      }

      const isWin = checkFn ? checkFn() : false;
      let winAmount = isWin ? Math.floor(history.bet_amount * history.odds) : 0;
      const maxWinAmount =
        history.up_user[`mini_max_win_amount`] ??
        findMiniConfigs[`max_win_amount`];

      if (winAmount > maxWinAmount) {
        winAmount = maxWinAmount;
      }

      const rollingAmount = history.bet_amount * rollingPercentage;

      let betData = history.toJSON();
      delete betData.up_user;

      const createKoscaLogData = {
        user_id: history.username,
        username: history.username,
        game_id: "mini",
        amount: history.bet_amount,
        bet_data: JSON.stringify(betData),
        transaction_id: history.key,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        status: isWin ? 2 : -1,
        bet_result: winAmount,
        net_loss: history.bet_amount - winAmount,
        rolling_point: rollingAmount,
        rolling_point_percentage: rollingPercentage,
        game_category: "minigame",
        bet_date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        save_log_date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        is_live: 0,
        odds_total: history.odds,
        expected_amount: Math.floor(history.bet_amount * history.odds),
      };

      const updateHistoryData = {
        status: isWin ? 1 : 2,
        win_amount: winAmount,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      await db.sequelize.transaction(async (t) => {
        await MiniBetHistory.update(updateHistoryData, {
          where: {
            id: history.id,
          },
          transaction: t,
        });

        if (isWin) {
          await Users.increment(
            {
              balance: winAmount,
            },
            {
              where: {
                username: history.username,
              },
              transaction: t,
            }
          );

          const createBalanceLogData = {
            username: history.username,
            amount: winAmount,
            system_note: `MINI ${history.key}`,
            admin_id: "시스템",
            created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            record_type: "베팅당첨",
            prev_balance: history.up_user.balance,
            after_balance: history.up_user.balance + winAmount,
          };

          await BalanceLogs.create(createBalanceLogData, {
            transaction: t,
          });

          await KoscaLogs.create(createKoscaLogData, {
            transaction: t,
          });
        }
      });
    }

    return;
  } catch (err) {
    console.error("파워볼 베팅내역 결과처리 실패", err);
  }
};

exports.ladderCalc = async (game, minute, data) => {
  try {
    const findHistory = await MiniBetHistory.findAll({
      include: [
        {
          model: Users,
        },
        {
          model: MiniBetType,
        },
      ],
      where: {
        status: 0,
        game,
        minute,
        date: data.date,
        date_round: data.round,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    const lr = data.lr;
    const line = data.line;
    const oe = data.oe;

    const conditionMap = {
      홀: () => oe === "홀",
      짝: () => oe === "짝",
      좌: () => lr === "좌",
      우: () => lr === "우",
      "3줄": () => line == 3,
      "4줄": () => line == 4,
      좌3짝: () => lr === "좌" && line == 3 && oe === "짝",
      우3홀: () => lr === "우" && line == 3 && oe === "홀",
      좌4홀: () => lr === "좌" && line == 4 && oe === "홀",
      우4짝: () => lr === "우" && line == 4 && oe === "짝",
    };

    for await (const history of findHistory) {
      const type = history.mini_bet_type.type;
      const checkFn = conditionMap[type];

      const isWin = checkFn ? checkFn() : false;
      let winAmount = isWin ? Math.floor(history.bet_amount * history.odds) : 0;
      const maxWinAmount =
        history.up_user[`mini_max_win_amount`] ??
        findMiniConfigs[`max_win_amount`];

      if (winAmount > maxWinAmount) {
        winAmount = maxWinAmount;
      }

      const updateHistoryData = {
        status: isWin ? 1 : 2,
        win_amount: winAmount,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      await db.sequelize.transaction(async (t) => {
        await MiniBetHistory.update(updateHistoryData, {
          where: {
            id: history.id,
          },
          transaction: t,
        });

        if (isWin) {
          await Users.increment(
            {
              balance: winAmount,
            },
            {
              where: {
                username: history.username,
              },
              transaction: t,
            }
          );

          const createBalanceLogData = {
            username: history.username,
            amount: winAmount,
            system_note: `MINI ${history.key}`,
            admin_id: "시스템",
            created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            record_type: "베팅당첨",
            prev_balance: history.up_user.balance,
            after_balance: history.up_user.balance + winAmount,
          };

          await BalanceLogs.create(createBalanceLogData, {
            transaction: t,
          });
        }
      });
    }

    return;
  } catch (err) {
    console.error("사다리 베팅내역 결과처리 실패", err);
  }
};
