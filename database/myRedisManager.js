//Daniel Lisko

const redis = require("redis");
const dbManager = require("./myMongoDB.js"); //Use Michael's dbManager to grab a game.
const { ObjectId } = require("mongodb");

//Get Game For into Redis
const loadGameInfo = async (gameID) => {
  let redisClient;
  try {
    //Connect to Redis
    redisClient = redis.createClient();
    await redisClient.connect();

    const setExist = await redisClient.EXISTS(`gameID:${gameID}`);
    console.log("Set", setExist);

    if (setExist < 1) {
      //Get a single game
      const game = await dbManager.getSingleGame(gameID);
      const players = await dbManager.getGamePlayers(
        game.homeTeam.teamName,
        game.awayTeam.teamName
      );

      redisClient.HSET(`game:match:${gameID}`, {
        home: game.homeTeam.teamName,
        away: game.awayTeam.teamName,
      });

      //Add players to a game
      for (const player of players) {
        //Creates a list of players in the game
        const playerID = ObjectId(player._id).toString();
        redisClient.ZADD(`gameID:${gameID}`, { value: playerID, score: 0 });

        // Creates a hash for player game time stats
        redisClient.HSET(`stats:${playerID}:${gameID}`, {
          points: 0,
          rebounds: 0,
          steals: 0,
        });

        //Create Hash for player info
        redisClient.HSET(`info:${playerID}`, {
          fName: player.firstName,
          lName: player.lastName,
          position: player.positionDesc[0],
          jerseyNum: player.jerseyNum,
          team: player.team.teamName,
        });
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    await redisClient.quit();
  }
};

const getGameStats = async (gameID) => {
  let redisClient;
  try {
    //Connect to Redis
    redisClient = redis.createClient();
    await redisClient.connect();
    let opponenets = {};
    let homePlayers = [];
    let awayPlayers = [];
    let homeScore = 0;
    let homeRebound = 0;
    let homeSteal = 0;
    let awayScore = 0;
    let awayRebound = 0;
    let awaySteal = 0;

    //Get the players IDs
    const playerIDs = await redisClient.ZRANGE(`gameID:${gameID}`, 0, -1, {
      REV: true,
    });

    console.log("playerIDs", playerIDs);

    //Get Teams
    opponenets.homeTeam = {
      teamName: await redisClient.HGET(`game:match:${gameID}`, "home"),
    };
    opponenets.awayTeam = {
      teamName: await redisClient.HGET(`game:match:${gameID}`, "away"),
    };

    //Get platyer info (position, jerseyNum, points, etc)
    for (const id of playerIDs) {
      let player = {};
      let stats = {};
      player.id = id;
      player.firstName = await redisClient.HGET(`info:${id}`, "fName");
      player.lastName = await redisClient.HGET(`info:${id}`, "lName");
      player.position = await redisClient.HGET(`info:${id}`, "position");
      player.jerseyNum = await redisClient.HGET(`info:${id}`, "jerseyNum");
      player.team = await redisClient.HGET(`info:${id}`, "team");

      //Add in game stats
      stats.points = await redisClient.HGET(`stats:${id}:${gameID}`, "points");
      stats.rebounds = await redisClient.HGET(
        `stats:${id}:${gameID}`,
        "rebounds"
      );
      stats.steals = await redisClient.HGET(`stats:${id}:${gameID}`, "steals");

      //Add Opponents that are playing
      player.stats = stats;

      if (player.team === opponenets.homeTeam.teamName) {
        homeScore += Number(player.stats.points);
        homeRebound += Number(player.stats.rebounds);
        homeSteal += Number(player.stats.steals);
        homePlayers.push(player);
      } else if (player.team === opponenets.awayTeam.teamName) {
        awayScore += Number(player.stats.points);
        awayRebound += Number(player.stats.rebounds);
        awaySteal += Number(player.stats.steals);
        awayPlayers.push(player);
      } else {
        console.log("ERROR");
      }
    }

    //Assignt Opponent parameters
    opponenets.awayTeam.players = awayPlayers;
    opponenets.awayTeam.stats = {
      score: awayScore,
      rebounds: awayRebound,
      steals: awaySteal,
    };
    opponenets.homeTeam.players = homePlayers;
    opponenets.homeTeam.stats = {
      score: homeScore,
      rebounds: homeRebound,
      steals: homeSteal,
    };

    return opponenets;
  } catch (e) {
    console.log(e);
  } finally {
    await redisClient.quit();
  }
};

const upDateGameStats = async (newStats) => {
  console.log("---->", newStats);
  let redisClient;
  try {
    //Connect to Redis
    redisClient = redis.createClient();
    await redisClient.connect();

    const playerID = newStats.playerID;
    const gameID = newStats.gameID;

    await redisClient.HINCRBY(
      `stats:${playerID}:${gameID}`,
      newStats.stat,
      newStats.amount
    );

    if (newStats.stat === "points") {
      let oldScore = await redisClient.ZSCORE(`gameID:${gameID}`, playerID);

      oldScore = Number(oldScore) + Number(newStats.amount);

      await redisClient.ZADD(`gameID:${gameID}`, {
        value: playerID,
        score: oldScore,
      });
    }
  } catch (e) {
    console.log(e);
  } finally {
    await redisClient.quit();
  }
};

const deleteStats = async (gameID) => {
  let redisClient;
  try {
    //Connect to Redis
    redisClient = redis.createClient();
    await redisClient.connect();

    //To Delete all the stats from Redis
    await redisClient.DEL(`gameID:${gameID}`);

    //Clear results from Mongo
    const clearData = { gameID: gameID, homeScore: null, awayScore: "" };
    await dbManager.updateGame(clearData);
  } catch (e) {
    console.log(e);
  } finally {
    await redisClient.quit();
  }
};

//Export Modules
module.exports.loadGameInfo = loadGameInfo;
module.exports.getGameStats = getGameStats;
module.exports.upDateGameStats = upDateGameStats;
module.exports.deleteStats = deleteStats;
