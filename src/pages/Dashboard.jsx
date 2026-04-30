// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../axiosConfig";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // UI States
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFilter, setTaskFilter] = useState("All"); // NEW: Filter state

  // Form States
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    members: [],
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    projectId: "",
    assignedTo: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get("/projects"),
        axios.get("/tasks"),
        axios.get("/users"),
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  // --- ACTIONS ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/projects", newProject);
      setProjects([...projects, res.data]);
      setNewProject({ title: "", description: "", members: [] });
      setShowProjectForm(false);
      toast.success("Project created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tasks", newTask);
      fetchDashboardData();
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        projectId: "",
        assignedTo: "",
      });
      setShowTaskForm(false);
      toast.success("Task assigned successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(
        tasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error("Not authorized to update");
    }
  };

  // --- STATS & HELPERS ---
  const isOverdue = (dueDate, status) => {
    if (status === "Done") return false;
    return new Date(dueDate) < new Date();
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "Todo").length,
    doing: tasks.filter((t) => t.status === "Doing").length,
    done: tasks.filter((t) => t.status === "Done").length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
  };

  // NEW: Filter tasks based on the selected tab
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "All") return true;
    return task.status === taskFilter;
  });

  // --- SKELETON LOADER UI ---
  if (loadingData)
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="col-span-1 lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100 gap-4 transition-all hover:shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Workspace</h1>
          <p className="text-gray-500">
            Logged in as{" "}
            <span className="font-semibold text-gray-800">{user?.name}</span>{" "}
            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-indigo-700">
              {user?.role}
            </span>
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* DASHBOARD STATISTICS */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-gray-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-gray-500 font-medium">To Do</p>
          <p className="text-3xl font-bold text-gray-700">{stats.todo}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-yellow-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-gray-500 font-medium">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.doing}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-green-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm text-gray-500 font-medium">Done</p>
          <p className="text-3xl font-bold text-green-600">{stats.done}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4 shadow-sm border border-red-100 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-red-100">
          <p className="text-sm text-red-500 font-medium">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* PROJECTS COLUMN */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Projects</h2>
            {user?.role === "Admin" && (
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95"
              >
                {showProjectForm ? "Cancel" : "+ New Project"}
              </button>
            )}
          </div>

          {/* Create Project Form */}
          {showProjectForm && (
            <form
              onSubmit={handleCreateProject}
              className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3 animate-fade-in"
            >
              <input
                type="text"
                placeholder="Project Title"
                required
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                required
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Add Members
                </label>
                <select
                  multiple
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newProject.members}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setNewProject({ ...newProject, members: selected });
                  }}
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                Save Project
              </button>
            </form>
          )}

          {projects.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active projects.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="group rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md bg-white"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 mt-1">
                    {project.description}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 inline-block px-2 py-1 rounded">
                    Team Size: {project.members?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TASKS COLUMN */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Task Board</h2>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* NEW: Filter Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                {["All", "Todo", "Doing", "Done"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTaskFilter(tab)}
                    className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-md transition-all ${taskFilter === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {user?.role === "Admin" && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95"
                >
                  {showTaskForm ? "Cancel" : "+ Assign Task"}
                </button>
              )}
            </div>
          </div>

          {/* Create Task Form */}
          {showTaskForm && (
            <form
              onSubmit={handleCreateTask}
              className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in shadow-sm"
            >
              <input
                type="text"
                placeholder="Task Title"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              <div className="flex gap-2">
                <select
                  required
                  className="w-1/2 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input
                  type="date"
                  required
                  className="w-1/2 rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="Task Description"
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm md:col-span-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />

              <select
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newTask.projectId}
                onChange={(e) =>
                  setNewTask({ ...newTask, projectId: e.target.value })
                }
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <select
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newTask.assignedTo}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
              >
                <option value="">-- Assign To User --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 md:col-span-2"
              >
                Create & Assign Task
              </button>
            </form>
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-gray-300 bg-gray-50">
              <p className="text-sm font-medium text-gray-500">
                No tasks found for "{taskFilter}".
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div
                    key={task._id}
                    className={`group rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${overdue ? "border-red-400 bg-red-50/30 hover:border-red-500" : "border-gray-200 bg-white hover:border-indigo-300"}`}
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3
                          className={`font-bold text-sm leading-tight ${overdue ? "text-red-800" : "text-gray-900 group-hover:text-indigo-700 transition-colors"}`}
                        >
                          {task.title}
                        </h3>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task._id, e.target.value)
                          }
                          className={`shrink-0 cursor-pointer rounded border px-2 py-1 text-[10px] uppercase tracking-wider font-bold outline-none transition-colors ${task.status === "Done" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" : task.status === "Doing" ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
                        >
                          <option value="Todo">Todo</option>
                          <option value="Doing">Doing</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex gap-2 mb-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.priority === "High" ? "bg-orange-100 text-orange-700" : task.priority === "Medium" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-700">
                            {task.assignedTo?.name
                              ? task.assignedTo.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <p
                            className="text-xs font-medium text-gray-700 truncate max-w-[80px]"
                            title={task.assignedTo?.name}
                          >
                            {task.assignedTo?.name || "Unknown"}
                          </p>
                        </div>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider ${overdue ? "text-red-600 bg-red-100 px-1.5 py-0.5 rounded" : "text-gray-500"}`}
                        >
                          {new Date(task.dueDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
