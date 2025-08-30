const db = require("../../models");
const VrSportsConfigs = db.vr_sports_configs;
const VrConfigs = db.vr_configs;
const VrCombine = db.vr_combine;
const VrMarket = db.vr_market;
const VrBonusOdds = db.vr_bonus_odds;
const VrLeague = db.vr_league;
const VrBetHistory = db.vr_bet_history;
const VrBetDetail = db.vr_bet_detail;
const Users = db.up_users;
const BalanceLogs = db.balance_logs;
const KoscaLogs = db.kosca_logs;

const moment = require("moment");

exports.updateVrSportsConfigForAdmin = async (req, res) => {
  const { id, order, closeMessage, closeTime, status } = req.body;

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

    await VrSportsConfigs.update(
      {
        order,
        close_message: closeMessage,
        close_time: closeTime,
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
      message: "종목설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateVrConfigForAdmin = async (req, res) => {
  const {
    singleMinBetAmount,
    multiMinBetAmount,
    singleMaxBetAmount,
    multiMaxBetAmount,
    singleMaxWinAmount,
    multiMaxWinAmount,
    singleMaxWinOdds,
    multiMaxWinOdds,
  } = req.body;

  if (
    singleMinBetAmount === "" ||
    multiMinBetAmount === "" ||
    singleMaxBetAmount === "" ||
    multiMaxBetAmount === "" ||
    singleMaxWinAmount === "" ||
    multiMaxWinAmount === "" ||
    singleMaxWinOdds === "" ||
    multiMaxWinOdds === ""
  ) {
    return res.status(400).send({
      message: "입력칸을 모두 입력해주세요",
    });
  }

  try {
    await VrConfigs.update(
      {
        single_min_bet_amount: singleMinBetAmount,
        multi_min_bet_amount: multiMinBetAmount,
        single_max_bet_amount: singleMaxBetAmount,
        multi_max_bet_amount: multiMaxBetAmount,
        single_max_win_amount: singleMaxWinAmount,
        multi_max_win_amount: multiMaxWinAmount,
        single_max_win_odds: singleMaxWinOdds,
        multi_max_win_odds: multiMaxWinOdds,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: 1,
        },
      }
    );

    return res.status(200).send({
      message: "가상게임 게임 설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateVrCombineForAdmin = async (req, res) => {
  const {
    id,
    sportsName,
    matchType,
    marketType1,
    betType1,
    marketType2,
    betType2,
    errorMessage,
    status,
  } = req.body;

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

    let findVrSportsConfig;

    if (sportsName !== "전체") {
      findVrSportsConfig = await VrSportsConfigs.findOne({
        where: {
          sports_name: sportsName,
        },
      });

      if (!findVrSportsConfig) {
        return res.status(400).send({
          message: "존재하지 않는 종목입니다",
        });
      }
    }

    await VrCombine.update(
      {
        sports_name: sportsName,
        sports_name_kr: findVrSportsConfig
          ? findVrSportsConfig.sports_name_kr
          : "전체",
        match_type: matchType,
        market_type_1: marketType1,
        bet_type_1: betType1,
        marketType2: marketType2,
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
      message: "조합 설정이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateVrMarketForAdmin = async (req, res) => {
  const { id, status, order } = req.body;

  try {
    const findMarket = await VrMarket.findOne({
      where: {
        id,
      },
    });

    if (!findMarket) {
      return res.status(400).send({
        message: "존재하지 않는 마켓입니다",
      });
    }

    await VrMarket.update(
      {
        status,
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
      message: "마켓이 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
exports.updateVrBonusForAdmin = async (req, res) => {
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

    if (findBonus.folder_count !== folderCount) {
      const findSamefolder = await VrBonusOdds.findOne({
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

    await VrBonusOdds.update(
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

exports.updateVrLeagueForAdmin = async (req, res) => {
  const { id, nameKr, status, order } = req.body;

  if (nameKr === "") {
    return res.status(400).send({
      message: "리그명 한글을 입력해주세요",
    });
  }

  try {
    const findLeague = await VrLeague.findOne({
      where: {
        id,
      },
    });

    if (!findLeague) {
      return res.status(400).send({
        message: "존재하지 않는 리그입니다",
      });
    }

    await VrLeague.update(
      {
        name_kr: nameKr,
        status,
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
      message: "리그가 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateVrBetHistoryForAdmin = async (req, res) => {
  const { id, status, winAmount } = req.body;
  let updateWinAmount = winAmount;

  try {
    const findHistory = await VrBetHistory.findOne({
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
            system_note: `VR ${findHistory.key}`,
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
            game_id: "vr",
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

      await VrBetHistory.update(
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
exports.updateVrBetDetailForAdmin = async (req, res) => {
  const { id, status } = req.body;

  try {
    const findDetail = await VrBetDetail.findOne({
      where: {
        id,
      },
    });

    if (!findDetail) {
      return res.status(400).send({
        message: "존재하지 않는 베팅 상세 내역입니다",
      });
    }

    await VrBetDetail.update(
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
