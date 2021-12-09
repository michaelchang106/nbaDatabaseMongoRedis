//MICHAEL CHANG

const { MongoClient, ObjectId } = require("mongodb");

//Helper for connecting to the database
const collectionConnect = async (documents) => {
  //Database Name
  const dbName = "nbaDB";

  //Connect to url
  const url = "mongodb://localhost:27017";
  const client = await new MongoClient(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  //Connect to db
  await client.connect();

  //Connect to collection
  const db = await client.db(dbName);
  const collection = await db.collection(documents);

  return { collection, client };
};

async function calculateWinsAndLosses() {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;
    const aggregationWins = [
      { $match: { "winTeam.abbreviation": { $ne: null } } },
      { $project: { "winTeam.abbreviation": 1 } },
      { $group: { _id: "$winTeam.abbreviation", winCount: { $sum: 1 } } },
      { $sort: { winCount: -1 } },
    ];
    const aggregationLosses = [
      { $match: { "loseTeam.abbreviation": { $ne: null } } },
      { $project: { "loseTeam.abbreviation": 1 } },
      { $group: { _id: "$loseTeam.abbreviation", loseCount: { $sum: 1 } } },
      { $sort: { loseCount: 1 } },
    ];
    let teamsWinsAndLosses = {};

    //wins aggregation
    const res1 = await collection.aggregate(aggregationWins);
    await res1.forEach((team) => {
      teamsWinsAndLosses[team._id] = { wins: team.winCount, losses: 0 };
    });
    //losses aggregation
    const res2 = await collection.aggregate(aggregationLosses);
    await res2.forEach((team) => {
      teamsWinsAndLosses[team._id].losses = team.loseCount;
    });

    return teamsWinsAndLosses;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getGames() {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.find().toArray();
    res.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getSingleGame(gameID) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    //Can't de-bug why this find is not working.....
    const res = await collection.findOne({ _id: new ObjectId(gameID) });
    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getSingleTeam(teamID) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.findOne({ "homeTeam.abbreviation": teamID });
    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getTeams() {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.distinct("homeTeam");

    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getAllDates() {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.distinct("date");
    res.sort((a, b) => Date.parse(a) - Date.parse(b));
    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function filterGamesByTeam(team) {
  let connectedCollection;
  const query = {
    $or: [
      { "homeTeam.abbreviation": { $eq: team } },
      { "awayTeam.abbreviation": { $eq: team } },
    ],
  };
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.find(query).toArray();
    res.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function filterGamesByDate(date) {
  let connectedCollection;
  const query = { date: { $eq: date } };

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.find(query).toArray();
    res.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function filterGamesByTeamAndDate(team, date) {
  let connectedCollection;
  const query = {
    $and: [
      {
        $or: [
          { "homeTeam.abbreviation": { $eq: team } },
          { "awayTeam.abbreviation": { $eq: team } },
        ],
      },
      { date: date },
    ],
  };
  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    let res = await collection.find(query).toArray();
    res.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    return res;
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function deleteGame(gameID) {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    await collection.findOneAndDelete({ _id: new ObjectId(gameID.gameID) });
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function insertGame(homeTeam, awayTeam, date) {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;
    const homeTeamObject = await collection.findOne({
      "homeTeam.abbreviation": homeTeam,
    });
    const awayTeamObject = await collection.findOne({
      "awayTeam.abbreviation": awayTeam,
    });
    const insertObject = {
      date: date,
      awayTeam: awayTeamObject.awayTeam,
      homeTeam: homeTeamObject.homeTeam,
      winTeam: null,
      loseTeam: null,
      homeTeamPoints: null,
      awayTeamPoints: null,
      winTeamPoints: null,
      loseTeamPoints: null,
      attendance: null,
      overTime: null,
    };
    await collection.insertOne(insertObject);
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function updateGameResult(
  gameID,
  winTeam,
  loseTeam,
  homeTeamPoints,
  awayTeamPoints,
  winTeamPoints,
  loseTeamPoints,
  attendance,
  overTime
) {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;
    const winTeamObject = await collection.findOne({
      "homeTeam.abbreviation": winTeam,
    });
    const loseTeamObject = await collection.findOne({
      "homeTeam.abbreviation": loseTeam,
    });
    const insertObject = {
      $set: {
        winTeam: winTeamObject.homeTeam,
        loseTeam: loseTeamObject.homeTeam,
        homeTeamPoints: Number(homeTeamPoints),
        awayTeamPoints: Number(awayTeamPoints),
        winTeamPoints: Number(winTeamPoints),
        loseTeamPoints: Number(loseTeamPoints),
        attendance: Number(attendance),
        overTime: overTime,
      },
    };
    await collection.findOneAndUpdate(
      { _id: new ObjectId(gameID) },
      insertObject,
      { upsert: true }
    );
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

async function updateGameStats(homeTeamStats, awayTeamStats) {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = await connectedCollection.collection;

    const insertObject = {
      $set: {
        teamStats: {
          homeTeamStats: homeTeamStats,
          awayTeamStats: awayTeamStats,
        },
      },
    };

    await collection.findOneAndUpdate(
      { _id: new ObjectId(homeTeamStats.gameID) },
      insertObject,
      { upsert: true }
    );
  } catch (error) {
    console.log(error);
  } finally {
    await connectedCollection.client.close();
  }
}

module.exports.getGames = getGames;
module.exports.getSingleGame = getSingleGame;
module.exports.getTeams = getTeams;
module.exports.filterGamesByTeam = filterGamesByTeam;
module.exports.filterGamesByDate = filterGamesByDate;
module.exports.filterGamesByTeamAndDate = filterGamesByTeamAndDate;
module.exports.deleteGame = deleteGame;
module.exports.calculateWinsAndLosses = calculateWinsAndLosses;
module.exports.getAllDates = getAllDates;
module.exports.insertGame = insertGame;
module.exports.getSingleTeam = getSingleTeam;
module.exports.updateGameResult = updateGameResult;
module.exports.updateGameStats = updateGameStats;
