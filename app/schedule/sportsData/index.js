const axios = require("axios");
const db = require("../../models");
const Op = db.Sequelize.Op;
const literal = db.Sequelize.literal;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const SportsRateConfigs = db.sports_rate_configs;

const helpers = require("../../helpers");
const redisClient = require("../../helpers/redisClient");
const WebSocket = require("ws");
const moment = require("moment");
const socketIO = require("socket.io-client");
const ioSocket = socketIO("http://localhost:3001");

const updateSportsData = async (endPoint, marketArr, rateConfig) => {
  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      "Accept-Encoding": "gzip",
    },
  });

  await axiosInstance.get(endPoint).then(async (res) => {
    const createMatchData = [];
    const createOddsData = [];
    const deleteSameLineOdds = [];
    if (res.data.success === 1) {
      for (const match of res.data.result.list) {
        createMatchData.push({
          match_id: match.id,
          sports_name: match.sport,
          sports_name_kr: helpers.translateSportsName(match.sport),
          prematch_id: match.prematch_id,
          inplay_id: match.inplay_id,
          status_id: match.status_id,
          status_kr: match.status_kr,
          period_id: match.period_id,
          period_kr: match.period_kr,
          is_inplay_ing: match.is_inplay_ing,
          league_id: match.league_id,
          league_name: match.league_name,
          league_image: match.league_image,
          home_id: match.home_id,
          home_name: match.home_name,
          home_image: match.home_image,
          away_id: match.away_id,
          away_name: match.away_name,
          away_image: match.away_image,
          country: match.cc,
          country_kr: match.cc_kr,
          country_image: match.cc_image,
          start_datetime: match.time,
          score: JSON.stringify(match.score),
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        });

        for (const market of match.market) {
          if (!market.list) continue;
          const matchedMarket = marketArr.find(
            (x) => x.market_id === market.market_id
          );
          if (!matchedMarket) continue;

          for (const odds of market.list) {
            const oddsKey = `${match.id}_${market.market_id}${
              odds.name ? `_${odds.name}` : ""
            }`;

            const isUnder = odds.odds[0].name === "Under";
            const isTwoWay = odds.odds.length === 2;
            const isThreeWay = odds.odds.length === 3;

            let homeOdds = isUnder ? odds.odds[1].value : odds.odds[0].value;
            let drawOdds = isThreeWay ? odds.odds[1].value : null;
            let awayOdds = isUnder
              ? odds.odds[0].value
              : isTwoWay
              ? odds.odds[1].value
              : odds.odds[2].value;

            // 환수율 조정
            let rate = 0;
            let sum = 0;
            if (
              matchedMarket.type !== "핸디캡" &&
              matchedMarket.type !== "언더오버"
            ) {
              if (
                rateConfig.normal_winlose_status === 1 &&
                matchedMarket.is_special !== 1
              ) {
                rate = rateConfig.normal_winlose_rate;
                sum = rateConfig.normal_winlose_sum;
              } else if (
                rateConfig.special_winlose_status === 1 &&
                matchedMarket.is_special === 1
              ) {
                rate = rateConfig.special_winlose_rate;
                sum = rateConfig.special_winlose_sum;
              }
            } else if (matchedMarket.type === "핸디캡") {
              if (
                rateConfig.normal_handicap_status === 1 &&
                matchedMarket.is_special !== 1
              ) {
                rate = rateConfig.normal_handicap_rate;
                sum = rateConfig.normal_handicap_sum;
              } else if (
                rateConfig.special_handicap_status === 1 &&
                matchedMarket.is_special === 1
              ) {
                rate = rateConfig.special_handicap_rate;
                sum = rateConfig.special_handicap_sum;
              }
            } else if (matchedMarket.type === "언더오버") {
              if (
                rateConfig.normal_underover_status === 1 &&
                matchedMarket.is_special !== 1
              ) {
                rate = rateConfig.normal_underover_rate;
                sum = rateConfig.normal_underover_sum;
              } else if (
                rateConfig.special_underover_status === 1 &&
                matchedMarket.is_special === 1
              ) {
                rate = rateConfig.special_underover_rate;
                sum = rateConfig.special_underover_sum;
              }
            }

            if (rate > 0) {
              homeOdds = (parseFloat(homeOdds) * rate) / 100;
              awayOdds = (parseFloat(awayOdds) * rate) / 100;
              if (drawOdds) {
                drawOdds = (parseFloat(drawOdds) * rate) / 100;

                if (drawOdds < 1.03) drawOdds = 1.03;

                drawOdds = drawOdds.toFixed(2);
              }

              if (homeOdds < 1.03) homeOdds = 1.03;

              if (awayOdds < 1.03) awayOdds = 1.03;

              homeOdds = homeOdds.toFixed(2);
              awayOdds = awayOdds.toFixed(2);
            }

            if (isTwoWay && sum > 0) {
              const homeValue = parseFloat(homeOdds);
              const awayValue = parseFloat(awayOdds);
              const oddsSum = homeValue + awayValue;

              if (oddsSum > sum) {
                const diff = oddsSum - sum;

                if (homeValue > awayValue) {
                  homeOdds = (homeValue - diff).toFixed(2);
                } else {
                  awayOdds = (awayValue - diff).toFixed(2);
                }
              } else if (oddsSum < sum) {
                const diff = sum - oddsSum;

                if (homeValue < awayValue) {
                  homeOdds = (homeValue + diff).toFixed(2);
                } else {
                  awayOdds = (awayValue + diff).toFixed(2);
                }
              }
            }

            createOddsData.push({
              odds_key: oddsKey,
              match_id: match.id,
              market_id: market.market_id,
              is_market_stop: market.stop,
              is_odds_stop: odds.stop,
              odds_line: odds.name,
              home_odds: homeOdds,
              draw_odds: drawOdds,
              away_odds: awayOdds,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            });

            if (odds.name) {
              deleteSameLineOdds.push({
                match_id: match.id,
                market_id: market.market_id,
                odds_line: odds.name,
              });
            }
          }
        }
      }

      const safeString = (str) => str.replace(/'/g, `' + CHAR(39) + '`);

      if (createMatchData.length > 0) {
        const matchValues = createMatchData
          .map(
            (m) => `(
              ${m.match_id},
              '${m.sports_name}',
              '${m.sports_name_kr}',
              ${m.prematch_id},
              ${m.inplay_id},
              ${m.status_id},
              '${m.status_kr}',
              ${m.period_id},
              '${m.period_kr}',
              ${m.is_inplay_ing},
              ${m.league_id},
              '${safeString(m.league_name)}',
              '${m.league_image}',
              ${m.home_id},
              '${safeString(m.home_name)}',
              '${m.home_image}',
              ${m.away_id},
              '${safeString(m.away_name)}',
              '${m.away_image}',
              '${safeString(m.country)}',
              '${safeString(m.country_kr)}',
              '${m.country_image}',
              '${m.start_datetime}',
              '${m.score}',
              '${m.updated_at}'
            )`
          )
          .join(",\n");

        const createMatchQuery = `
            MERGE INTO sports_matches AS target
            USING (VALUES
              ${matchValues}
            ) AS source (
              match_id, sports_name, sports_name_kr, prematch_id, inplay_id,
              status_id, status_kr, period_id, period_kr, is_inplay_ing,
              league_id, league_name, league_image,
              home_id, home_name, home_image,
              away_id, away_name, away_image,
              country, country_kr, country_image,
              start_datetime, score, updated_at
            )
            ON target.match_id = source.match_id
            WHEN MATCHED AND target.is_auto = 1 THEN
            UPDATE SET
              sports_name = source.sports_name,
              sports_name_kr = source.sports_name_kr,
              prematch_id = source.prematch_id,
              inplay_id = source.inplay_id,
              status_id = source.status_id,
              status_kr = source.status_kr,
              period_id = source.period_id,
              period_kr = source.period_kr,
              is_inplay_ing = source.is_inplay_ing,
              league_id = source.league_id,
              league_name = source.league_name,
              league_image = source.league_image,
              home_id = source.home_id,
              home_name = source.home_name,
              home_image = source.home_image,
              away_id = source.away_id,
              away_name = source.away_name,
              away_image = source.away_image,
              country = source.country,
              country_kr = source.country_kr,
              country_image = source.country_image,
              start_datetime = source.start_datetime,
              score = source.score,
              updated_at = source.updated_at
            WHEN NOT MATCHED THEN
            INSERT (
              match_id, sports_name, sports_name_kr, prematch_id, inplay_id,
              status_id, status_kr, period_id, period_kr, is_inplay_ing,
              league_id, league_name, league_image,
              home_id, home_name, home_image,
              away_id, away_name, away_image,
              country, country_kr, country_image,
              start_datetime, score, updated_at
            )
            VALUES (
              source.match_id, source.sports_name, source.sports_name_kr, source.prematch_id, source.inplay_id,
              source.status_id, source.status_kr, source.period_id, source.period_kr, source.is_inplay_ing,
              source.league_id, source.league_name, source.league_image,
              source.home_id, source.home_name, source.home_image,
              source.away_id, source.away_name, source.away_image,
              source.country, source.country_kr, source.country_image,
              source.start_datetime, source.score, source.updated_at
            );
            `;

        await db.sequelize.query(createMatchQuery);
      }

      if (createOddsData.length > 0) {
        const oddsValues = createOddsData
          .map(
            (o) => `(
                    '${o.odds_key}',
                    ${o.match_id},
                    ${o.market_id},
                    ${o.is_market_stop},
                    ${o.is_odds_stop},
                    ${o.odds_line ? `'${o.odds_line}'` : "NULL"},
                    ${
                      o.home_odds != null && o.home_odds !== ""
                        ? o.home_odds
                        : "NULL"
                    },
                    ${
                      o.draw_odds != null && o.draw_odds !== ""
                        ? o.draw_odds
                        : "NULL"
                    },
                    ${
                      o.away_odds != null && o.away_odds !== ""
                        ? o.away_odds
                        : "NULL"
                    },
                    '${o.updated_at}'
                  )`
          )
          .join(",\n");

        const createOddsQuery = `
                MERGE INTO sports_odds AS target
                USING (VALUES 
                ${oddsValues}
                ) AS source (
                odds_key, match_id, market_id, is_market_stop, is_odds_stop,
                odds_line, home_odds, draw_odds, away_odds, updated_at
                )
                ON target.odds_key = source.odds_key
                WHEN MATCHED AND target.is_auto = 1 THEN
                UPDATE SET 
                    match_id = source.match_id,
                    market_id = source.market_id,
                    is_market_stop = source.is_market_stop,
                    is_odds_stop = source.is_odds_stop,
                    odds_line = source.odds_line,
                    home_odds = source.home_odds,
                    draw_odds = source.draw_odds,
                    away_odds = source.away_odds,
                    updated_at = source.updated_at
                WHEN NOT MATCHED THEN
                INSERT (
                    odds_key, match_id, market_id, is_market_stop, is_odds_stop,
                    odds_line, home_odds, draw_odds, away_odds, updated_at
                )
                VALUES (
                    source.odds_key, source.match_id, source.market_id,
                    source.is_market_stop, source.is_odds_stop,
                    source.odds_line, source.home_odds,
                    source.draw_odds, source.away_odds, source.updated_at
                );
                `;

        await db.sequelize.query(createOddsQuery);
      }

      // 기준점 바뀐 경우 기존 기준점 삭제
      if (deleteSameLineOdds.length > 0) {
        const whereConditions = deleteSameLineOdds.map(
          (o) =>
            `(match_id = ${o.match_id} AND market_id = ${o.market_id} AND odds_line != '${o.odds_line}')`
        );

        await SportsOdds.update(
          { is_delete: 1 },
          {
            where: literal(whereConditions.join(" OR ")),
          }
        );
      }

      // 다음 페이지
      if (res.data.result.pagination) {
        const pagination = res.data.result.pagination;
        if (pagination.page < pagination.total_pages) {
          await updateSportsData(pagination.next_link, marketArr, rateConfig);
        }
      }
    } else {
      return false;
    }
  });
};

