const db = require("../../models");
const Op = db.Sequelize.Op;
const VrBetHistory = db.vr_bet_history;
const VrBetDetail = db.vr_bet_detail;
const VrSportsConfigs = db.vr_sports_configs;
const VrOdds = db.vr_odds;
const VrMarket = db.vr_market;
const Users = db.up_users;
const VrConfigs = db.vr_configs;
const KoscaLogs = db.kosca_logs;
const BalanceLogs = db.balance_logs;

const moment = require("moment");

exports.vrResultProcess = async () => {
  console.log("가상게임 결과처리 시작");

  try {
    const findVrBetDetail = await VrBetDetail.findAll({
      include: {
        model: VrBetHistory,
      },
      where: {
        status: 0,
        start_datetime: {
          [Op.lt]: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
      },
    });

    const raceUnOver = [26, 29, 32, 35, 38, 41];
    const raceOddEven = [27, 30, 33, 36, 39, 42];

    if (findVrBetDetail.length > 0) {
      for await (const detail of findVrBetDetail) {
        const findOdds = await VrOdds.findOne({
          include: [
            {
              model: VrMarket,
            },
            {
              model: VrSportsConfigs,
            },
          ],
          where: {
            odds_key: detail.odds_key,
          },
        });

        let isWin = false;
        let resultType;

        if (findOdds) {
          if (findOdds.status === "경기전") continue;

          const homeScore = findOdds.result_1;
          const awayScore = findOdds.result_2;
          const marketName = findOdds.vr_market.type;
          const betType = detail.bet_type;
          let score = "";

          if (marketName === "승무패" || marketName === "전반 승무패") {
            // 승무패 || 전반승무패
            if (homeScore < awayScore) {
              resultType = 0;
            } else if (homeScore > awayScore) {
              resultType = 1;
            } else if (homeScore == awayScore) {
              resultType = 2;
            }
          } else if (marketName === "핸디캡") {
            // 핸디캡
            if (
              ["Soccer", "Baseball", "Counter"].includes(
                findOdds.vr_sports_config.sports_name
              )
            ) {
              if (homeScore + findOdds.draw_odds < awayScore) {
                resultType = 0;
              } else if (homeScore + findOdds.draw_odds > awayScore) {
                resultType = 1;
              } else {
                resultType = 2;
              }
            } else {
              if (homeScore > awayScore) {
                resultType = 1;
              } else if (homeScore < awayScore) {
                resultType = 0;
              } else {
                resultType = 2;
              }
            }
          } else if (marketName === "오버언더") {
            // 오버언더
            if (raceUnOver.includes(findOdds.vr_market_id)) {
              // 경주경기 1착 언오버
              if (homeScore > findOdds.draw_odds) {
                resultType = 1;
              } else if (homeScore < findOdds.draw_odds) {
                resultType = 0;
              } else {
                resultType = 2;
              }
            } else if (
              ["Soccer", "Baseball", "Counter"].includes(
                findOdds.vr_sports_config.sports_name
              )
            ) {
              if (homeScore + awayScore > findOdds.draw_odds) {
                resultType = 1;
              } else if (homeScore + awayScore < findOdds.draw_odds) {
                resultType = 0;
              } else {
                resultType = 2;
              }
            } else {
              if (homeScore > awayScore) {
                resultType = 1;
              } else if (homeScore < awayScore) {
                resultType = 0;
              } else {
                resultType = 2;
              }
            }
          } else if (
            marketName === "양팀 득점" ||
            marketName === "홈팀 득점" ||
            marketName === "원정팀 득점" ||
            marketName === "홀짝"
          ) {
            if (raceOddEven.includes(findOdds.vr_market_id)) {
              // 경주경기 홀짝
              if (homeScore % 2 === 0) {
                resultType = 0;
              } else if (homeScore % 2 === 1) {
                resultType = 1;
              }
            } else {
              if (homeScore < awayScore) {
                resultType = 0;
              } else if (homeScore > awayScore) {
                resultType = 1;
              } else {
                resultType = 2;
              }
            }
          } else if (marketName === "1착") {
            if (findOdds.away_name == homeScore) {
              resultType = 1;
            } else {
              resultType = 0;
            }
          }

          if (betType == resultType) {
            isWin = true;
          }

          if (
            ["Soccer", "Baseball", "Counter"].includes(
              findOdds.vr_sports_config.sports_name
            )
          ) {
            if (
              ["홈팀 득점", "원정팀 득점", "양팀 득점"].includes(marketName)
            ) {
              if (homeScore > awayScore) {
                score = "득점";
              } else if (homeScore < awayScore) {
                score = "무득점";
              }
            } else {
              score = `${homeScore}:${awayScore}`;
            }
          } else if (
            [
              "Greyhounds",
              "Horse",
              "Speedway",
              "Motor",
              "Trotting",
              "Cycling",
            ].includes(findOdds.vr_sports_config.sports_name)
          ) {
            score = homeScore;
          } else {
            if (homeScore > awayScore) {
              if (marketName === "승무패" || marketName === "핸디캡") {
                score = "홈승";
              } else if (marketName === "오버언더") {
                score = "오버";
              } else if (marketName === "홀짝") {
                score = "홀";
              }
            } else if (homeScore < awayScore) {
              if (marketName === "승무패" || marketName === "핸디캡") {
                score = "원정승";
              } else if (marketName === "오버언더") {
                score = "언더";
              } else if (marketName === "홀짝") {
                score = "짝";
              }
            } else if (homeScore == awayScore) {
              if (marketName === "승무패" || marketName === "핸디캡") {
                score = "무";
              }
            }
          }

          await VrBetDetail.update(
            {
              status: isWin ? 1 : 2,
              result_type: resultType,
              result_1: findOdds.result_1,
              result_2: findOdds.result_2,
              result_3: findOdds.result_3,
              score,
              resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              where: {
                id: detail.id,
              },
            }
          );

          // 배팅내역 결과처리
          await betHistoryResultProcess(detail.vr_bet_history_id);
        }
      }
    }
  } catch (err) {
    console.log(err);
    console.log("가상게임 결과처리 실패");
  } finally {
    setTimeout(() => {
      this.vrResultProcess();
    }, 60 * 1000);
  }
};

const betHistoryResultProcess = async (historyId) => {
  const findVrBetDetail = await VrBetDetail.findAll({
    where: {
      vr_bet_history_id: historyId,
    },
  });

  const findVrBetHistory = await VrBetHistory.findOne({
    include: [
      {
        model: Users,
      },
    ],
    where: {
      id: historyId,
      status: 0,
    },
  });

  if (findVrBetDetail.length === 0 || !findVrBetHistory) return;

  const findVrConfig = await VrConfigs.findOne();

  const findKoscaLogs = await KoscaLogs.findOne({
    where: {
      transaction_id: findVrBetHistory.key,
    },
  });

  // 낙첨처리
  if (findVrBetDetail.some((x) => x.status === 2)) {
    await VrBetHistory.update(
      {
        status: 2,
        win_amount: 0,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: historyId,
          status: 0,
        },
      }
    );

    // 롤링 로그 업데이트
    if (findKoscaLogs) {
      await KoscaLogs.update(
        {
          status: 2,
          bet_result: 0,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          net_loss: findVrBetHistory.bet_amount,
        },
        {
          where: {
            transaction_id: findKoscaLogs.transaction_id,
          },
        }
      );
    }

    return console.log(
      `${findVrBetHistory.key} 가상게임 배팅내역 결과처리 완료`
    );
  }

  let totalOdds = 1;
  let betType;

  if (findVrBetDetail.length === 1) {
    betType = "single";
  } else if (findVrBetDetail.length > 1) {
    betType = "multi";
  }

  // 대기상태의 배당이 없을 때 결과처리
  if (!findVrBetDetail.some((x) => x.status === 0)) {
    for await (const x of findVrBetDetail) {
      if (x.status === 1) {
        totalOdds = totalOdds * x.odds;
      }
    }

    if (findVrBetHistory.bonus_odds) {
      totalOdds = totalOdds * findVrBetHistory.bonus_odds;
    }

    const maxWinOdds = findVrConfig[`${betType}_max_win_odds`];

    totalOdds = parseFloat(totalOdds.toFixed(2));

    if (totalOdds > maxWinOdds) {
      totalOdds = parseFloat(maxWinOdds.toFixed(2));
    }

    let winAmount = Math.floor(findVrBetHistory.bet_amount * totalOdds);
    const maxWinAmount =
      findVrBetHistory.up_user[`vr_${betType}_max_win_amount`] ??
      findVrConfig[`${betType}_max_win_amount`];

    if (winAmount > maxWinAmount) {
      winAmount = maxWinAmount;
    }

    await VrBetHistory.update(
      {
        win_amount: winAmount,
        status: 1,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: historyId,
          status: 0,
        },
      }
    );

    await Users.increment(
      {
        balance: winAmount,
      },
      {
        where: {
          username: findVrBetHistory.username,
        },
      }
    );

    const createBalanceLogData = {
      username: findVrBetHistory.username,
      amount: winAmount,
      system_note: `VR ${findVrBetHistory.key}`,
      admin_id: "시스템",
      created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      record_type: "베팅당첨",
      prev_balance: findVrBetHistory.up_user.balance,
      after_balance: findVrBetHistory.up_user.balance + winAmount,
    };

    await BalanceLogs.create(createBalanceLogData);

    // 롤링 로그 업데이트
    if (findKoscaLogs) {
      await KoscaLogs.update(
        {
          status: 2,
          bet_result: winAmount,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          net_loss: findVrBetHistory.bet_amount - winAmount,
        },
        {
          where: {
            transaction_id: findKoscaLogs.transaction_id,
          },
        }
      );
    }

    console.log(`${findVrBetHistory.key} 가상게임 배팅내역 결과처리 완료`);
  }

  return;
};
