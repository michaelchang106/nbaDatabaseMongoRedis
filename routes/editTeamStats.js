// MICHAEL CHANG

const express = require("express");
const router = express.Router();
const nbaDBMongo = require("../database/nbaDBMongoManager.js");
const nbaDBRedis = require("../database/nbaDBRedisManager.js");

/* POST home page. */
router.post("/", async function (req, res, next) {
  const gameID = req.body.gameID;

  try {
    const gameFromMongo = await nbaDBMongo.getSingleGame(gameID);

    // get data from mongo
    if (gameFromMongo._id == gameID) {
      // create a gameObject
      const gameObjectFromMongo = {
        gameID: gameFromMongo._id,
        winTeam: gameFromMongo.winTeam,
        loseTeam: gameFromMongo.loseTeam,
        homeTeam: gameFromMongo.homeTeam,
        awayTeam: gameFromMongo.awayTeam,
        date: gameFromMongo.date,
        homeTeamPoints: gameFromMongo.homeTeamPoints,
        awayTeamPoints: gameFromMongo.awayTeamPoints,
        winTeamPoints: gameFromMongo.winTeamPoints,
        loseTeamPoints: gameFromMongo.loseTeamPoints,
        teamStats: gameFromMongo.teamStats,
      };

      // write data FROM mongo TO redis
      const redisTeamStats = await nbaDBRedis.addStatsFromMongoToRedis(
        gameID,
        gameObjectFromMongo
      );

      const statsList = [];

      for (const [key, value] of Object.entries(redisTeamStats)) {
        statsList.push(value);
      }

      statsList.sort((a, b) => b.pts - a.pts);

      res.status("200").render("editTeamStats", {
        redisTeamStats: redisTeamStats,
        statsList: statsList,
      });
    } else {
      console.log("Game data from frontEnd doesn't match database");
      throw new Error("Game data doesn't match database");
    }
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO UPDATE");
    res.render("error", {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

/* POST editTeamStatsUpdate page. */
router.get(
  "/games/:gameID/:homeOrAway/:action",
  async function (req, res, next) {
    try {
      console.log("HERE");
      const gameID = req.params.gameID;
      const homeOrAway = req.params.homeOrAway;
      const action = req.params.action;

      // change call depending on action
      switch (action) {
        case "incrPtsBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "pts");
          break;
        case "decrPtsBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "pts");
          break;
        case "incrPtsBy10":
          await nbaDBRedis.incrementBy10(gameID, homeOrAway, "pts");
          break;
        case "decrPtsBy10":
          await nbaDBRedis.decrementBy10(gameID, homeOrAway, "pts");
          break;
        case "incrRebBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "reb");
          break;
        case "decrRebBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "reb");
          break;
        case "incrRebBy10":
          await nbaDBRedis.incrementBy10(gameID, homeOrAway, "reb");
          break;
        case "decrRebBy10":
          await nbaDBRedis.decrementBy10(gameID, homeOrAway, "reb");
          break;
        case "incrAstBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "ast");
          break;
        case "decrAstBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "ast");
          break;
        case "incrAstBy10":
          await nbaDBRedis.incrementBy10(gameID, homeOrAway, "ast");
          break;
        case "decrAstBy10":
          await nbaDBRedis.decrementBy10(gameID, homeOrAway, "ast");
          break;
        case "incrTovBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "tov");
          break;
        case "decrTovBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "tov");
          break;
        case "incrTovBy10":
          await nbaDBRedis.incrementBy10(gameID, homeOrAway, "tov");
          break;
        case "decrTovBy10":
          await nbaDBRedis.decrementBy10(gameID, homeOrAway, "tov");
          break;
        case "incrStlBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "stl");
          break;
        case "decrStlBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "stl");
          break;
        case "incrBlkBy1":
          await nbaDBRedis.incrementBy1(gameID, homeOrAway, "blk");
          break;
        case "decrBlkBy1":
          await nbaDBRedis.decrementBy1(gameID, homeOrAway, "blk");
      }

      const redisTeamStats = await nbaDBRedis.getRedisStats(gameID);

      // for sorting
      const statsList = [];
      const sortActions = ["pts", "reb", "ast", "tov", "stl", "blk"];

      for (const value of Object.values(redisTeamStats)) {
        statsList.push(value);
      }

      if (sortActions.includes(action)) {
        statsList.sort((a, b) => b[`${action}`] - a[`${action}`]);
      } else {
        statsList.sort((a, b) => b.pts - a.pts);
      }

      res.status("200").render("editTeamStats", {
        redisTeamStats: redisTeamStats,
        statsList: statsList,
      });
    } catch (error) {
      console.log("CAUGHT AN ERORR TRYING TO UPDATE");
      res.render("error", {
        error: error,
        message: "There was an error, please fix and try again",
      });
    }
  }
);

router.get("/games/:gameID", async function (req, res, next) {
  try {
    const gameID = req.params.gameID;
    const redisTeamStats = await nbaDBRedis.getRedisStats(gameID);

    await nbaDBMongo.updateGameStats(
      redisTeamStats.homeTeam,
      redisTeamStats.awayTeam
    );
    res.status("200").redirect("/teamStats");
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO UPDATE");
    res.render("error", {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

module.exports = router;
