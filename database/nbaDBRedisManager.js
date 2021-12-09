//MICHAEL CHANG
const redis = require("redis");

async function addStatsFromMongoToRedis(gameID, gameObject) {
  const statsList = [
    "pts",
    "reb",
    "ast",
    "tov",
    "stl",
    "blk",
    "team",
    "teamName",
  ];
  const redisC = redis.createClient();
  try {
    await redisC.connect();
    // if the teamStats object exists from Mongo, write it to Redis
    if (gameObject.teamStats !== undefined) {
      // home team stats
      for (const [key, value] of Object.entries(
        gameObject.teamStats.homeTeamStats
      )) {
        await redisC.hSet(`games:${gameID}:homeTeam`, key, value.toString());
      }
      // away team stats
      for (const [key, value] of Object.entries(
        gameObject.teamStats.awayTeamStats
      )) {
        await redisC.hSet(`games:${gameID}:awayTeam`, key, value.toString());
      }
      // if the teamStats object DOESN'T exists from Mongo, write it to Redis with default values
    } else {
      for (const stat of statsList) {
        if (stat !== "team" && stat !== "teamName") {
          await redisC.hSet(`games:${gameID}:awayTeam`, stat, "0");
          await redisC.hSet(`games:${gameID}:homeTeam`, stat, "0");
        } else if (stat === "team") {
          await redisC.hSet(
            `games:${gameID}:awayTeam`,
            stat,
            gameObject.awayTeam.abbreviation
          );
          await redisC.hSet(
            `games:${gameID}:homeTeam`,
            stat,
            gameObject.homeTeam.abbreviation
          );
        } else if (stat === "teamName") {
          await redisC.hSet(
            `games:${gameID}:awayTeam`,
            stat,
            gameObject.awayTeam.teamName
          );
          await redisC.hSet(
            `games:${gameID}:homeTeam`,
            stat,
            gameObject.homeTeam.teamName
          );
        }
      }
    }

    await redisC.hSet(`games:${gameID}:homeTeam`, "gameID", gameID);
    await redisC.hSet(`games:${gameID}:awayTeam`, "gameID", gameID);

    const homeTeamStats = await redisC.hGetAll(`games:${gameID}:homeTeam`);
    const awayTeamStats = await redisC.hGetAll(`games:${gameID}:awayTeam`);

    const statsFromRedis = { homeTeam: homeTeamStats, awayTeam: awayTeamStats };
    return statsFromRedis;
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

async function getRedisStats(gameID) {
  const redisC = redis.createClient();
  try {
    await redisC.connect();

    const homeTeamStats = await redisC.hGetAll(`games:${gameID}:homeTeam`);
    const awayTeamStats = await redisC.hGetAll(`games:${gameID}:awayTeam`);

    const statsFromRedis = { homeTeam: homeTeamStats, awayTeam: awayTeamStats };
    return statsFromRedis;
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

async function incrementBy10(gameID, homeOrAway, field) {
  const redisC = redis.createClient();
  try {
    await redisC.connect();

    await redisC.hIncrBy(`games:${gameID}:${homeOrAway}`, field, 10);
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

async function decrementBy10(gameID, homeOrAway, field) {
  const redisC = redis.createClient();
  try {
    await redisC.connect();

    await redisC.hIncrBy(`games:${gameID}:${homeOrAway}`, field, -10);
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

async function incrementBy1(gameID, homeOrAway, field) {
  const redisC = redis.createClient();
  try {
    await redisC.connect();

    await redisC.hIncrBy(`games:${gameID}:${homeOrAway}`, field, 1);
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

async function decrementBy1(gameID, homeOrAway, field) {
  const redisC = redis.createClient();
  try {
    await redisC.connect();

    await redisC.hIncrBy(`games:${gameID}:${homeOrAway}`, field, -1);
  } catch (error) {
    console.log(error);
  } finally {
    await redisC.quit();
  }
}

module.exports.addStatsFromMongoToRedis = addStatsFromMongoToRedis;
module.exports.getRedisStats = getRedisStats;
module.exports.incrementBy1 = incrementBy1;
module.exports.decrementBy1 = decrementBy1;
module.exports.incrementBy10 = incrementBy10;
module.exports.decrementBy10 = decrementBy10;
