const express = require("express");
const cors = require("cors");
const prom = require('prom-client');
const winston = require('winston');

const collectDefaultMetrics = prom.collectDefaultMetrics();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const app = express();

var corsOptions = {
  origin: process.env.CORS 
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
  logger.info("Welcome to bezkoder application.");
});

app.get('/api/metrics', async (req, res) => {
  try {
      res.set('Content-Type', prom.register.contentType);
      res.end(await prom.register.metrics());
      logger.debug("Metrics requested.");
  } 
  catch (ex) {
      res.status(500).end(ex);
      logger.error("Metrics request failed: " + ex.message);
  }
});

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
