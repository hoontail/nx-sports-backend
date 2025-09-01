const axios = require("axios");
const db = require("../../models");
const VrSportsConfigs = db.vr_sports_configs;
const VrRateConfigs = db.vr_rate_configs;

const moment = require("moment");

exports.getVrData = async () => {
  console.log("가상게임 데이터 업데이트 시작");

  try {
    const findVrSportsConfigList = await VrSportsConfigs.findAll();
    const findVrRateConfigList = await VrRateConfigs.findAll();

    const updatePromises = findVrSportsConfigList.map(async (data) => {
      const endPoint = `${process.env.VR_URL}/list?cate=${data.sports_name}`;

      const axiosInstance = axios.create({
        timeout: 10000,
      });

      const rateConfig = findVrRateConfigList.find(
        (x) => x.vr_sports_configs_id === data.id
      );

      const createData = [];

      await axiosInstance.get(endPoint).then((res) => {
        for (const data of res.data[1].gamelist) {
          const marketId = getVrMarketId(data.cate2, data.cate1, data.home);
          const marketType = data.cate1;

          if (marketId) {
            const vrSportsConfigId = findVrSportsConfigList.find(
              (sports) => sports.sports_name === data.cate2
            ).id;

            let homeOdds = data.ratio1 === "" ? 0 : data.ratio1;
            let drawOdds = data.ratio2 === "" ? 0 : data.ratio2;
            let awayOdds = data.ratio3 === "" ? 0 : data.ratio3;
            const isTwoWay =
              marketType === "handicap" ||
              marketType === "underover" ||
              (marketType === "wintielose" && !drawOdds);

            // 환수율 조정
            let rate = 0;
            let sum = 0;
            if (marketType === "wintielose") {
              if (rateConfig.winlose_status === 1) {
                rate = rateConfig.winlose_rate;
                sum = rateConfig.winlose_sum;
              }
            } else if (marketType === "handicap") {
              if (rateConfig.handicap_status === 1) {
                rate = rateConfig.handicap_rate;
                sum = rateConfig.handicap_sum;
              }
            } else if (marketType === "underover") {
              if (rateConfig.underover_status === 1) {
                rate = rateConfig.underover_rate;
                sum = rateConfig.underover_sum;
              }
            }

            if (rate > 0) {
              homeOdds = (parseFloat(homeOdds) * rate) / 100;
              awayOdds = (parseFloat(awayOdds) * rate) / 100;
              if (marketType === "wintielose" && drawOdds) {
                drawOdds = (parseFloat(drawOdds) * rate) / 100;

                if (drawOdds < 1.03) drawOdds = 1.03;
              }

              if (homeOdds < 1.03) homeOdds = 1.03;

              if (awayOdds < 1.03) awayOdds = 1.03;
            }

            if (isTwoWay && sum > 0) {
              const homeValue = parseFloat(homeOdds);
              const awayValue = parseFloat(awayOdds);
              const oddsSum = homeValue + awayValue;

              if (oddsSum > sum) {
                const diff = oddsSum - sum;

                if (homeValue > awayValue) {
                  homeOdds = homeValue - diff;
                } else {
                  awayOdds = awayValue - diff;
                }
              } else if (oddsSum < sum) {
                const diff = sum - oddsSum;

                if (homeValue < awayValue) {
                  homeOdds = homeValue + diff;
                } else {
                  awayOdds = awayValue + diff;
                }
              }
            }

            const oddsData = {
              odds_key: `${data.idx}_${data.seq}_${marketId}_${data.home}${
                data.cate1 === "underover" || data.cate1 === "handicap"
                  ? `_${data.ratio2}`
                  : ""
              }`,
              match_id: data.idx,
              vr_sports_configs_id: vrSportsConfigId,
              league_name: data.title,
              league_id: data.seq,
              vr_market_id: marketId,
              market_type: data.cate1,
              home_name: data.home,
              away_name: data.away,
              home_odds: homeOdds,
              draw_odds: drawOdds,
              away_odds: awayOdds,
              home_image: data.country1,
              away_image: data.country2,
              status: data.flag,
              start_datetime: data.date,
              result_1: data.result1,
              result_2: data.result2,
              result_3: data.result3,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };

            createData.push(oddsData);
          }
        }
      });

      if (createData.length > 0) {
        const oddsValues = createData
          .map(
            (m) => `(
              '${m.odds_key}',
              ${m.match_id},
              ${m.vr_sports_configs_id},
              '${m.league_name}',
              ${m.league_id},
              ${m.vr_market_id},
              '${m.market_type}',
              '${m.home_name}',
              '${m.away_name}',
              ${m.home_odds},
              ${m.draw_odds},
              ${m.away_odds},
              '${m.home_image}',
              '${m.away_image}',
              '${m.status}',
              '${m.start_datetime}',
              ${m.result_1},
              ${m.result_2},
              ${m.result_3},
              '${m.updated_at}'
            )`
          )
          .join(",\n");

        const createOddsQuery = `
                MERGE INTO vr_odds AS target
                USING (VALUES 
                ${oddsValues}
                ) AS source (
                odds_key, match_id, vr_sports_configs_id, league_name, league_id, vr_market_id, market_type,
                home_name, away_name, home_odds, draw_odds, away_odds, home_image, away_image, status, start_datetime,
                result_1, result_2, result_3, updated_at
                )
                ON target.odds_key = source.odds_key
                WHEN MATCHED THEN
                UPDATE SET 
                    home_odds = source.home_odds,
                    draw_odds = source.draw_odds,
                    away_odds = source.away_odds,
                    result_1 = source.result_1,
                    result_2 = source.result_2,
                    result_3 = source.result_3,
                    status = source.status,
                    home_image = source.home_image,
                    away_image = source.away_image,
                    updated_at = source.updated_at
                WHEN NOT MATCHED THEN
                INSERT (
                  odds_key, match_id, vr_sports_configs_id, league_name, league_id, vr_market_id, market_type,
                  home_name, away_name, home_odds, draw_odds, away_odds, home_image, away_image, status, start_datetime,
                  result_1, result_2, result_3, updated_at
                )
                VALUES (
                  source.odds_key, source.match_id, source.vr_sports_configs_id, source.league_name, 
                  source.league_id, source.vr_market_id, source.market_type, source.home_name, source.away_name, 
                  source.home_odds, source.draw_odds, source.away_odds, source.home_image, source.away_image, 
                  source.status, source.start_datetime, source.result_1, source.result_2, source.result_3, source.updated_at
                );
                `;

        await db.sequelize.query(createOddsQuery);

        console.log(`가상게임 ${data.sports_name} 등록완료`);
      }
    });

    await Promise.all(updatePromises);
  } catch {
    console.log("가상게임 데이터 업데이트 실패");
  } finally {
    setTimeout(() => {
      this.getVrData();
    }, 30 * 1000);
  }
};

