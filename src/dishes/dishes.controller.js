const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const dish = dishes.find((dish) => dish.id === dishId);
  if (dish) {
    res.locals.dish = dish;
    return next();
  } else {
    next({
      status: 404,
      message: `There is no dish with id: ${dishId}`,
    });
  }
}

function readDish(req, res, next) {
  res.json({ data: res.locals.dish });
}

function isValidDish(req, res, next) {
  const requiredFields = ["name", "description", "price", "image_url"];
  const dishId = req.params.dishId;
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `Dish must include a ${field}`,
      });
    }
    if (!req.body.data.id) {
      req.body.data.id = dishId;
    }
    if (req.body.data.id !== dishId) {
      return next({
        status: 400,
        message: `data.id: ${req.body.data.id} does not match :dishId ${dishId}`,
      });
    }
    if (typeof req.body.data.price !== "number") {
      return next({
        status: 400,
        message: "price is not a number",
      });
    }
    if (req.body.data.price < 0) {
      return next({
        status: 400,
        message: `Field must have a price greater than zero`,
      });
    }
  }
  next();
}
function create(req, res, next) {
  const { data: { name, price, description, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    price,
    description,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function update(req, res, next) {
  let dish = res.locals.dish;
  const originalDish = dish;
  if (originalDish !== req.body.data) {
    dish = req.body.data;
    res.json({ data: dish });
  }
}

function methodNotAllowed(req, res, next) {
  return next({
    status: 405,
    message: "Method not allowed",
  });
}

module.exports = {
  list,
  create: [isValidDish, create],
  showDish: [dishExists, readDish],
  update: [dishExists, isValidDish, update],
  methodNotAllowed,
};
