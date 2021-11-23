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
  console.log("Connected to server");

  //Connect to collection
  const db = await client.db(dbName);
  const collection = await db.collection(documents);
  console.log("collection => ", documents);

  return { collection, client };
};

//Getter Functions
async function getTeamPlayers(team) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;

    const query = {
      "team.teamName": team,
      employeeType: "player",
    };

    let res = await collection.find(query).toArray();

    return res;
  } catch (e) {
    console.log(e);
  } finally {
    await connectedCollection.client.close();
  }
}

async function getTeams() {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;

    const query = [
      {
        $group: {
          _id: {
            name: "$team.teamName",
            abbreviation: "$team.abbreviation",
          },
        },
      },
      {
        $addFields: {
          name: "$_id.name",
          abbreviation: "$_id.abbreviation",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];

    console.log("searching");
    const res = await collection.aggregate(query).toArray();
    return res;

    // return res;
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Close Connection");
    await connectedCollection.client.close();
  }
}

async function getCoach(team) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;

    const query = {
      "team.teamName": `${team}`,
      employeeType: "coach",
    };

    const res = await collection.find(query).toArray();

    return res;
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Close Connection");
    await connectedCollection.client.close();
  }
}

async function deletePlayer(player) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;
    await collection.deleteOne({ _id: new ObjectId(player._id) });
  } catch (e) {
    console.log(e);
  } finally {
    await connectedCollection.client.close();
  }
}

async function createNewEmployee(newEmployee) {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;
    const teamAgg = [
      {
        $match: {
          "team.teamName": newEmployee.team,
        },
      },
      {
        $group: {
          _id: "$team",
        },
      },
      {
        $addFields: {
          city: "$_id.state",
          abbreviation: "$_id.city",
          state: "$_id.state",
          teamName: "$_id.teamName",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ];

    const teaminfo = await collection.aggregate(teamAgg).toArray();

    console.log(teaminfo[0]);
    const addPlayer = {
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      jerseyNum: newEmployee.jerseyNum,
      positionDesc: newEmployee.positionDesc,
      birthDate: newEmployee.birthDate,
      employeeType: "player",
      attributes: {
        weight: newEmployee.weight,
        height: newEmployee.height,
      },
      team: teaminfo[0],
    };
    console.log("TEAM INFO", addPlayer);
    await collection.insertOne(addPlayer);
  } catch (e) {
    console.log(e);
  } finally {
    await connectedCollection.client.close();
  }
}

async function editPlayer(player) {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect("Employees");
    const collection = await connectedCollection.collection;

    const query = [
      {
        $set: {
          firstName: player.firstName,
          lastName: player.lastName,
          jerseyNum: player.jerseyNum,
          "attributes.weight": player.weight,
        },
      },
    ];
    await collection.updateOne({ _id: new ObjectId(player._id) }, query);
  } catch (e) {
    console.log(e);
  } finally {
    await connectedCollection.client.close();
  }
}

module.exports.getTeamPlayers = getTeamPlayers;
module.exports.getTeams = getTeams;
module.exports.getCoach = getCoach;
module.exports.createNewEmployee = createNewEmployee;
module.exports.deletePlayer = deletePlayer;
module.exports.editPlayer = editPlayer;
