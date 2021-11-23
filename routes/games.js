// MICHAEL CHANG

const express = require("express");
const router = express.Router();
const nbaDB = require("../database/nbaDBMongoManager.js");

/* GET /games page. */
router.get("/", async function (req, res) {
  console.log("Got request for /games");

  const games = await nbaDB.getGames();
  const teams = await nbaDB.getTeams();
  const teamsWinsAndLosses = await nbaDB.calculateWinsAndLosses();
  const allDates = await nbaDB.getAllDates();

  res.render("games", {
    games: games,
    teams: teams,
    teamsWinsAndLosses: teamsWinsAndLosses,
    allDates: allDates,
    current: { selectedTeam: null, selectedDate: null },
  });
});

/* POST /games/filterBy. */
router.post("/filterBy", async function (req, res) {
  console.log("Got request for /filterBy");
  const teamID = req.body.teamID;
  const date = req.body.date;
  const teamName = req.body.teamName;

  let games;

  // specify which SQLite query to use based on date && teamID
  // date and teamID are empty
  if (teamID === "" && date === "") {
    res.status("200").redirect("/games");
    return;
    // date is empty
  } else if (date === "") {
    games = await nbaDB.filterGamesByTeam(teamID);
    // teamID is empty
  } else if (teamID === "") {
    games = await nbaDB.filterGamesByDate(date);
    // date and teamID are both present
  } else if (!(teamID === "") && !(date === "")) {
    games = await nbaDB.filterGamesByTeamAndDate(teamID, date);
  }

  const allDates = await nbaDB.getAllDates();
  const teams = await nbaDB.getTeams();
  const teamsWinsAndLosses = await nbaDB.calculateWinsAndLosses(teams);
  
  console.log("Got Games filterBy");
  try {

    res.render("games", {
      games: games,
      teams: teams,
      teamsWinsAndLosses: teamsWinsAndLosses,
      allDates: allDates,
      current: { selectedTeam: teamID, selectedDate: date, teamName: teamName},
    });
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO RENDER");
    res.render(error, {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

/* POST /games/insertGame. */
router.post("/insertGame", async function (req, res) {
  console.log("Got request for /insertGame");
  const homeTeam = req.body.homeTeam;
  const awayTeam = req.body.awayTeam;
  let date = req.body.date;

  date = date.replace(/^0+/, "");

  try {
    await nbaDB.insertGame(homeTeam, awayTeam, date);
    res.status("200").redirect("/games");
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO INSERT");
    res.render("error", {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

/* POST /games/deleteGame. */
router.post("/deleteGame", async function (req, res) {
  console.log("Got request for /deleteGame");
  const gameID = req.body;

  try {
    await nbaDB.deleteGame(gameID);
    res.status("200").redirect("/games");
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO INSERT");
    res.render("error", {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

module.exports = router;
