// MICHAEL CHANG

const express = require("express");
const router = express.Router();
const nbaDB = require("../database/nbaDBMongoManager.js");

/* POST home page. */
router.get("/", async function (req, res, next) {
  const games = await nbaDB.getGames();
  const teams = await nbaDB.getTeams();
  const teamsWinsAndLosses = await nbaDB.calculateWinsAndLosses();
  const allDates = await nbaDB.getAllDates();

  res.render("teamStats", {
    games: games,
    teams: teams,
    teamsWinsAndLosses: teamsWinsAndLosses,
    allDates: allDates,
    current: { selectedTeam: null, selectedDate: null },
  });
});

/* POST /teamStats/filterBy. */
router.post("/filterBy", async function (req, res) {
  const teamID = req.body.teamID;
  const date = req.body.date;
  const teamName = req.body.teamName;

  let games;

  // specify which SQLite query to use based on date && teamID
  // date and teamID are empty
  if (teamID === "" && date === "") {
    res.status("200").redirect("/teamStats");
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

  try {
    res.render("teamStats", {
      games: games,
      teams: teams,
      teamsWinsAndLosses: teamsWinsAndLosses,
      allDates: allDates,
      current: { selectedTeam: teamID, selectedDate: date, teamName: teamName },
    });
  } catch (error) {
    console.log("CAUGHT AN ERORR TRYING TO RENDER");
    res.render(error, {
      error: error,
      message: "There was an error, please fix and try again",
    });
  }
});

module.exports = router;
