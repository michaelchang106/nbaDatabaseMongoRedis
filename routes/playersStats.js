//Daniel Lisko

const express = require("express");
const router = express.Router();
const dbManger = require("../database/myMongoDB");

const redisManager = require("../database/myRedisManager.js");

router.get("/", async function (req, res) {
  let teams = await dbManger.getTeams();

  teams.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  res.render("playersStats", { teams: teams });
});

router.get("/team/:name", async (req, res) => {
  const team = req.params.name;
  const games = await dbManger.getGames(team);

  res.render("teamSchedule", { games: games, team: team });
});

router.get("/game/:gameID", async (req, res) => {
  const gameID = req.params.gameID;
  await redisManager.loadGameInfo(gameID);
  let opponents = await redisManager.getGameStats(gameID);

  res.render("playerGameEdits", {
    homeTeam: opponents.homeTeam,
    awayTeam: opponents.awayTeam,
    gameID: gameID,
  });
});

router.get("/game/:gameID/:playerID/:stat/:amount", async (req, res) => {
  console.log("PARAMS", req.params);
  redisManager.upDateGameStats(req.params);
  res.redirect(`/playersStats/game/${req.params.gameID}`);
});

router.post("/saveStats/", async (req, res) => {
  const toUpdate = req.body;

  await dbManger.updateGame(toUpdate);

  res.redirect(`/playersStats/game/${req.body.gameID}`);
});

router.get("/deleteStats/:gameID", async (req, res) => {
  await redisManager.deleteStats(req.params.gameID);
  res.redirect(`/playersStats/game/${req.params.gameID}`);
});
module.exports = router;
