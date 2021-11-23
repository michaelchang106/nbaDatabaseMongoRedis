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
  console.log("Connected to server");

  //Connect to collection
  const db = await client.db(dbName);
  const collection = await db.collection(documents);
  console.log("collection => ", documents);

  return { collection, client };
};

const getGames = async () => {
  let connectedCollection;

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;
    const query = {};
    const res = await collection.find(query);
    return res;
  } catch (error) {
    console.log("ERROR--", error);
  } 
  // finally {
  //   await connectedCollection.client.close();
  // }
};

const getSingleGame = async (gameID) => {
  let connectedCollection;

  const query = { _id: gameID };

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    const res = await collection.find(query);

    return res;
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

const getTeams = async () => {
  let connectedCollection;

  const field = "homeTeam";
  const query = {};

  try {
    connectedCollection = await collectionConnect("Games");
    const collection = connectedCollection.collection;

    const res = await collection.distinct(field, query);

    return res;
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

module.exports = {
  getGames,
  getSingleGame,
  getTeams,
};
