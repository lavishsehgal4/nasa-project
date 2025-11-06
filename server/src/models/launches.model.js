const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
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

async function existsLaunchWithId(launchId) {
  return await launches.findOne({ flightNumber: launchId });
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
  const palnet = planets.findOne({ keplerName: launch.target });
  if (!palnet) {
    throw new Error("no matching planet found");
  }
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
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
