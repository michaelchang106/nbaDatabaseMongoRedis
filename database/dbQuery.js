//DANIEL LISKO

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

    console.log("Connected to ", collectionName);
    const collection = connectedCollection.collection;
    const res = await collection.aggregate(agg).toArray();

    return res;
  } catch (error) {
    console.log("ERROR--", error);
  } finally {
    await connectedCollection.client.close();
  }
};

let agg = [
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
  console.log("Getting the max, min and average height of each team");
  const heightQuery = await mongoQuery(agg, "Employees");

  await heightQuery.forEach((team) => {
    console.log(
      `\n\nTeam: ${team._id} \nMax Height: ${team.maxHeight} | Smallest Height: ${team.shortestHeight} | Average Height: ${team.avgHeight}`
    );
  });

  // //Query 2
  // //To find the Name of the Tallest Person on each team
  agg = [
    {
      $project: {
        team: "$team.teamName",
        fullName: {
          $concat: ["$firstName", " ", "$lastName"],
        },
        height: "$attributes.height",
      },
    },
    {
      $sort: {
        height: -1,
      },
    },
    {
      $group: {
        _id: "$team",
        tallestPerson: {
          $first: "$fullName",
        },
        height: {
          $first: "$height",
        },
      },
    },
    {
      $sort: {
        height: -1,
      },
    },
  ];

  const tallestTeamMember = await mongoQuery(agg, "Employees");
  console.log("\n\n\nGetting the tallest player from each team");
  await tallestTeamMember.forEach((team) => {
    const ft = Math.floor(team.height / 12);
    const inches = team.height % 12;
    console.log(
      `Team: ${team._id} \n${team.tallestPerson} | Height: ${ft}' ${inches}''\n`
    );
  });

  // //Query3
  // //Get the count for the top 10 most populat jersey numbers
  agg = [
    {
      $match: {
        employeeType: "player",
      },
    },
    {
      $group: {
        _id: "$jerseyNum",
        jerseyNumPopularity: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        jerseyNumPopularity: -1,
      },
    },
    {
      $project: {
        _id: 0,
        jerseyNumPopularity: 1,
        jerseyNum: "$_id",
      },
    },
    {
      $limit: 10,
    },
  ];

  const mostPopularJersey = await mongoQuery(agg, "Employees");
  console.log("\n\n\nGetting the 10 most popular jerseys in the NBA");
  mostPopularJersey.forEach((jersey, i) => {
    console.log(
      `${i + 1}) Jersey #: ${jersey.jerseyNum} | Popularity: ${
        jersey.jerseyNumPopularity
      }`
    );
  });

  //Query 4
  //Find the most common positions in the NBA
  agg = [
    {
      $unwind: {
        path: "$positionDesc",
      },
    },
    {
      $group: {
        _id: "$positionDesc",
        PositionCount: {
          $count: {},
        },
      },
    },
  ];

  const commonPosition = await mongoQuery(agg, "Employees");
  console.log("\n\n\nPositions Count");
  commonPosition.forEach((position) => {
    let fullName;
    if (position._id === "F") {
      fullName = "Forward";
    } else if (position._id === "C") {
      fullName = "Center";
    } else {
      fullName = "Guard";
    }
    console.log(`${fullName} | Count: ${position.PositionCount}`);
  });

  // //Query 5
  // //Create and isInjuried field defaulted to false
  // //and then sets all players who plays "C"
  // //and has the jersey number 11 as isInjured to to true
  const beforeInjury = [
    {
      $addFields: {
        isInjuried: false,
      },
    },
    {
      $match: {
        positionDesc: {
          $all: ["C"],
        },
        jerseyNum: 11,
      },
    },
  ];

  const afterInjury = [
    {
      $addFields: {
        isInjuried: false,
      },
    },
    {
      $match: {
        positionDesc: {
          $all: ["C"],
        },
        jerseyNum: 11,
      },
    },
    {
      $set: {
        isInjuried: true,
      },
    },
  ];

  const before = await mongoQuery(beforeInjury, "Employees");
  const after = await mongoQuery(afterInjury, "Employees");
  console.log("\n\nChange Injury Status");
  for (let i = 0; i < before.length; i++) {
    console.log(
      `Before: ${before[i].firstName} ${before[i].lastName} | Injured? ${before[i].isInjuried}`
    );
    console.log(
      `After: ${after[i].firstName} ${after[i].lastName} | Injured? ${after[i].isInjuried}\n`
    );
  }
};

main();
