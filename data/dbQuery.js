const { MongoClient } = require("mongodb");

//Helper function to connec to the database and collection locally
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

//Query 1
//Get the avgerage height, the tallest height, and shortest height for each team.
const mongoQuery = async (agg, collectionName) => {
  let connectedCollection;
  try {
    connectedCollection = await collectionConnect(collectionName);
    const collection = connectedCollection.collection;
    const res = await collection.aggregate(agg);
    return res;
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

const agg = [
  {
    $match: {
      employeeType: "player",
    },
  },
  {
    $group: {
      _id: "$team.teamName",
      maxHeight: {
        $max: "$attributes.height",
      },
      shortestHeight: {
        $min: "$attributes.height",
      },
      avgHeight: {
        $avg: "$attributes.height",
      },
    },
  },
];

const main = async () => {
  console.log("Getting the max, min and average height ofr each team");
  const heightQuery = await mongoQuery(agg, "Employees");

  console.log("--->", heightQuery);
};

main();
// //Query 2
// //To find the Name of the Tallest Person on each team
// agg = [
//   {
//     $project: {
//       team: "$team.teamName",
//       fullName: {
//         $concat: ["$firstName", " ", "$lastName"],
//       },
//       height: "$attributes.height",
//     },
//   },
//   {
//     $sort: {
//       height: -1,
//     },
//   },
//   {
//     $group: {
//       _id: "$team",
//       tallestPerson: {
//         $first: "$fullName",
//       },
//       height: {
//         $first: "$height",
//       },
//     },
//   },
//   {
//     $sort: {
//       height: -1,
//     },
//   },
// ];

// //Query3
// //Get the count for the top 10 most populat jersey numbers
// agg = [
//   {
//     $match: {
//       employeeType: "player",
//     },
//   },
//   {
//     $group: {
//       _id: "$jerseyNum",
//       jerseyNumPopularity: {
//         $sum: 1,
//       },
//     },
//   },
//   {
//     $sort: {
//       jerseyNumPopularity: -1,
//     },
//   },
//   {
//     $project: {
//       _id: 0,
//       jerseyNumPopularity: 1,
//       jerseyNum: "$_id",
//     },
//   },
//   {
//     $limit: 10,
//   },
// ];

// //Query 4
// //Find the most common positions in the NBA
// agg = [
//   {
//     $unwind: {
//       path: "$positionDesc",
//     },
//   },
//   {
//     $group: {
//       _id: "$positionDesc",
//       PositionCount: {
//         $count: {},
//       },
//     },
//   },
// ];

// //Query 5
// //Create and isInjuried field defaulted to false
// //and then sets all players who plays "C"
// //and has the jersey number 11 as isInjured to to true
// agg = [
//   {
//     $addFields: {
//       isInjuried: false,
//     },
//   },
//   {
//     $match: {
//       positionDesc: {
//         $all: ["C"],
//       },
//       jerseyNum: 11,
//     },
//   },
//   {
//     $set: {
//       isInjuried: true,
//     },
//   },
// ];
