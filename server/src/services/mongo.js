const mongoose = require("mongoose");

const MONGO_URL =
  "mongodb+srv://sehgallavish5_db_user:21%2FSept%2F2005@nasacluster.lvfdqoc.mongodb.net/?appName=NASAcluster";

mongoose.connection.once("open", () => {
  console.log("✅connected to mongoDB");
});
mongoose.connection.on("error", (err) => {
  console.log(`❌ ${err}`);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

module.exports = { mongoConnect };
