const axios = require("axios");
const db = require("../../models");
const Op = db.Sequelize.Op;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
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

          createOddsData.push({
            odds_key: oddsKey,
            match_id: match.id,
            market_id: market.market_id,
            is_market_stop: market.stop,
            is_odds_stop: odds.stop,
            odds_line: odds.name,
            home_odds: odds.odds[0].value,
            draw_odds: odds.odds.length === 3 ? odds.odds[1].value : null,
            away_odds:
              odds.odds.length === 3 ? odds.odds[2].value : odds.odds[1].value,
            updated_at: moment(market.updated_at).format("YYYY-MM-DD HH:mm:ss"),
          });
        }
      }
    }

    await SportsMatches.bulkCreate(createMatchData);

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
    const pagination = res.data.result.pagination;
    if (pagination.page < pagination.total_pages) {
      console.log(pagination.next_link);
      await updateSportsData(pagination.next_link);
    }
  });
};

exports.getSportsMatches = async (isInit) => {
  try {
    console.log("스포츠 데이터 업데이트 시작");

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

      console.log(`${sports} 업데이트 완료`);
    }
  } catch (err) {
    console.log("스포츠 데이터 업데이트 실패");
  } finally {
    setTimeout(() => {
      this.getSportsMatches(false);
    }, 6 * 10000);
  }
};
