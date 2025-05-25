const express = require("express");
const requireAuth = require("../middleware/authMiddleware.js");

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController.js");

const router = express.Router();
router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
