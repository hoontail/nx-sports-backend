const db = require("../../models");
const helpers = require("../../helpers");
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;

exports.getSportsListForUser = async (req, res) => {
  const { page, sports, gameType } = req.query;
  const { offset, limit } = helpers.getPagination(page, 100);
};
