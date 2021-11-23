const express = require("express");
const router = express.Router();
const nbaDB = require("../database/nbaDBMongoManager.js");

/* GET /games page. */
router.get("/", async function (req, res) {
  console.log("Got request for /games");

  try {
    const games = await nbaDB.getGames();
    await res.render("games", {
      games: games,
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
