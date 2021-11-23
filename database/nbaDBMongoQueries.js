//MICHAEL CHANG

const { MongoClient } = require("mongodb");
// ----------------------------- DATABASE CONNECTION -----------------------------
//This connects to the collections
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

//----------------------------- QUERY 1 - AGGREGATION -----------------------------
// find win/loss record by team
const winLossRecord = async () => {
  let connectedCollection;

  const aggregationWins = [
    { $match: { "winTeam.teamName": { $ne: null } } },
    { $project: { "winTeam.teamName": 1 } },
    { $group: { _id: "$winTeam.teamName", winCount: { $sum: 1 } } },
    { $sort: { winCount: -1 } },
  ];
  const aggregationLosses = [
    { $match: { "loseTeam.teamName": { $ne: null } } },
    { $project: { "loseTeam.teamName": 1 } },
    { $group: { _id: "$loseTeam.teamName", loseCount: { $sum: 1 } } },
    { $sort: { loseCount: 1 } },
  ];

  try {
    let teamRecords = {};
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res1 = await collection.aggregate(aggregationWins);
    await res1.forEach((team) => {
      teamRecords[team._id] = { wins: team.winCount, losses: 0 };
    });
    //losses aggregation
    const res2 = await collection.aggregate(aggregationLosses);
    await res2.forEach((team) => {
      teamRecords[team._id].losses = team.loseCount;
    });

    console.log(teamRecords, "-----QUERY WITH AGGREGATION-----");
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

// ------------QUERY 2 - MORE THAN ONE EXPRESSION and LOGICAL CONNECTOR------------
// find average points won/loss by , by team, (minimum of 5 games won/loss)
const avgPtsWonLossBy = async () => {
  let connectedCollection;

  const aggregationPtsWonBy = [
    { $match: { "winTeam.teamName": { $ne: null } } },
    {
      $project: {
        "winTeam.teamName": 1,
        winTeamPoints: 1,
        loseTeamPoints: 1,
        wonByPoints: { $subtract: ["$winTeamPoints", "$loseTeamPoints"] },
      },
    },
    {
      $group: {
        _id: "$winTeam.teamName",
        avgWonByPoints: { $avg: "$wonByPoints" },
        totalWins: { $sum: 1 },
      },
    },
    { $match: { $expr: { $gte: ["$totalWins", 5] } } },
  ];
  const aggregationPtsLossBy = [
    { $match: { "loseTeam.teamName": { $ne: null } } },
    {
      $project: {
        "loseTeam.teamName": 1,
        winTeamPoints: 1,
        loseTeamPoints: 1,
        loseByPoints: { $subtract: ["$loseTeamPoints", "$winTeamPoints"] },
      },
    },
    {
      $group: {
        _id: "$loseTeam.teamName",
        avgLoseByPoints: { $avg: "$loseByPoints" },
        totalLosses: { $sum: 1 },
      },
    },
    { $match: { $expr: { $gte: ["$totalLosses", 5] } } },
  ];

  try {
    let teamRecords = {};
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res1 = await collection.aggregate(aggregationPtsWonBy);
    await res1.forEach((team) => {
      teamRecords[team._id] = {
        avgWonByPts: team.avgWonByPoints.toFixed(2),
        avgLoseByPts: 0,
      };
    });
    //losses aggregation
    const res2 = await collection.aggregate(aggregationPtsLossBy);
    await res2.forEach((team) => {
      if (Object.prototype.hasOwnProperty.call(teamRecords, team._id)) {
        teamRecords[team._id].avgLoseByPts = team.avgLoseByPoints.toFixed(2);
      } else {
        teamRecords[team._id] = {
          avgWonByPts: 0,
          avgLoseByPts: team.avgLoseByPoints.toFixed(2),
        };
      }
    });

    console.log(
      teamRecords,
      "-----QUERY WITH MULTIPLE EXPRESSIONS AND LOGICAL CONNECTOR-----"
    );
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

// -----------------QUERY 3 - COUNTING DOCUMENTS FOR A SPECIFIC USER----------------
// find win/loss record by team when team is at Home
const winLossRecordOfHomeTeam = async () => {
  let connectedCollection;

  const aggregationWins = [
    {
      $project: {
        "homeTeam.teamName": 1,
        "winTeam.teamName": 1,
        homeWin: { $strcasecmp: ["$homeTeam.teamName", "$winTeam.teamName"] },
      },
    },
    { $match: { homeWin: { $eq: 0 } } },
    { $group: { _id: "$homeTeam.teamName", homeWins: { $sum: 1 } } },
    { $sort: { homeWins: -1 } },
  ];
  const aggregationLosses = [
    {
      $project: {
        "loseTeam.teamName": 1,
        "homeTeam.teamName": 1,
        homeLoss: { $strcasecmp: ["$loseTeam.teamName", "$homeTeam.teamName"] },
      },
    },
    { $match: { homeLoss: { $eq: 0 } } },
    { $group: { _id: "$loseTeam.teamName", homeLosses: { $sum: 1 } } },
    { $sort: { homeLosses: -1 } },
  ];

  try {
    let teamRecords = {};
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res1 = await collection.aggregate(aggregationWins);
    await res1.forEach((team) => {
      teamRecords[team._id] = { homeWins: team.homeWins, homeLosses: 0 };
    });
    //losses aggregation
    const res2 = await collection.aggregate(aggregationLosses);
    await res2.forEach((team) => {
      teamRecords[team._id].homeLosses = team.homeLosses;
    });

    console.log(teamRecords, "-----QUERY COUNTING DOCUMENTS-----");
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

// --------------QUERY 4 - UPDATE DOCUMENT BASED ON QUERY PARAMETER-----------------
// calculate total points between two teams when the game went into overtime
const overTimeGamesTotalPoints = async () => {
  let connectedCollection;

  const aggregation = [
    { $match: { overTime: { $ne: null } } },
    {
      $project: {
        overTime: 1,
        "winTeam.teamName": 1,
        "loseTeam.teamName": 1,
        winTeamPoints: 1,
        loseTeamPoints: 1,
        totalPoints: { $add: ["$winTeamPoints", "$loseTeamPoints"] },
      },
    },
    { $sort: { totalPoints: 1 } },
    { $set: { wentIntoOvertime: true } },
  ];
  try {
    let overTimeGames = [];
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res = await collection.aggregate(aggregation);
    await res.forEach((game) => {
      overTimeGames.push(game);
    });

    console.log(
      overTimeGames,
      "-----QUERY UPDATING DOCUMENTS BASED ON QUERY-----"
    );
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

// --------------------QUERY 5 - GENERAL QUERY WITH AGGREGATION------------------------
// calculate average attendance by homeTeam
const averageAttendanceByHomeTeam = async () => {
  let connectedCollection;

  const aggregation = [
    { $project: { "homeTeam.teamName": 1, attendance: 1 } },
    {
      $group: {
        _id: "$homeTeam.teamName",
        avgAttendance: { $avg: "$attendance" },
      },
    },
  ];

  try {
    let averageAttendance = [];
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res = await collection.aggregate(aggregation);
    await res.forEach((team) => {
      team.avgAttendance = team.avgAttendance.toFixed(0);
      averageAttendance.push(team);
    });

    console.log(averageAttendance, "-----GENERAL QUERY WITH AGGREGATION-----");
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

// ---------------QUERY 6 - GENERAL QUERY WITH MULTIPLE EXPRESSIONS---------------
// calculate wins by team in month of November
const winsInNovember = async () => {
  let connectedCollection;

  const aggregation = [
    { $addFields: { convertedDate: { $toDate: "$date" } } },
    {
      $match: {
        convertedDate: {
          $gt: new Date("Sun, 31 Oct 2021 07:00:00 GMT"),
          $lte: new Date("Tue, 30 Nov 2021 08:00:00 GMT"),
        },
        "winTeam.teamName": { $ne: null },
      },
    },
    { $group: { _id: "$winTeam.teamName", winsInNovember: { $sum: 1 } } },
    { $sort: { winsInNovember: -1 } },
  ];
  try {
    let teamRecords = {};
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    //wins aggregation
    const res = await collection.aggregate(aggregation);
    await res.forEach((team) => {
      teamRecords[team._id] = { winsInNovember: team.winsInNovember };
    });

    console.log(
      teamRecords,
      "-----GENERAL QUERY WITH MULTIPLE EXPRESSIONS-----"
    );
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

function main() {
  winLossRecord();
  avgPtsWonLossBy();
  winLossRecordOfHomeTeam();
  overTimeGamesTotalPoints();
  averageAttendanceByHomeTeam();
  winsInNovember();
}

main();

module.exports = {
  winLossRecord,
  avgPtsWonLossBy,
  winLossRecordOfHomeTeam,
  overTimeGamesTotalPoints,
  averageAttendanceByHomeTeam,
  winsInNovember,
};
