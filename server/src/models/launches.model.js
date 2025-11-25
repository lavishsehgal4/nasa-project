const { route } = require("../app");
const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
const DEFAULT_LAUNCH_NUMBER = 100;
const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};
saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("loading spaceX data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("Problem downlaoding lauch data");
    throw new Error("launch data download fail");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers,
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
    };
    console.log(launch.flightNumber, launch.rocket);

    await saveLaunch(launch);
  }
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "Falconsat",
  });
  if (firstLaunch) {
    console.log("launch data already loaded");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}
async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getAllLaunches() {
  return await launches.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}
async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_LAUNCH_NUMBER;
  }
  return latestLaunch.flightNumber;
}
async function addNewLaunch(launch) {
  const palnet = await planets.findOne({ keplerName: launch.target });
  if (!palnet) {
    throw new Error("no matching planet found");
  }
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
