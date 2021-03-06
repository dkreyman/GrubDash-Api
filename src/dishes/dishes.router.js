const router = require("express").Router();
const controller = require("./dishes.controller");

// TODO: Implement the /dishes routes needed to make the tests pass

router.route("/").get(controller.list).post(controller.create);
router
  .route("/:dishId")
  .get(controller.showDish)
  .put(controller.update)
  .delete(controller.methodNotAllowed);

module.exports = router;
