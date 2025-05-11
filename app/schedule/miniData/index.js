const db = require("../../models");
const MiniGames = db.mini_games;

const moment = require("moment");

exports.addCoinPowerball = async () => {
  try {
    const createGameData = [];
    const minutes = [3, 5];
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    for (const minute of minutes) {
      let startDate = moment(`${tomorrow} 00:00:00`);
      const endDate = moment(`${tomorrow} 23:59:00`);
      let dateRound = 1;

      while (startDate.isSameOrBefore(endDate)) {
        createGameData.push({
          game: "coin_powerball",
          minute,
          date_round: dateRound,
          date: tomorrow,
          start_datetime: startDate.format("YYYY-MM-DD HH:mm:ss"),
        });

        startDate.add(minute, "minutes");
        dateRound++;
      }
    }

    await MiniGames.bulkCreate(createGameData);

    console.log("코인 파워볼 게임 등록 완료");
  } catch (error) {
    console.error("코인 파워볼 게임 등록 실패", error);
  }
};

exports.addCoinLadder = async () => {
  try {
    const createGameData = [];
    const minutes = [3, 5];
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    for (const minute of minutes) {
      let startDate = moment(`${tomorrow} 00:00:00`);
      const endDate = moment(`${tomorrow} 23:59:00`);
      let dateRound = 1;

      while (startDate.isSameOrBefore(endDate)) {
        createGameData.push({
          game: "coin_ladder",
          minute,
          date_round: dateRound,
          date: tomorrow,
          start_datetime: startDate.format("YYYY-MM-DD HH:mm:ss"),
        });

        startDate.add(minute, "minutes");
        dateRound++;
      }
    }

    await MiniGames.bulkCreate(createGameData);

    console.log("코인 사다리 게임 등록 완료");
  } catch (error) {
    console.error("코인 사다리 게임 등록 실패", error);
  }
};

exports.addEosPowerball = async () => {
  try {
    const createGameData = [];
    const minutes = [1, 2, 3, 4, 5];
    const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    for (const minute of minutes) {
      let startDate = moment(`${tomorrow} 00:00:00`);
      const endDate = moment(`${tomorrow} 23:59:00`);
      let dateRound = 1;

      while (startDate.isSameOrBefore(endDate)) {
        createGameData.push({
          game: "eos_powerball",
          minute,
          date_round: dateRound,
          date: tomorrow,
          start_datetime: startDate.format("YYYY-MM-DD HH:mm:ss"),
        });

        startDate.add(minute, "minutes");
        dateRound++;
      }
    }

    await MiniGames.bulkCreate(createGameData);

    console.log("EOS 파워볼 게임 등록 완료");
  } catch (error) {
    console.error("EOS 파워볼 게임 등록 실패", error);
  }
};