// 마켓 구하기
const getVrMarketId = (sports, market, home) => {
  let id = null;
  if (sports === "Soccer") {
    if (
      market === "wintielose" &&
      !home.includes("득점") &&
      !home.includes("전반")
    ) {
      id = 1;
    } else if (market === "wintielose" && home === "홈팀 득점") {
      id = 4;
    } else if (market === "wintielose" && home === "원정팀 득점") {
      id = 5;
    } else if (market === "wintielose" && home === "양팀 득점") {
      id = 6;
    } else if (market === "wintielose" && home.includes("전반")) {
      id = 7;
    } else if (market === "underover") {
      id = 2;
    } else if (market === "handicap") {
      id = 3;
    }
  } else if (sports === "Basketball") {
    if (market === "wintielose") {
      id = 8;
    } else if (market === "underover") {
      id = 9;
    } else if (market === "handicap") {
      id = 10;
    }
  } else if (sports === "Baseball") {
    if (market === "wintielose") {
      id = 11;
    } else if (market === "underover") {
      id = 12;
    } else if (market === "handicap") {
      id = 13;
    }
  } else if (sports === "Football") {
    if (market === "wintielose" && home !== "Score") {
      id = 14;
    } else if (
      market === "underover" &&
      home !== "Total Plays in Drive 2-Way"
    ) {
      id = 15;
    } else if (market === "handicap") {
      id = 16;
    }
  } else if (sports === "Tennis") {
    if (market === "wintielose") {
      id = 17;
    } else if (market === "underover") {
      id = 18;
    } else if (market === "handicap") {
      id = 19;
    }
  } else if (sports === "Cricket") {
    if (market === "wintielose" && home !== "홀") {
      id = 20;
    } else if (market === "wintielose" && home === "홀") {
      id = 22;
    } else if (market === "underover") {
      id = 21;
    }
  } else if (sports === "Darts") {
    if (market === "wintielose" && home !== "Red") {
      id = 23;
    } else if (market === "underover") {
      id = 24;
    }
  } else if (sports === "Greyhounds") {
    if (market === "wintielose" && home !== "홀") {
      id = 25;
    } else if (market === "wintielose" && home === "홀") {
      id = 26;
    } else if (market === "underover") {
      id = 27;
    }
  } else if (sports === "Horse") {
    if (market === "wintielose" && home !== "홀") {
      id = 28;
    } else if (market === "wintielose" && home === "홀") {
      id = 30;
    } else if (market === "underover") {
      id = 29;
    }
  } else if (sports === "Speedway") {
    if (market === "wintielose" && home !== "홀") {
      id = 31;
    } else if (market === "wintielose" && home === "홀") {
      id = 33;
    } else if (market === "underover") {
      id = 32;
    }
  } else if (sports === "Motor") {
    if (market === "wintielose" && home !== "홀") {
      id = 34;
    } else if (market === "wintielose" && home === "홀") {
      id = 36;
    } else if (market === "underover") {
      id = 35;
    }
  } else if (sports === "Trotting") {
    if (market === "wintielose" && home !== "홀") {
      id = 37;
    } else if (market === "wintielose" && home === "홀") {
      id = 39;
    } else if (market === "underover") {
      id = 38;
    }
  } else if (sports === "Cycling") {
    if (market === "wintielose" && home !== "홀") {
      id = 40;
    } else if (market === "wintielose" && home === "홀") {
      id = 42;
    } else if (market === "underover") {
      id = 41;
    }
  } else if (sports === "Counter") {
    if (market === "wintielose") {
      id = 43;
    } else if (market === "underover") {
      id = 44;
    } else if (market === "handicap") {
      id = 45;
    }
  }

  return id;
};
