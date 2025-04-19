const axios = require("axios");
const db = require("../../models");
const Op = db.Sequelize.Op;
const SportsMatches = db.sports_matches;
const fs = require("fs");

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
  const sportsArr = [
    "soccer",
    "baseball",
    "icehockey",
    "basketball",
    "volleyball",
  ];

  await axios
    .get(
      `https://v6_i.api-77.com/getkey/icehockey?token=${process.env.SPORTS_TOKEN}`
    )
    .then((res) => {
      const key = res.data.result.key;
      const socket = new WebSocket(
        `wss://v6_i.api-77.com/ws/icehockey?key=${key}`
      ); // 외부 WS 주소

      socket.on("open", () => {
        console.log("웹소켓 연결됨!");
      });

      socket.on("message", (data) => {
        console.log("받은 메시지:", data.toString());
      });

      //   socket.on("close", () => {
      //     console.log("연결 종료됨");
      //   });

      //   socket.on("error", (error) => {
      //     console.error("에러 발생:", error);
      //   });
    });
};

const ms = {
  tp: 11,
  g: 54473017,
  b: 173137599,
  ut: 1744999107862,
  gm: {
    l: 48900,
    ln: "Extraliga",
    le: "Extraliga",
    li: "https://static.vv-z.com/image/l/17/489006a8ba9.png",
    h: 30607036,
    hn: "Kosice",
    he: "Kosice",
    hi: "https://static.vv-z.com/image/t/17/3060703611fbdb.png",
    a: 30607470,
    an: "Nitra",
    ae: "Nitra",
    ai: "https://static.vv-z.com/image/t/17/306074703ec337.png",
    c: "SK",
    ck: "슬로바키아",
    ci: "https://static.vv-z.com/image/c/Slovakia.png",
  },
  od: [
    {
      ut: 1744999095313,
      m: 15503,
      mn: "핸디캡",
      s: 0,
      l: [
        {
          n: "-1.5",
          s: 0,
          o: [
            { n: "Home", v: "5.75", s: 0 },
            { n: "Away", v: "1.14", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15504,
      mn: "언더오버",
      s: 0,
      l: [
        {
          n: "1.5",
          s: 0,
          o: [
            { n: "Under", v: "1.75", s: 0 },
            { n: "Over", v: "2.05", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15502,
      mn: "승패",
      s: 0,
      l: [
        {
          s: 0,
          o: [
            { n: "Home", v: "1.75", s: 0 },
            { n: "Away", v: "2.05", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15501,
      mn: "승무패",
      s: 0,
      l: [
        {
          s: 0,
          o: [
            { n: "Home", v: "3.00", s: 0 },
            { n: "Draw", v: "2.05", s: 0 },
            { n: "Away", v: "3.60", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15515,
      mn: "핸디캡(추가기준점)",
      s: 0,
      l: [
        {
          n: "-2.5",
          s: 0,
          o: [
            { n: "Home", v: "10.00", s: 0 },
            { n: "Away", v: "1.03", s: 0 },
          ],
        },
        {
          n: "1.5",
          s: 0,
          o: [
            { n: "Home", v: "1.09", s: 0 },
            { n: "Away", v: "6.75", s: 0 },
          ],
        },
        {
          n: "-1.0",
          s: 0,
          o: [
            { n: "Home", v: "5.75", s: 0 },
            { n: "Away", v: "1.33", s: 0 },
          ],
        },
        {
          n: "2.0",
          s: 0,
          o: [
            { n: "Home", v: "1.09", s: 0 },
            { n: "Away", v: "16.00", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15516,
      mn: "언더오버(추가기준점)",
      s: 0,
      l: [
        {
          n: "2.5",
          s: 0,
          o: [
            { n: "Under", v: "1.18", s: 0 },
            { n: "Over", v: "10.00", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15507,
      mn: "더블찬스",
      s: 0,
      l: [
        {
          s: 0,
          o: [
            { n: "Home/Draw", v: "1.22", s: 0 },
            { n: "Home/Away", v: "1.70", s: 0 },
            { n: "Draw/Away", v: "1.33", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15543,
      mn: "3피리어드 핸디캡",
      s: 0,
      l: [
        {
          n: "-0.5",
          s: 0,
          o: [
            { n: "Home", v: "2.95", s: 0 },
            { n: "Away", v: "1.35", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15553,
      mn: "3피리어드 언더오버",
      s: 0,
      l: [
        {
          n: "1.5",
          s: 0,
          o: [
            { n: "Under", v: "1.70", s: 0 },
            { n: "Over", v: "2.10", s: 0 },
          ],
        },
      ],
    },
    {
      ut: 1744999095313,
      m: 15517,
      mn: "정확한 스코어",
      s: 0,
      l: [
        {
          n: "1-0",
          s: 0,
          o: [
            { n: "Home", v: "2.45", s: 0 },
            { n: "Away", v: "2.75", s: 0 },
          ],
        },
        {
          n: "2-0",
          s: 0,
          o: [
            { n: "Home", v: "7.00", s: 0 },
            { n: "Away", v: "9.00", s: 0 },
          ],
        },
        {
          n: "2-1",
          s: 0,
          o: [
            { n: "Home", v: "6.00", s: 0 },
            { n: "Away", v: "6.50", s: 0 },
          ],
        },
        {
          n: "3-0",
          s: 0,
          o: [
            { n: "Home", v: "15.00", s: 0 },
            { n: "Away", v: "20.00", s: 0 },
          ],
        },
        {
          n: "3-1",
          s: 0,
          o: [
            { n: "Home", v: "23.00", s: 0 },
            { n: "Away", v: "26.00", s: 0 },
          ],
        },
        {
          n: "3-2",
          s: 0,
          o: [
            { n: "Home", v: "36.00", s: 0 },
            { n: "Away", v: "41.00", s: 0 },
          ],
        },
        {
          n: "4-0",
          s: 0,
          o: [
            { n: "Home", v: "90.00", s: 0 },
            { n: "Away", v: "101.00", s: 0 },
          ],
        },
        {
          n: "4-1",
          s: 0,
          o: [
            { n: "Home", v: "51.00", s: 0 },
            { n: "Away", v: "81.00", s: 0 },
          ],
        },
        {
          n: "4-2",
          s: 0,
          o: [
            { n: "Home", v: "151.00", s: 0 },
            { n: "Away", v: "151.00", s: 0 },
          ],
        },
        {
          n: "5-1",
          s: 0,
          o: [
            { n: "Home", v: "151.00", s: 0 },
            { n: "Away", v: "", s: 1 },
          ],
        },
      ],
    },
  ],
  ss: {
    1: { h: "0", a: "0" },
    2: { h: "0", a: "0" },
    3: { h: "0", a: "0" },
    t: { h: "0", a: "0" },
  },
  tm: { h: { s: "0" }, a: { s: "0" }, e: {} },
  st: {
    m: "17",
    ms: "17:37",
    mi: 1057,
    ss: "3피리어드",
    si: 30003,
    tt: 1,
    sd: 0,
    rm: 0,
  },
};
