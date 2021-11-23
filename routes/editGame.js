// MICHAEL CHANG

const express = require("express");
const router = express.Router();
const nbaDB = require("../database/nbaDBMongoManager.js");

/* POST home page. */
router.post("/", async function (req, res, next) {
  console.log("Got request for /editGame");
  const gameID = req.body.gameID;

  try {
    const gameFromDB = await nbaDB.getSingleGame(gameID);

    if (gameFromDB._id == gameID) {
      // create a gameObject
      const gameObjectFromDB = {
        gameID: gameFromDB._id,
        winTeam: gameFromDB.winTeam,
        loseTeam: gameFromDB.loseTeam,
        homeTeam: gameFromDB.homeTeam,
        awayTeam: gameFromDB.awayTeam,
        date: gameFromDB.date,
        homeTeamPoints: gameFromDB.homeTeamPoints,
        awayTeamPoints: gameFromDB.awayTeamPoints,
        winTeamPoints: gameFromDB.winTeamPoints,
        loseTeamPoints: gameFromDB.loseTeamPoints,
        attendance: gameFromDB.attendance,
        overTime: gameFromDB.overTime,
      };
      res
        .status("200")
        .render("editGame", { gameObjectFromDB: gameObjectFromDB });
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

/* POST editGameUpdate page. */
router.post("/editGameUpdate", async function (req, res, next) {
  console.log("Got request for /editGameUpdate");
  const gameID = req.body.gameID;
  const winTeam = req.body.winTeam;
  const loseTeam = req.body.loseTeam;
  const homeTeamPoints = req.body.homeTeamPoints;
  const awayTeamPoints = req.body.awayTeamPoints;
  const winTeamPoints = req.body.winTeamPoints;
  const loseTeamPoints = req.body.loseTeamPoints;
  const attendance = req.body.attendance;
  const overTime = req.body.overTime;

  try {
    await nbaDB.updateGameResult(
      gameID,
      winTeam,
      loseTeam,
      homeTeamPoints,
      awayTeamPoints,
      winTeamPoints,
      loseTeamPoints,
      attendance,
      overTime
    );
    res.status("200").redirect("/games");
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO UPDATE");
    res.render("error", {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

module.exports = router;
