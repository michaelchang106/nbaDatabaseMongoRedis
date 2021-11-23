const express = require("express");
const router = express.Router();
const myDB = require("../data/myMongoDB.js");
/* GET home page. */

router.get("/", async function (req, res) {
  const teams = await myDB.getTeams();
  // console.log("Team----->", teams);
  res.render("employees", { teams: teams });
});

router.get("/team/:name", async (req, res) => {
  // console.log("Got team name: ", req.params.value);
  const team = req.params.name;
  const players = await myDB.getTeamPlayers(team);

  const coach = await myDB.getCoach(team);

  res.render("teams", { players: players, team: team, coach: coach });
});

router.post("/edit", async (req, res) => {
  let editing = req.body;

  editing = await JSON.parse(JSON.stringify(editing));
  console.log("Editing=================: ", editing.team.toString());
  res.render("edit", { player: editing });
});

router.post("/deleteEmployee", async (req, res) => {
  const playerToDelete = req.body;
  await myDB.deletePlayer(playerToDelete);
  console.log("Player deleted.");
  res.redirect(`/employees/team/${playerToDelete.team}`);
});

router.post("/submitEdit", async (req, res) => {
  const player = req.body;
  console.log("Submitting for edit", player.firstName);
  await myDB.editPlayer(player);
  console.log("EDITS", player.team);
  res.redirect(`/employees/team/${player.team}`);
});

router.post("/player/create", async (req, res) => {
  const newPlayer = req.body;
  await myDB.createNewEmployee(newPlayer);
  res.redirect(`/employees/team/${newPlayer.team}`);
});

module.exports = router;
