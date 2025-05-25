import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Todo.css";

export default function Todo() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setIsAdding(true);
      setIsDeleting(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch tasks");
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsAdding(false);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleAdd = async () => {
    if (!newTask.trim()) return;

    try {
      setIsAdding(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTask }),
      });
      if (!res.ok) {
        throw new Error("Failed to add task");
      }
      const data = await res.json();
      setTasks([data, ...tasks]);
      setNewTask("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      setIsDeleting(true);
      setError(null);
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      setIsUpdating(true);
      setError(null);
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) {
        throw new Error("Failed to update task");
      }
      const updatedTask = await res.json();
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const moveTask = async (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tasks.length - 1)
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      
      const newTasks = [...tasks];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      const task1 = newTasks[index];
      const task2 = newTasks[newIndex];
      const [res1, res2] = await Promise.all([
        fetch(`http://localhost:5000/api/tasks/${task1._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order: newIndex }),
        }),
        fetch(`http://localhost:5000/api/tasks/${task2._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order: index }),
        })
      ]);
      
      if (!res1.ok || !res2.ok) {
        throw new Error("Failed to update task order");
      }
      
      [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
      setTasks(newTasks);
    } catch (err) {
      setError(err.message);
      fetchTasks();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>Your Tasks</h1>
      </div>
      <form className="todo-form" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
        <input
          className="todo-input"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Task"
          disabled={isAdding}
        />
        <button className="todo-button" type="submit" disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </button>
      </form>
      {error && <p className="auth-error">{error}</p>}
      <ul className="todo-list">
        {tasks.map((task, index) => (
          <li key={task._id} className="todo-item">
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={task.completed}
              onChange={() => handleToggleComplete(task._id, task.completed)}
              disabled={isUpdating}
            />
            <span className={`todo-text ${task.completed ? "completed" : ""}`}>
              {task.title}
            </span>
            <div className="todo-actions">
              <button
                className="todo-move"
                onClick={() => moveTask(index, "up")}
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                className="todo-move"
                onClick={() => moveTask(index, "down")}
                disabled={index === tasks.length - 1}
              >
                ↓
              </button>
              <button
                className="todo-delete"
                onClick={() => handleDelete(task._id)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