exports.getPrematchData = async (isInit) => {
  try {
    console.log("프리매치 데이터 업데이트 시작");

    const sportsArr = [
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

    const marketArr = await SportsMarket.findAll({
      attributes: [
        "market_id",
        "type",
        "period",
        "name",
        "order",
        "is_cross",
        "is_winlose",
        "is_handicap",
        "is_inplay",
      ],
    });
    const findSportsRateConfigs = await SportsRateConfigs.findAll();

    const updatePromises = sportsArr.map((sports) => {
      const endPoint = `${process.env.SPORTS_URL}/${sports}/single${
        !isInit ? "/latest" : ""
      }?token=${process.env.SPORTS_TOKEN}${!isInit ? "&ts=180" : ""}`;

      const rateConfig = findSportsRateConfigs.find(
        (x) => x.sports_name === sports
      );

      return updateSportsData(endPoint, marketArr, rateConfig).then(() => {
        console.log(`프리매치 ${sports} 업데이트 완료`);
      });
    });

    await Promise.all(updatePromises);

    ioSocket.emit("sportsMatchesData");
    ioSocket.emit("sportsOddsData");
  } catch (err) {
    // console.log(err);
    console.log("프리매치 데이터 업데이트 실패");
  } finally {
    setTimeout(() => {
      this.getPrematchData(false);
    }, 30 * 1000);
  }
};

exports.getSpecialData = async () => {
  try {
    console.log("스페셜 데이터 업데이트 시작");

    const sportsArr = [
      "baseball",
      "icehockey",
      "basketball",
      "volleyball",
      "esports",
    ];

    const marketArr = await SportsMarket.findAll({
      attributes: [
        "market_id",
        "type",
        "period",
        "name",
        "order",
        "is_cross",
        "is_winlose",
        "is_handicap",
        "is_inplay",
      ],
    });
    const findSportsRateConfigs = await SportsRateConfigs.findAll();

    for await (const sports of sportsArr) {
      const endPoint = `${process.env.SPORTS_URL}/${sports}/special?token=${process.env.SPORTS_TOKEN}`;

      const rateConfig = findSportsRateConfigs.find(
        (x) => x.sports_name === sports
      );

      await updateSportsData(endPoint, marketArr, rateConfig);

      console.log(`스페셜 ${sports} 업데이트 완료`);
    }
  } catch (err) {
    console.log("스페셜 데이터 업데이트 실패");
  } finally {
    setTimeout(() => {
      this.getSpecialData(false);
    }, 6 * 10000);
  }
};

const connectInplaySocketWithRedis = async (sports, marketArr, rateConfig) => {
  await axios
    .get(
      `${process.env.SPORTS_INPLAY_URL}/getkey/${sports}?token=${process.env.SPORTS_TOKEN}`
    )
    .then((res) => {
      const key = res.data.result.key;
      const webSocket = new WebSocket(
        `${process.env.SPORTS_SOCKET_URL}/ws/${sports}?key=${key}`
      );

      webSocket.on("open", () => {
        console.log(`실시간 ${sports} 웹소켓 연결됨`);
      });

      const oddsTimer = {};

      webSocket.on("message", (data) => {
        const str = data.toString("utf8");
        const jsonData = JSON.parse(str);
        const matchId = jsonData.g;

        if (!matchId) return;

        const createTeam = () => {
          redisClient.set(`team:${matchId}`, JSON.stringify(jsonData.tm), {
            EX: 60 * 60 * 24 * 3,
          });
        };

        const createScore = () => {
          redisClient.set(`score:${matchId}`, JSON.stringify(jsonData.ss), {
            EX: 60 * 60 * 24 * 3,
          });
        };

        const createOdds = async () => {
          const createOddsData = [];
          const socketOddsData = [];

          for (const market of jsonData.od) {
            if (!market.l) continue;

            const matchedMarket = marketArr.find(
              (m) => m.market_id === market.m && m.is_inplay === 1
            );
            if (!matchedMarket) continue;

            for (const odds of market.l) {
              const oddsKey = `${matchId}_${market.m}${
                odds.n ? `_${odds.n}` : ""
              }`;
              const isUnder = odds.o[0]?.n === "Under";
              const isTwoWay = odds.o.length === 2;
              const isThreeWay = odds.o.length === 3;

              let homeOdds = isUnder ? odds.o[1]?.v : odds.o[0]?.v;
              let drawOdds = isThreeWay ? odds.o[1]?.v : null;
              let awayOdds = isUnder
                ? odds.o[0]?.v
                : isTwoWay
                ? odds.o[1]?.v
                : odds.o[2]?.v;

              // 환수율 조정
              let rate = 0;
              let sum = 0;
              if (
                matchedMarket.type !== "핸디캡" &&
                matchedMarket.type !== "언더오버"
              ) {
                if (rateConfig.inplay_winlose_status === 1) {
                  rate = rateConfig.inplay_winlose_rate;
                  sum = rateConfig.inplay_winlose_sum;
                }
              } else if (matchedMarket.type === "핸디캡") {
                if (rateConfig.inplay_handicap_status === 1) {
                  rate = rateConfig.inplay_handicap_rate;
                  sum = rateConfig.inplay_handicap_sum;
                }
              } else if (matchedMarket.type === "언더오버") {
                if (rateConfig.inplay_underover_status === 1) {
                  rate = rateConfig.inplay_underover_rate;
                  sum = rateConfig.inplay_underover_sum;
                }
              }

              if (rate > 0) {
                homeOdds = (parseFloat(homeOdds) * rate) / 100;
                awayOdds = (parseFloat(awayOdds) * rate) / 100;
                if (drawOdds) {
                  drawOdds = (parseFloat(drawOdds) * rate) / 100;

                  if (drawOdds < 1.03) drawOdds = 1.03;

                  drawOdds = drawOdds.toFixed(2);
                }

                if (homeOdds < 1.03) homeOdds = 1.03;

                if (awayOdds < 1.03) awayOdds = 1.03;

                homeOdds = homeOdds.toFixed(2);
                awayOdds = awayOdds.toFixed(2);
              }

              if (isTwoWay && sum > 0) {
                const homeValue = parseFloat(homeOdds);
                const awayValue = parseFloat(awayOdds);
                const oddsSum = homeValue + awayValue;

                if (oddsSum > sum) {
                  const diff = oddsSum - sum;

                  if (homeValue > awayValue) {
                    homeOdds = (homeValue - diff).toFixed(2);
                  } else {
                    awayOdds = (awayValue - diff).toFixed(2);
                  }
                } else if (oddsSum < sum) {
                  const diff = sum - oddsSum;

                  if (homeValue < awayValue) {
                    homeOdds = (homeValue + diff).toFixed(2);
                  } else {
                    awayOdds = (awayValue + diff).toFixed(2);
                  }
                }
              }

              const isHomeStop = isUnder ? odds.o[1]?.s : odds.o[0]?.s;
              const isDrawStop = isThreeWay ? odds.o[1]?.s : 0;
              const isAwayStop = isUnder
                ? odds.o[0]?.s
                : isThreeWay
                ? odds.o[2]?.s
                : odds.o[1]?.s;

              const baseData = {
                odds_key: oddsKey,
                match_id: matchId,
                market_id: market.m,
                is_market_stop: market.s,
                is_odds_stop: odds.s,
                is_delete: 0,
                odds_line: odds.n,
                home_odds: homeOdds,
                draw_odds: drawOdds,
                away_odds: awayOdds,
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                is_home_stop: isHomeStop,
                is_draw_stop: isDrawStop,
                is_away_stop: isAwayStop,
              };

              createOddsData.push(baseData);
              socketOddsData.push({
                ...baseData,
                sports_market: matchedMarket,
              });
            }
          }
          socketOddsData.sort((a, b) => {
            // 1차: sports_market.order 기준 오름차순
            const orderA = a.sports_market?.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.sports_market?.order ?? Number.MAX_SAFE_INTEGER;

            if (orderA !== orderB) {
              return orderA - orderB;
            }

            // 2차: odds_line을 숫자로 변환 후 오름차순 정렬 (null은 마지막)
            const oddsLineA =
              a.odds_line != null
                ? Number(a.odds_line)
                : Number.POSITIVE_INFINITY;
            const oddsLineB =
              b.odds_line != null
                ? Number(b.odds_line)
                : Number.POSITIVE_INFINITY;

            return oddsLineA - oddsLineB;
          });

          // 실시간 배당 소켓 전달
          ioSocket.emit("sportsInplayData", {
            type: "odds",
            match_id: matchId,
            sports_odds: socketOddsData,
          });

          // 기존 실시간 배당 삭제
          await db.sequelize.query(`
            DELETE FROM sports_odds
            WHERE match_id = ${matchId}
              AND market_id IN (
                SELECT market_id FROM sports_market WHERE is_inplay = 1
              )
          `);

          // 새로운 배당 저장
          if (createOddsData.length > 0) {
            await SportsOdds.bulkCreate(createOddsData);
          }
        };

        const createStatus = () => {
          redisClient.set(`status:${matchId}`, JSON.stringify(jsonData.st), {
            EX: 60 * 60 * 24 * 3,
          });

          // 정지
          if (jsonData.st.sd === 1) {
            SportsMatches.update(
              {
                is_inplay_stop: 1,
              },
              {
                where: {
                  match_id: matchId,
                },
              }
            );
          }

          // 삭제
          if (jsonData.st.rm === 1) {
            SportsMatches.update(
              {
                is_inplay_delete: 1,
              },
              {
                where: {
                  match_id: matchId,
                },
              }
            );
          }

          // 소켓 전달
          ioSocket.emit("sportsInplayData", {
            type: "status",
            match_id: matchId,
            is_inplay_stop: jsonData.st.sd,
            is_inplay_delete: jsonData.st.rm,
          });
        };

        // 전체정보
        if (jsonData.tp === 11) {
          if (jsonData.tm) {
            createTeam();
          }

          if (jsonData.ss) {
            createScore();
          }

          if (jsonData.st) {
            createStatus();
          }

          if (jsonData.od) {
            if (!oddsTimer[matchId] || Date.now() - oddsTimer[matchId] > 300) {
              createOdds();
              oddsTimer[matchId] = Date.now();
            }
          }
        }

        // 팀정보
        if (jsonData.tp === 12 && jsonData.tm) {
          createTeam();
        }

        // 스코어
        if (jsonData.tp === 13 && jsonData.ss) {
          createScore();
        }

        // 배당
        if (jsonData.tp === 14 && jsonData.od) {
          if (!oddsTimer[matchId] || Date.now() - oddsTimer[matchId] > 300) {
            createOdds();
            oddsTimer[matchId] = Date.now();
          }
        }

        // 경기상태
        if (jsonData.tp === 15 && jsonData.st) {
          createStatus();
        }
      });

      const statusInterval = setInterval(() => {
        console.log(`${sports} 소켓 연결 상태: ${webSocket.readyState}`);
      }, 5000);

      webSocket.on("close", () => {
        // 재연결
        clearInterval(statusInterval);
        connectInplaySocketWithRedis(sports, marketArr, rateConfig);
      });

      webSocket.on("error", (error) => {
        console.error("에러 발생:", error);
      });

      // 5분 뒤 재연결
      setTimeout(() => {
        webSocket.close();
      }, 5 * 60 * 1000);
    });
};

exports.getInplayData = async () => {
  try {
    const sportsArr = [
      "soccer",
      "baseball",
      "icehockey",
      "basketball",
      "volleyball",
    ];

    const marketArr = await SportsMarket.findAll({
      attributes: [
        "market_id",
        "type",
        "period",
        "name",
        "order",
        "is_cross",
        "is_winlose",
        "is_handicap",
        "is_inplay",
      ],
    });
    const findSportsRateConfigs = await SportsRateConfigs.findAll();

    for (const sports of sportsArr) {
      const rateConfig = findSportsRateConfigs.find(
        (x) => x.sports_name === sports
      );

      connectInplaySocketWithRedis(sports, marketArr, rateConfig);
    }
  } catch (err) {
    console.log("실시간 데이터 업데이트 실패");
  }
};

exports.deleteOldSportsOdds = async () => {
  try {
    console.log("스포츠 배당 데이터 정리 시작");

    await SportsOdds.destroy({
      where: {
        updated_at: {
          [Op.lt]: moment().subtract(1, "week").format("YYYY-MM-DD HH:mm:ss"),
        },
      },
    });

    console.log("스포츠 배당 데이터 정리 완료");
  } catch (err) {
    console.log("스포츠 배당 데이터 정리 실패");
  }
};
