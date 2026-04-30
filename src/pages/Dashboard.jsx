import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // NEW: Store all users
  const [loadingData, setLoadingData] = useState(true);

  // Form States
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] });
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '' 
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get('/projects'),
        axios.get('/tasks'),
        axios.get('/users') // Fetch users for our dropdowns
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  // --- ACTIONS ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/projects', newProject);
      setProjects([...projects, res.data]);
      setNewProject({ title: '', description: '', members: [] });
      setShowProjectForm(false);
      toast.success('Project created!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/tasks', newTask);
      // Fetch fresh data so the UI gets the populated project/user names
      fetchDashboardData(); 
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', projectId: '', assignedTo: '' });
      setShowTaskForm(false);
      toast.success('Task assigned successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(task => task._id === taskId ? { ...task, status: newStatus } : task));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Not authorized to update');
    }
  };

  // --- STATS & HELPERS ---
  const isOverdue = (dueDate, status) => {
    if (status === 'Done') return false;
    return new Date(dueDate) < new Date();
  };

  // Calculate Dashboard Statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'Todo').length,
    doing: tasks.filter(t => t.status === 'Doing').length,
    done: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length
  };

  if (loadingData) return <div className="p-10 text-center text-xl text-gray-600">Loading your workspace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Workspace</h1>
          <p className="text-gray-500">Logged in as {user?.name} <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{user?.role}</span></p>
        </div>
        <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Logout
        </button>
      </div>

      {/* DASHBOARD STATISTICS */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-gray-400">
          <p className="text-sm text-gray-500 font-medium">To Do</p>
          <p className="text-3xl font-bold text-gray-700">{stats.todo}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-yellow-400">
          <p className="text-sm text-gray-500 font-medium">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.doing}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 text-center border-b-4 border-b-green-400">
          <p className="text-sm text-gray-500 font-medium">Done</p>
          <p className="text-3xl font-bold text-green-600">{stats.done}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4 shadow-sm border border-red-100 text-center">
          <p className="text-sm text-red-500 font-medium">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* PROJECTS COLUMN */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Projects</h2>
            {user?.role === 'Admin' && (
              <button onClick={() => setShowProjectForm(!showProjectForm)} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700">
                {showProjectForm ? 'Cancel' : '+ New Project'}
              </button>
            )}
          </div>

          {/* Create Project Form */}
          {showProjectForm && (
            <form onSubmit={handleCreateProject} className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
              <input type="text" placeholder="Project Title" required className="w-full rounded border border-gray-300 p-2 text-sm" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
              <textarea placeholder="Description" required className="w-full rounded border border-gray-300 p-2 text-sm" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Add Members</label>
                <select multiple className="w-full rounded border border-gray-300 p-2 text-sm h-24" value={newProject.members} onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setNewProject({...newProject, members: selected});
                }}>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <button type="submit" className="w-full rounded bg-indigo-600 py-2 text-sm font-bold text-white hover:bg-indigo-700">Save Project</button>
            </form>
          )}
          
          {projects.length === 0 ? <p className="text-sm text-gray-500">No projects found.</p> : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project._id} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{project.description}</p>
                  <p className="text-xs font-medium text-indigo-600">Members: {project.members?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TASKS COLUMN */}
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Task Board</h2>
             {user?.role === 'Admin' && (
              <button onClick={() => setShowTaskForm(!showTaskForm)} className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700">
                {showTaskForm ? 'Cancel' : '+ Assign Task'}
              </button>
            )}
          </div>

          {/* Create Task Form */}
          {showTaskForm && (
            <form onSubmit={handleCreateTask} className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Task Title" required className="w-full rounded border border-gray-300 p-2 text-sm" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              
              <div className="flex gap-2">
                <select required className="w-1/2 rounded border border-gray-300 p-2 text-sm" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input type="date" required className="w-1/2 rounded border border-gray-300 p-2 text-sm" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>

              <textarea placeholder="Task Description" required className="w-full rounded border border-gray-300 p-2 text-sm md:col-span-2" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              
              <select required className="w-full rounded border border-gray-300 p-2 text-sm" value={newTask.projectId} onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}>
                <option value="">-- Select Project --</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>

              <select required className="w-full rounded border border-gray-300 p-2 text-sm" value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}>
                <option value="">-- Assign To User --</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>

              <button type="submit" className="w-full rounded bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 md:col-span-2">Create & Assign Task</button>
            </form>
          )}

          {tasks.length === 0 ? <p className="text-sm text-gray-500">No assigned tasks.</p> : (
             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div key={task._id} className={`rounded-lg border p-4 shadow-sm flex flex-col justify-between ${overdue ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className={`font-semibold text-sm ${overdue ? 'text-red-700' : 'text-gray-900'}`}>{task.title}</h3>
                        <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} className={`cursor-pointer rounded border px-2 py-1 text-xs font-bold outline-none ${task.status === 'Done' ? 'bg-green-100 text-green-700' : task.status === 'Doing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          <option value="Todo">Todo</option>
                          <option value="Doing">Doing</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      
                      <div className="flex gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-100/50">
                      <p className="text-xs text-gray-500 mb-1">Assigned: <span className="font-medium text-gray-800">{task.assignedTo?.name || 'Unknown'}</span></p>
                      <p className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()} {overdue && ' (OVERDUE)'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;