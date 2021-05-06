const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function isOrderValid(req, res, next) {
  const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  const orderId = req.params.orderId;
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      next({
        status: 400,
        message: `Order must include a ${field}`,
      });
      return;
    }
  }
  if (!req.body.data.id) {
    req.body.data.id = orderId;
  }
  if (req.body.data.id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orderId}`,
    });
  }

  if (req.body.data.status === "delivered") {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  }
  return next();
}

function checkStatus(req, res, next) {
  if (!req.body.data.status) {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }

  if (
    req.body.data.status !== "delivered" &&
    req.body.data.status !== "out-for-delivery" &&
    req.body.data.status !== "pending"
  ) {
    return next({
      status: 400,
      message: `Invalid delivery status: ${req.body.data.status}`,
    });
  }
  return next();
}

function areDishesValid(req, res, next) {
  if (!req.body.data.dishes) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  if (!req.body.data.dishes.length) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  if (!Array.isArray(req.body.data.dishes)) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  for (let dish of req.body.data.dishes) {
    if (!dish.quantity) {
      return next({
        status: 400,
        message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
      });
    }
    if (typeof dish["quantity"] !== "number") {
      return next({
        status: 400,
        message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
      });
    }
    if (dish.quantity === 0) {
      return next({
        status: 400,
        message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function create(req, res, next) {
  const { data: { deliverTo, status, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const order = orders.find((order) => order.id === orderId);
  if (order) {
    res.locals.order = order;
    return next();
  } else {
    return next({
      status: 404,
      message: `There is no order with id: ${orderId}`,
    });
  }
}
function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res, next) {
  const originalOrder = res.locals.order;
  let order = originalOrder;
  if (originalOrder !== req.body.data) {
    order = req.body.data;
  }
  res.json({ data: order });
}

function list(req, res, next) {
  res.json({ data: orders });
}

function destroy(req, res, next) {
  if (res.locals.order.status === "pending") {
    const index = orders.findIndex((order) => order.id === res.locals.order.id);
    orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    return next({
      status: 400,
      message: "Order status is not pending",
    });
  }
}
module.exports = {
  create: [areDishesValid, isOrderValid, create],
  read: [orderExists, read],
  update: [orderExists, areDishesValid, isOrderValid, checkStatus, update],
  delete: [orderExists, destroy],
  list,
};
