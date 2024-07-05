const db = require("../models");
const winston = require('winston');
const prom = require('prom-client');
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

const requestCounter = new prom.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "status_code"],
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    requestCounter.inc({ method: req.method, status_code: 400 });
    logger.error("Content can not be empty!");
    return;
  }

  // Create a Tutorial
  const tutorial = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false
  };

  // Save Tutorial in the database
  Tutorial.create(tutorial)
    .then(data => {
      res.status(201).send(data);
      logger.info("Tutorial created successfully.");
      requestCounter.inc({ method: req.method, status_code: 201 });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Tutorial.findAll({ where: condition })
    .then(data => {
      res.status(200).send(data);
      logger.info("Tutorials retrieved successfully.");
      requestCounter.inc({ method: req.method, status_code: 200 });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
      requestCounter.inc({ method: req.method, status_code: 500 });
      logger.error(err.message);
    });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      if (data) {
        res.status(200).send(data);
        logger.info("Tutorial retrieved successfully.");
        requestCounter.inc({ method: req.method, status_code: 200 });
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
        logger.error(`Cannot find Tutorial with id=${id}.`);
        requestCounter.inc({ method: req.method, status_code: 404 });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Tutorial.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.status(204).send({
          message: "Tutorial was updated successfully."
        });
        requestCounter.inc({ method: req.method, status_code: 204 });
        logger.info("Tutorial updated successfully.");
      } else {
        res.status(404).send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
        });
        logger.error(`Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`);
        requestCounter.inc({ method: req.method, status_code: 404 });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Tutorial.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.status(204).send({
          message: "Tutorial was deleted successfully!"
        });
        logger.info("Tutorial deleted successfully.");
        requestCounter.inc({ method: req.method, status_code: 204 });
      } else {
        res.status(404).send({
          message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
        });
        logger.error(`Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`);
        requestCounter.inc({ method: req.method, status_code: 404 });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.status(204).send({ message: `${nums} Tutorials were deleted successfully!` });
      logger.info(`${nums} Tutorials were deleted successfully!`);
      requestCounter.inc({ method: req.method, status_code: 204 });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};

// find all published Tutorial
exports.findAllPublished = (req, res) => {
  Tutorial.findAll({ where: { published: true } })
    .then(data => {
      res.status(200).send(data);
      logger.info("Published tutorials retrieved successfully.");
      requestCounter.inc({ method: req.method, status_code: 200 });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
      logger.error(err.message);
      requestCounter.inc({ method: req.method, status_code: 500 });
    });
};
