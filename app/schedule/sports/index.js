const axios = require("axios");
const db = require("../../models");
const Op = db.Sequelize.Op;
const SportsMatches = db.sports_matches;

const WebSocket = require("ws");
const moment = require("moment");

const translateSportsName = (name) => {
  let nameKr = "";

  switch (name) {
    case "soccer":
      nameKr = "축구";
      break;
    case "americanfootball":
      nameKr = "미식축구";
      break;
    case "boxingufc":
      nameKr = "복싱/UFC";
      break;
    case "tennis":
      nameKr = "테니스";
      break;
    case "baseball":
      nameKr = "야구";
      break;
    case "icehockey":
      nameKr = "아이스하키";
      break;
    case "basketball":
      nameKr = "농구";
      break;
    case "handball":
      nameKr = "핸드볼";
      break;
    case "volleyball":
      nameKr = "배구";
      break;
    case "tabletennis":
      nameKr = "탁구";
      break;
    case "esports":
      nameKr = "E-스포츠";
      break;
  }

  return nameKr;
};

const updateSportsData = async (endPoint) => {
  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      "Accept-Encoding": "gzip",
    },
  });

  await axiosInstance.get(endPoint).then(async (res) => {
    const createMatchData = [];
    const createOddsData = [];
    if (res.data.success === 1) {
      for (const match of res.data.result.list) {
        createMatchData.push({
          match_id: match.id,
          sports_name: match.sport,
          sports_name_kr: translateSportsName(match.sport),
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
          updated_at: moment(match.updated_at).format("YYYY-MM-DD HH:mm:ss"),
        });

        for (const market of match.market) {
          if (!market.list) continue;

          for (const odds of market.list) {
            const oddsKey = `${match.id}_${market.market_id}${
              odds.name ? `_${odds.name}` : ""
            }`;

            const isUnder = odds.odds[0].name === "Under";
            const isThreeWay = odds.odds.length === 3;

            createOddsData.push({
              odds_key: oddsKey,
              match_id: match.id,
              market_id: market.market_id,
              is_market_stop: market.stop,
              is_odds_stop: odds.stop,
              odds_line: odds.name,
              home_odds: isUnder ? odds.odds[1].value : odds.odds[0].value,
              draw_odds: isThreeWay ? odds.odds[1].value : null,
              away_odds: isUnder
                ? odds.odds[0].value
                : isThreeWay
                ? odds.odds[2].value
                : odds.odds[1].value,
              updated_at: moment(market.updated_at).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
            });
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
            WHEN MATCHED THEN
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
                    ${o.home_odds ?? "NULL"},
                    ${o.draw_odds ?? "NULL"},
                    ${o.away_odds ?? "NULL"},
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

      // 다음 페이지
      if (res.data.result.pagination) {
        const pagination = res.data.result.pagination;
        if (pagination.page < pagination.total_pages) {
          await updateSportsData(pagination.next_link);
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

    for await (const sports of sportsArr) {
      const endPoint = `${process.env.SPORTS_URL}/${sports}/single${
        isInit ? "" : "/latest"
      }?token=${process.env.SPORTS_TOKEN}`;

      await updateSportsData(endPoint);

      console.log(`프리매치 ${sports} 업데이트 완료`);
    }
  } catch (err) {
    // console.log(err);
    console.log("프리매치 데이터 업데이트 실패");
  } finally {
    setTimeout(() => {
      this.getPrematchData(false);
    }, 6 * 10000);
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

    for await (const sports of sportsArr) {
      const endPoint = `${process.env.SPORTS_URL}/${sports}/special?token=${process.env.SPORTS_TOKEN}`;

      await updateSportsData(endPoint);

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

exports.connectInplaySocket = async () => {
  try {
    const sportsArr = [
      "soccer",
      "baseball",
      "icehockey",
      "basketball",
      "volleyball",
    ];

    for await (const sports of sportsArr) {
      await axios
        .get(
          `https://v6_i.api-77.com/getkey/${sports}?token=${process.env.SPORTS_TOKEN}`
        )
        .then((res) => {
          const key = res.data.result.key;
          const socket = new WebSocket(
            `wss://v6_i.api-77.com/ws/${sports}?key=${key}`
          );

          socket.on("open", () => {
            console.log(`실시간 ${sports} 웹소켓 연결됨`);
          });

          socket.on("message", (data) => {
            const str = data.toString("utf8");
            const jsonData = JSON.parse(str);
            const matchId = jsonData.g;

            // 팀정보
            if (jsonData.tp === 12) {
              SportsMatches.update(
                {
                  inplay_team_info: JSON.stringify(jsonData.tm),
                },
                {
                  where: {
                    match_id: matchId,
                  },
                }
              ).then(() => {
                console.log(`${matchId} 실시간 팀 정보 업데이트 완료`);
              });
            }

            // 스코어
            if (jsonData.tp === 13) {
              SportsMatches.update(
                {
                  inplay_score_info: JSON.stringify(jsonData.ss),
                },
                {
                  where: {
                    match_id: matchId,
                  },
                }
              ).then(() => {
                console.log(`${matchId} 실시간 스코어 정보 업데이트 완료`);
              });
            }

            // 배당
            if (jsonData.tp === 14 && jsonData.od) {
              const useInplayMarket = [
                10501, 10506, 10511, 14501, 14502, 14504, 15501, 15503, 15504,
                16501, 16502, 16503, 18501, 18502, 18503,
              ];
              const createOddsData = [];

              for (const market of jsonData.od) {
                if (!market.l) continue;

                if (!useInplayMarket.includes(market.m)) continue;

                for (const odds of market.l) {
                  const oddsKey = `${matchId}_${market.m}${
                    odds.n ? `_${odds.n}` : ""
                  }`;

                  const isUnder = odds.o[0].n === "Under";
                  const isThreeWay = odds.o.length === 3;

                  createOddsData.push({
                    odds_key: oddsKey,
                    match_id: matchId,
                    market_id: market.m,
                    is_market_stop: market.s,
                    is_odds_stop: odds.s,
                    odds_line: odds.n,
                    home_odds: isUnder ? odds.o[1].v : odds.o[0].v,
                    draw_odds: isThreeWay ? odds.o[1].v : null,
                    away_odds: isUnder
                      ? odds.o[0].v
                      : isThreeWay
                      ? odds.o[2].v
                      : odds.o[1].v,
                    updated_at: moment(market.ut).format("YYYY-MM-DD HH:mm:ss"),
                    is_home_stop: isUnder ? odds.o[1].s : odds.o[0].s,
                    is_draw_stop: isThreeWay ? odds.o[1].s : 0,
                    is_away_stop: isUnder
                      ? odds.o[0].s
                      : isThreeWay
                      ? odds.o[2].s
                      : odds.o[1].s,
                  });
                }
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
                            ${o.home_odds ?? "NULL"},
                            ${o.draw_odds ?? "NULL"},
                            ${o.away_odds ?? "NULL"},
                            '${o.updated_at}',
                            ${o.is_home_stop},
                            ${o.is_draw_stop},
                            ${o.is_away_stop}
                          )`
                  )
                  .join(",\n");

                const createOddsQuery = `
                        MERGE INTO sports_odds AS target
                        USING (VALUES 
                        ${oddsValues}
                        ) AS source (
                        odds_key, match_id, market_id, is_market_stop, is_odds_stop,
                        odds_line, home_odds, draw_odds, away_odds, updated_at, is_home_stop, is_draw_stop, is_away_stop
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
                            updated_at = source.updated_at,
                            is_home_stop = source.is_home_stop,
                            is_draw_stop = source.is_draw_stop,
                            is_away_stop = source.is_away_stop
                        WHEN NOT MATCHED THEN
                        INSERT (
                            odds_key, match_id, market_id, is_market_stop, is_odds_stop,
                            odds_line, home_odds, draw_odds, away_odds, updated_at, is_home_stop, is_draw_stop, is_away_stop
                        )
                        VALUES (
                            source.odds_key, source.match_id, source.market_id,
                            source.is_market_stop, source.is_odds_stop,
                            source.odds_line, source.home_odds,
                            source.draw_odds, source.away_odds, source.updated_at, source.is_home_stop, source.is_draw_stop, source.is_away_stop
                        );
                        `;

                db.sequelize.query(createOddsQuery).then(() => {
                  console.log(`${jsonData.g} 실시간 배당 업데이트 완료`);
                });
              }
            }

            // 경기상태
            if (jsonData.tp === 15) {
              SportsMatches.update(
                {
                  inplay_status_info: JSON.stringify(jsonData.st),
                },
                {
                  where: {
                    match_id: matchId,
                  },
                }
              ).then(() => {
                console.log(`${matchId} 실시간 경기상태 정보 업데이트 완료`);
              });
            }
          });
        });
    }
  } catch (err) {
    console.log("실시간 데이터 업데이트 실패");
  }
};
