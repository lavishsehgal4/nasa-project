const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");

const PORT = 8000;
const MONGO_URL =
  "mongodb+srv://sehgallavish5_db_user:21%2FSept%2F2005@nasacluster.lvfdqoc.mongodb.net/?appName=NASAcluster";
const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("✅connected to mongoDB");
});
mongoose.connection.on("error", (err) => {
  console.log(`❌ ${err}`);
});
async function startServer() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}...`);
  });
}

startServer();
