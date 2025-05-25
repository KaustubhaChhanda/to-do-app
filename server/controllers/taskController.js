const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      order: 1,
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, completed } = req.body;
    
    const lastTask = await Task.findOne({ user: req.user.id }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;
    
    const newTask = new Task({
      title,
      completed,
      order,
      user: req.user.id,
    });
    
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: "Failed to create task: " + error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...req.body, user: req.user.id },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await Task.findByIdAndDelete(id);
    
    const remainingTasks = await Task.find({ user: req.user.id }).sort({ order: 1 });
    for (let i = 0; i < remainingTasks.length; i++) {
      await Task.findByIdAndUpdate(remainingTasks[i]._id, { order: i });
    }
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
