const db = require("../../models");
const Op = db.Sequelize.Op;
const SportsConfigs = db.sports_configs;
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const SportsMarket = db.sports_market;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsBetHistory = db.sports_bet_history;
const SportsBetDetail = db.sports_bet_detail;
const SportsRateConfigs = db.sports_rate_configs;
const Users = db.up_users;
const BalanceLogs = db.balance_logs;
const KoscaLogs = db.kosca_logs;
const {
  betHistoryResultProcess,
  updateOddsResult,
} = require("../../schedule/sportsResult");
const { getResultByScore } = require("../../helpers/sportsResult");
const socketIO = require("socket.io-client");
const ioSocket = socketIO("http://localhost:10020");

const { getSportsResult } = require("../../helpers/sportsResult");
const helpers = require("../../helpers");
const moment = require("moment");
const utils = require("../../utils");

exports.updateSportsConfigForAdmin = async (req, res) => {
  const {
    singleMinBetAmount,
    multiMinBetAmount,
    singleMaxBetAmount,
    multiMaxBetAmount,
    singleMaxWinAmount,
    multiMaxWinAmount,
    singleMaxWinOdds,
    multiMaxWinOdds,
    cancelAfterBetTime,
    cancelBeforeStartTime,
    cancelDailyCount,
    cancelMessage,
    singleMinusOdds,
    twoMinusOdds,
    alertBetAmount,
    losePointPercentage,
  } = req.body;

  if (
    singleMinBetAmount === "" ||
    multiMinBetAmount === "" ||
    singleMaxBetAmount === "" ||
    multiMaxBetAmount === "" ||
    singleMaxWinAmount === "" ||
    multiMaxWinAmount === "" ||
    singleMaxWinOdds === "" ||
    multiMaxWinOdds === "" ||
    cancelAfterBetTime === "" ||
    cancelBeforeStartTime === "" ||
    cancelDailyCount === "" ||
    cancelMessage === "" ||
    singleMinusOdds === "" ||
    twoMinusOdds === "" ||
    losePointPercentage === ""
  ) {
    return res.status(400).send({
      message: "입력칸을 모두 입력해주세요",
    });
  }

  try {
    await SportsConfigs.update(
      {
        single_min_bet_amount: singleMinBetAmount,
        multi_min_bet_amount: multiMinBetAmount,
        single_max_bet_amount: singleMaxBetAmount,
        multi_max_bet_amount: multiMaxBetAmount,
        single_max_win_amount: singleMaxWinAmount,
        multi_max_win_amount: multiMaxWinAmount,
        single_max_win_odds: singleMaxWinOdds,
        multi_max_win_odds: multiMaxWinOdds,
        cancel_after_bet_time: cancelAfterBetTime,
        cancel_before_start_time: cancelBeforeStartTime,
        cancel_daily_count: cancelDailyCount,
        cancel_message: cancelMessage,
        single_minus_odds: singleMinusOdds,
        two_minus_odds: twoMinusOdds,
        alert_bet_amount: alertBetAmount,
        lose_point_percentage: losePointPercentage,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: 1,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 게임 설정이 수정되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBonusForAdmin = async (req, res) => {
  const {
    id,
    folderCount,
    odds,
    minOdds,
    errorMessage,
    status,
    homeName,
    awayName,
  } = req.body;
  try {
    if (!folderCount || folderCount === "") {
      return res.status(400).send({
        message: "폴더 수를 입력해주세요",
      });
    }

    if (odds === "") {
      return res.status(400).send({
        message: "배당을 입력해주세요",
      });
    }

    if (minOdds === "") {
      return res.status(400).send({
        message: "최소 배당을 입력해주세요",
      });
    }

    if (errorMessage === "") {
      return res.status(400).send({
        message: "에러 메세지를 입력해주세요",
      });
    }

    if (homeName === "") {
      return res.status(400).send({
        message: "홈팀명을 입력해주세요",
      });
    }

    if (awayName === "") {
      return res.status(400).send({
        message: "원정팀명을 입력해주세요",
      });
    }

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

    if (findBonus.folder_count !== folderCount) {
      const findSamefolder = await SportsBonusOdds.findOne({
        where: {
          folder_count: folderCount,
        },
      });

      if (findSamefolder) {
        return res.status(400).send({
          message: "이미 존재하는 폴더 수의 보너스입니다",
        });
      }
    }

    await SportsBonusOdds.update(
      {
        folder_count: folderCount,
        odds,
        min_odds: minOdds,
        error_message: errorMessage,
        status,
        home_name: homeName,
        away_name: awayName,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "보너스가 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateCombineForAdmin = async (req, res) => {
  const {
    id,
    gameType,
    sportsName,
    leagueType,
    matchType,
    marketType1,
    periodType1,
    betType1,
    marketType2,
    periodType2,
    betType2,
    errorMessage,
    status,
  } = req.body;

  try {
    if (
      !gameType ||
      !sportsName ||
      !leagueType ||
      !matchType ||
      !marketType1 ||
      !periodType1 ||
      !betType1 ||
      !marketType2 ||
      !periodType2 ||
      !betType2 ||
      !errorMessage
    ) {
      return res.status(400).send({
        message: "필수 입력 항목을 모두 입력해주세요",
      });
    }

    const findCombine = await SportsCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(400).send({
        message: "존재하지 않는 조합 설정입니다",
      });
    }

    await SportsCombine.update(
      {
        game_type: gameType,
        sports_name: sportsName,
        sports_name_kr: helpers.translateSportsName(sportsName),
        league_type: leagueType,
        match_type: matchType,
        market_type_1: marketType1,
        period_type_1: periodType1,
        bet_type_1: betType1,
        market_type_2: marketType2,
        period_type_2: periodType2,
        bet_type_2: betType2,
        error_message: errorMessage,
        status,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 조합 설정이 수정되었습니다",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMarketForAdmin = async (req, res) => {
  const { id, isCross, isWinlose, isHandicap, isSpecial, isInplay, order } =
    req.body;

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

    await SportsMarket.update(
      {
        is_cross: isCross,
        is_winlose: isWinlose,
        is_handicap: isHandicap,
        is_special: isSpecial,
        is_inplay: isInplay,
        order,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 마켓이 수정되었습니다",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMatchForAdmin = async (req, res) => {
  const {
    id,
    isAuto,
    startTime,
    status,
    period,
    countryKr,
    leagueName,
    homeName,
    awayName,
    isDelete,
  } = req.body;

  try {
    if (
      !startTime ||
      status === "" ||
      period === "" ||
      !countryKr ||
      !leagueName ||
      !homeName ||
      !awayName
    ) {
      return res.status(400).send({
        message: "입력칸을 모두 입력해주세요",
      });
    }

    const findMatch = await SportsMatches.findOne({
      where: {
        id,
      },
    });

    if (!findMatch) {
      return res.status(400).send({
        message: "존재하지 않는 경기입니다",
      });
    }

    // 결과처리 전 취소
    // if (
    //   (findMatch.status_id === 0 || findMatch.status_id === 1) &&
    //   ![0, 1, 2].includes(Number(status))
    // ) {
    //   const findSportsBetDetail = await SportsBetDetail.findAll({
    //     where: {
    //       match_id: findMatch.match_id,
    //     },
    //   });

    //   await SportsBetDetail.update(
    //     {
    //       result_type: 3,
    //       status: 3,
    //       resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     },
    //     {
    //       where: {
    //         match_id: findMatch.match_id,
    //       },
    //     }
    //   );

    //   for (const detail of findSportsBetDetail) {
    //     await betHistoryResultProcess(detail.sports_bet_history_id);
    //   }
    // }

    await SportsMatches.update(
      {
        is_auto: isAuto,
        start_datetime: startTime,
        status_id: status,
        status_kr: getStatusKr(status),
        period_id: period,
        period_kr: getPeriodKr(period),
        country_kr: countryKr,
        league_name: leagueName,
        home_name: homeName,
        away_name: awayName,
        is_delete: isDelete,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    ioSocket.emit("sportsMatchesData");

    return res.status(200).send({
      message: "경기가 수정되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

const getStatusKr = (status) => {
  let statusKr;

  switch (status) {
    case 0:
      statusKr = "경기전";
      break;
    case 1:
      statusKr = "경기중";
      break;
    case 2:
      statusKr = "경기종료";
      break;
    case 3:
      statusKr = "경기연기";
      break;
    case 4:
      statusKr = "경기취소";
      break;
    case 5:
      statusKr = "경기기권";
      break;
    case 6:
      statusKr = "경기포기";
      break;
    case 7:
      statusKr = "경기중단";
      break;
    case 8:
      statusKr = "경기중단";
      break;
    case 9:
      statusKr = "경기포기";
      break;
    case 10:
      statusKr = "경기지연";
      break;
    case 11:
      statusKr = "경기지연";
      break;
    case 80:
      statusKr = "경기대기";
      break;
    case 99:
      statusKr = "경기삭제";
      break;
  }

  return statusKr;
};

const getPeriodKr = (period) => {
  let periodKr;

  switch (period) {
    case 0:
      periodKr = "";
      break;
    case 101:
      periodKr = "전반전";
      break;
    case 102:
      periodKr = "하프타임";
      break;
    case 103:
      periodKr = "후반전";
      break;
    case 104:
      periodKr = "연장전";
      break;
    case 105:
      periodKr = "브레이크타임";
      break;
    case 106:
      periodKr = "패널티킥";
      break;
    case 201:
      periodKr = "1이닝";
      break;
    case 202:
      periodKr = "2이닝";
      break;
    case 203:
      periodKr = "3이닝";
      break;
    case 204:
      periodKr = "4이닝";
      break;
    case 205:
      periodKr = "5이닝";
      break;
    case 206:
      periodKr = "6이닝";
      break;
    case 207:
      periodKr = "7이닝";
      break;
    case 208:
      periodKr = "8이닝";
      break;
    case 209:
      periodKr = "9이닝";
      break;
    case 301:
      periodKr = "1쿼터";
      break;
    case 302:
      periodKr = "2쿼터";
      break;
    case 303:
      periodKr = "3쿼터";
      break;
    case 304:
      periodKr = "4쿼터";
      break;
    case 305:
      periodKr = "하프타임";
      break;
    case 308:
      periodKr = "연장전";
      break;
    case 401:
      periodKr = "1피리어드";
      break;
    case 402:
      periodKr = "2피리어드";
      break;
    case 403:
      periodKr = "3피리어드";
      break;
    case 404:
      periodKr = "브레이크타임";
      break;
    case 405:
      periodKr = "연장전";
      break;
    case 406:
      periodKr = "패널티킥";
      break;
    case 501:
      periodKr = "1세트";
      break;
    case 502:
      periodKr = "2세트";
      break;
    case 503:
      periodKr = "3세트";
      break;
    case 504:
      periodKr = "4세트";
      break;
    case 505:
      periodKr = "5세트";
      break;
    case 601:
      periodKr = "1세트";
      break;
    case 602:
      periodKr = "2세트";
      break;
    case 603:
      periodKr = "3세트";
      break;
    case 604:
      periodKr = "4세트";
      break;
    case 605:
      periodKr = "5세트";
      break;
    case 606:
      periodKr = "6세트";
      break;
    case 607:
      periodKr = "7세트";
      break;
    case 901:
      periodKr = "1쿼터";
      break;
    case 902:
      periodKr = "2쿼터";
      break;
    case 903:
      periodKr = "3쿼터";
      break;
    case 904:
      periodKr = "4쿼터";
      break;
    case 905:
      periodKr = "하프타임";
      break;
    case 1001:
      periodKr = "1세트";
      break;
    case 1002:
      periodKr = "2세트";
      break;
    case 1003:
      periodKr = "3세트";
      break;
    case 1004:
      periodKr = "4세트";
      break;
    case 1005:
      periodKr = "5세트";
      break;
  }

  return periodKr;
};

exports.updateOddsForAdmin = async (req, res) => {
  const {
    id,
    homeOdds,
    drawOdds,
    awayOdds,
    isMarketStop,
    isOddsStop,
    isHomeStop,
    isDrawStop,
    isAwayStop,
    isAuto,
    isDelete,
  } = req.body;

  try {
    if (homeOdds === "") {
      return res.status(400).send({
        message: "홈 배당을 입력해주세요",
      });
    }

    if (awayOdds === "") {
      return res.status(400).send({
        message: "원정 배당을 입력해주세요",
      });
    }

    const findOdds = await SportsOdds.findOne({
      where: {
        id,
      },
    });

    if (!findOdds) {
      return res.status(400).send({
        message: "존재하지 않는 배당입니다",
      });
    }

    if (findOdds.draw_odds && drawOdds === "") {
      return res.status(400).send({
        message: "무 배당을 입력해주세요",
      });
    }

    await SportsOdds.update(
      {
        home_odds: homeOdds,
        draw_odds: drawOdds,
        away_odds: awayOdds,
        is_market_stop: isMarketStop,
        is_odds_stop: isOddsStop,
        is_home_stop: isHomeStop,
        is_draw_stop: isDrawStop,
        is_away_stop: isAwayStop,
        is_auto: isAuto,
        is_delete: isDelete,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    ioSocket.emit("sportsOddsData");

    return res.status(200).send({
      message: "배당이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBetHistoryForAdmin = async (req, res) => {
  const { id, status, winAmount } = req.body;
  let updateWinAmount = winAmount;

  try {
    const findHistory = await SportsBetHistory.findOne({
      include: {
        model: Users,
      },
      where: {
        id,
      },
    });

    if (!findHistory) {
      return res.status(400).send({
        message: "존재하지 않는 베팅내역입니다",
      });
    }

    await db.sequelize.transaction(async (t) => {
      // 미처리 배팅내역 취소처리
      if (findHistory.status === 0 && [3, 4, 5].includes(Number(status))) {
        updateWinAmount = findHistory.bet_amount;

        // +보유머니 - 총배팅
        await Users.increment(
          {
            balance: updateWinAmount,
            bet_total: -updateWinAmount,
          },
          {
            where: {
              username: findHistory.username,
            },
            transaction: t,
          }
        );

        // 배팅 머니로그
        const createBalanceLogData = {
          username: findHistory.username,
          amount: updateWinAmount,
          system_note: `KSPORTS ${findHistory.key}`,
          admin_id: "시스템",
          created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          record_type: "베팅취소",
          prev_balance: findHistory.up_user.balance,
          after_balance: findHistory.up_user.balance + updateWinAmount,
        };

        await BalanceLogs.create(createBalanceLogData, {
          transaction: t,
        });

        // 롤링로그 체크
        const findKoscaLogs = await KoscaLogs.findOne({
          where: {
            username: findHistory.username,
            transaction_id: findHistory.key,
            game_id: "ksports",
            status: 1,
          },
          transaction: t,
        });

        if (findKoscaLogs) {
          await KoscaLogs.update(
            {
              status: 3,
              bet_result: findHistory.bet_amount,
              net_loss: 0,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            },
            {
              where: {
                id: findKoscaLogs.id,
              },
              transaction: t,
            }
          );
        }
      }

      // 당첨처리
      if (findHistory.status === 0 && status == 1) {
        if (winAmount > 0) {
          // +보유머니
          await Users.increment(
            {
              balance: updateWinAmount,
            },
            {
              where: {
                username: findHistory.username,
              },
              transaction: t,
            }
          );

          // 배팅 머니로그
          const createBalanceLogData = {
            username: findHistory.username,
            amount: updateWinAmount,
            system_note: `KSPORTS ${findHistory.key}`,
            admin_id: "시스템",
            created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            record_type: "베팅당첨",
            prev_balance: findHistory.up_user.balance,
            after_balance: findHistory.up_user.balance + updateWinAmount,
          };

          await BalanceLogs.create(createBalanceLogData, {
            transaction: t,
          });
        }

        // 롤링로그 체크
        const findKoscaLogs = await KoscaLogs.findOne({
          where: {
            username: findHistory.username,
            transaction_id: findHistory.key,
            game_id: "ksports",
            status: 1,
          },
          transaction: t,
        });

        if (findKoscaLogs) {
          await KoscaLogs.update(
            {
              status: 2,
              bet_result: updateWinAmount,
              net_loss: findHistory.bet_amount - updateWinAmount,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            },
            {
              where: {
                id: findKoscaLogs.id,
              },
              transaction: t,
            }
          );
        }
      }

      await SportsBetHistory.update(
        {
          status,
          win_amount: updateWinAmount,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: {
            id,
          },
          transaction: t,
        }
      );
    });

    return res.status(200).send({
      message: "베팅내역이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBetDetailForAdmin = async (req, res) => {
  const { id, status } = req.body;

  try {
    const findDetail = await SportsBetDetail.findOne({
      where: {
        id,
      },
    });

    if (!findDetail) {
      return res.status(400).send({
        message: "존재하지 않는 베팅 상세 내역입니다",
      });
    }

    await SportsBetDetail.update(
      {
        status,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "베팅 상세 내역이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMatchScoreForAdmin = async (req, res) => {
  const { id, score } = req.body;

  try {
    const findMatch = await SportsMatches.findOne({
      where: {
        id,
      },
    });

    if (!findMatch) {
      return res.status(400).send({
        message: "존재하지 않는 경기입니다",
      });
    }

    const findSportsBetDetail = await SportsBetDetail.findAll({
      include: [
        {
          include: {
            model: Users,
          },
          model: SportsBetHistory,
        },
        {
          model: SportsMarket,
        },
      ],
      where: {
        match_id: findMatch.match_id,
      },
    });

    for await (const detail of findSportsBetDetail) {
      const getResult = getSportsResult(detail.sports_name, detail, score);
      const result = getResult.result;

      if (detail.result_type !== result) {
        let status;
        if (detail.bet_type === result) {
          // 적중
          status = 1;
        } else if (!detail.draw_odds && result === 2) {
          // 적특
          status = 3;
        } else {
          // 낙첨
          status = 2;
        }

        let detailUpdateData = {
          result_type: result,
          status: status,
          score: getResult.score,
          resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        let historyUpdateData = {};

        const historyStatus = detail.sports_bet_history.status;
        if ([0, 1, 2, 3].includes(historyStatus)) {
          // 적중, 적특 => 낙첨
          if ((historyStatus === 1 || historyStatus === 3) && status === 2) {
            historyUpdateData = {
              status: 2,
              win_amount: 0,
              resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
          }

          // 적중 체크
          if (status === 1 || status === 3) {
            const findOtherDetail = await SportsBetDetail.findAll({
              where: {
                sports_bet_history_id: detail.sports_bet_history_id,
                id: {
                  [Op.ne]: detail.id,
                },
              },
            });

            // 취소 (적특)
            const isAllCanceled = findOtherDetail.every((x) => x.status === 3);
            if (status === 3 && isAllCanceled) {
              historyUpdateData = {
                status: 3,
                win_amount: detail.sports_bet_history.bet_amount,
                resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
            } else if (
              !findOtherDetail.some((x) => x.status === 0 || x.status === 2)
            ) {
              const findSportsConfig = await SportsConfigs.findOne();

              // 적중
              let totalOdds = 1;

              if (status === 1) {
                totalOdds *= detail.odds;
              }

              findOtherDetail.forEach((x) => {
                if (x.status === 1) {
                  totalOdds *= x.odds;
                }
              });

              let betType;
              if (findOtherDetail.length === 1) betType = "single";
              if (findOtherDetail.length > 1) betType = "multi";

              // 단폴 배당 차감
              if (betType === "single" && findSportsConfig.single_minus_odds) {
                totalOdds -= findSportsConfig.single_minus_odds;
              } else if (
                findOtherDetail.length === 1 &&
                findSportsConfig.two_minus_odds
              ) {
                // 두폴 배당 차감
                totalOdds -= findSportsConfig.two_minus_odds;
              }

              if (totalOdds < 1) {
                totalOdds = 1;
              }

              totalOdds = parseFloat(totalOdds.toFixed(2));

              let winAmount = Math.floor(
                detail.sports_bet_history.bet_amount * totalOdds
              );
              let maxWinAmount;

              maxWinAmount =
                detail.sports_bet_history.up_user[
                  `sports_${betType}_max_win_amount`
                ] ?? findSportsConfig[`${betType}_max_win_amount`];

              if (winAmount > maxWinAmount) {
                winAmount = maxWinAmount;
              }

              historyUpdateData = {
                status: 1,
                win_amount: winAmount,
                resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
            }
          }
        }

        await SportsBetDetail.update(detailUpdateData, {
          where: {
            id: detail.id,
          },
        });

        await SportsBetHistory.update(historyUpdateData, {
          where: {
            id: detail.sports_bet_history_id,
          },
        });
      }
    }

    await SportsMatches.update(
      {
        score,
        is_result: 1,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "경기 스코어가 수정되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMatchDeleteForAdmin = async (req, res) => {
  const { id, isDelete } = req.body;
  const ip = utils.getIp(req);

  try {
    const findMatch = await SportsMatches.findOne({
      where: {
        id,
      },
    });

    if (!findMatch) {
      return res.status(400).send({
        message: "존재하지 않는 경기입니다",
      });
    }

    let updateData = {
      is_delete: isDelete,
    };

    if (isDelete == 1) {
      updateData.deleted_at = moment().format("YYYY-MM-DD HH:mm:ss");
      updateData.deleted_ip = ip;
    }

    await SportsMatches.update(updateData, {
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "경기가 삭제되었습니다",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMarketStatusForAdmin = async (req, res) => {
  const { id, type, status } = req.body;

  try {
    const allowedTypes = [
      "is_cross",
      "is_winlose",
      "is_handicap",
      "is_special",
      "is_inplay",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).send({
        message: "허용되지 않은 필드입니다",
      });
    }

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

    const updateData = {};
    updateData[type] = status;

    await SportsMarket.update(updateData, {
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "마켓 상태가 변경되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateSportsRateConfigForAdmin = async (req, res) => {
  const {
    id,
    normalWinloseRate,
    normalWinloseSum,
    normalWinloseStatus,
    normalHandicapRate,
    normalHandicapSum,
    normalHandicapStatus,
    normalUnderoverRate,
    normalUnderoverSum,
    normalUnderoverStatus,
    specialWinloseRate,
    specialWinloseSum,
    specialWinloseStatus,
    specialHandicapRate,
    specialHandicapSum,
    specialHandicapStatus,
    specialUnderoverRate,
    specialUnderoverSum,
    specialUnderoverStatus,
    inplayWinloseRate,
    inplayWinloseSum,
    inplayWinloseStatus,
    inplayHandicapRate,
    inplayHandicapSum,
    inplayHandicapStatus,
    inplayUnderoverRate,
    inplayUnderoverSum,
    inplayUnderoverStatus,
  } = req.body;

  try {
    const findConfig = await SportsRateConfigs.findOne({
      where: {
        id,
      },
    });

    if (!findConfig) {
      return res.status(400).send({
        message: "존재하지 않는 설정입니다",
      });
    }

    await SportsRateConfigs.update(
      {
        normal_winlose_rate: normalWinloseRate,
        normal_winlose_sum: normalWinloseSum,
        normal_winlose_status: normalWinloseStatus,
        normal_handicap_rate: normalHandicapRate,
        normal_handicap_sum: normalHandicapSum,
        normal_handicap_status: normalHandicapStatus,
        normal_underover_rate: normalUnderoverRate,
        normal_underover_sum: normalUnderoverSum,
        normal_underover_status: normalUnderoverStatus,
        special_winlose_rate: specialWinloseRate,
        special_winlose_sum: specialWinloseSum,
        special_winlose_status: specialWinloseStatus,
        special_handicap_rate: specialHandicapRate,
        special_handicap_sum: specialHandicapSum,
        special_handicap_status: specialHandicapStatus,
        special_underover_rate: specialUnderoverRate,
        special_underover_sum: specialUnderoverSum,
        special_underover_status: specialUnderoverStatus,
        inplay_winlose_rate: inplayWinloseRate,
        inplay_winlose_sum: inplayWinloseSum,
        inplay_winlose_status: inplayWinloseStatus,
        inplay_handicap_rate: inplayHandicapRate,
        inplay_handicap_sum: inplayHandicapSum,
        inplay_handicap_status: inplayHandicapStatus,
        inplay_underover_rate: inplayUnderoverRate,
        inplay_underover_sum: inplayUnderoverSum,
        inplay_underover_status: inplayUnderoverStatus,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: { id },
      }
    );

    return res.status(200).send({
      message: "환수율 설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBetHistoryResultPerMarket = async (req, res) => {
  const { oddsKey, status } = req.body;

  try {
    const findOdds = await SportsOdds.findOne({
      where: {
        odds_key: oddsKey,
      },
    });

    if (!findOdds) {
      return res.status(400).send({
        message: "존재하지 않는 배당입니다",
      });
    }

    if (![1, 2, 3].includes(Number(status))) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    const findSportsBetDetail = await SportsBetDetail.findAll({
      where: {
        odds_key: oddsKey,
        status: 0,
      },
    });

    if (findSportsBetDetail.length === 0) {
      return res.status(400).send({
        message: "처리할 배팅내역이 없습니다",
      });
    }

    for await (const detail of findSportsBetDetail) {
      await SportsBetDetail.update(
        {
          status,
          resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: {
            id: detail.id,
          },
        }
      );

      await betHistoryResultProcess(detail.sports_bet_history_id);
    }

    return res.status(200).send({
      message: "마켓별 결과처리가 완료되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBetHistoryResultPerMarketScore = async (req, res) => {
  const { oddsKey, homeScore, awayScore } = req.body;

  try {
    const findOdds = await SportsOdds.findOne({
      include: {
        model: SportsMarket,
      },
      where: {
        odds_key: oddsKey,
      },
    });

    if (!findOdds) {
      return res.status(400).send({
        message: "존재하지 않는 배당입니다",
      });
    }

    if (homeScore === "" || awayScore === "") {
      return res.status(400).send({
        message: "스코어를 입력해주세요",
      });
    }

    const findSportsBetDetail = await SportsBetDetail.findAll({
      where: {
        odds_key: oddsKey,
        status: 0,
      },
    });

    if (findSportsBetDetail.length === 0) {
      return res.status(400).send({
        message: "처리할 배팅내역이 없습니다",
      });
    }

    const result = getResultByScore(
      findOdds.sports_market.type,
      parseInt(homeScore),
      parseInt(awayScore),
      parseFloat(findOdds.odds_line)
    );

    await updateOddsResult(findOdds, {
      result,
      score: `${homeScore}:${awayScore}`,
    });

    return res.status(200).send({
      message: "마켓별 결과처리가 완료되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
