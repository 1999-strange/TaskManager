import React, { useState, useEffect } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings } from 'lucide-react';

export const TaskManager = () => {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [customPomodoroTime, setCustomPomodoroTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);

  useEffect(() => {
    setTime(new Date());
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let timerId;
    if (activeTaskId && pomodoroTime > 0) {
      timerId = setInterval(() => {
        setPomodoroTime((time) => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && activeTaskId) {
      completeTask(activeTaskId);
      setActiveTaskId(null);
    }
    return () => clearInterval(timerId);
  }, [activeTaskId, pomodoroTime]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask, startAt: null, endAt: null },
      ]);
      setNewTask('');
    }
  };

  const startPomodoro = (taskId) => {
    setActiveTaskId(taskId);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].startAt = new Date();
    }
    setTasks([...tasks]);
    setPomodoroTime(customPomodoroTime * 60);
  };

  const stopPomodoro = () => {
    setActiveTaskId(null);
    setPomodoroTime(0);
  };

  const completeTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.endAt = new Date();
      setCompletedTasks([
        ...completedTasks,
        { ...task, completedAt: new Date() },
      ]);
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateCustomTimes = () => {
    setPomodoroTime(customPomodoroTime * 60);
    setBreakTime(customBreakTime * 60);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      {/* 时间设置 */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow-lg flex gap-4 items-center">
        <input
          type="number"
          value={customPomodoroTime}
          onChange={(e) => setCustomPomodoroTime(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg"
          placeholder="番茄钟时间（分钟）"
        />
        <input
          type="number"
          value={customBreakTime}
          onChange={(e) => setCustomBreakTime(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg"
          placeholder="休息时间（分钟）"
        />
        <button
          onClick={updateCustomTimes}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Settings className="inline w-5 h-5 mr-1" />
          更新时间
        </button>
      </div>

      {/* 时间进度条 */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg backdrop-blur-lg backdrop-filter">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">今日进度</span>
          </div>
          <span className="text-3xl font-mono font-semibold text-indigo-600">
            {time.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* 添加任务表单 */}
      <form onSubmit={addTask} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg transition-all duration-200"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all duration-200 font-semibold"
          >
            <Plus className="w-6 h-6" />
            添加
          </button>
        </div>
      </form>

      {/* 任务列表 */}
      <div className="mb-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">进行中的任务</h2>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <span className="flex-1 text-lg text-gray-700">{task.text}</span>
            <div className="flex items-center gap-3">
              {activeTaskId === task.id ? (
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                  <span className="text-lg font-mono font-semibold text-red-600">
                    {formatTime(pomodoroTime)}
                  </span>
                  <button
                    onClick={stopPomodoro}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startPomodoro(task.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => completeTask(task.id)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 已完成任务 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">已完成的任务</h2>
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-gray-50 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all duration-200"
          >
            <span className="flex-1 line-through text-gray-500 text-lg">
              {task.text}
            </span>
            <span className="text-sm text-gray-400 font-mono">
              开始: {task.startAt?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) || '无'}
            </span>
            <span className="text-sm text-gray-400 font-mono">
              完成: {task.endAt?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) || '无'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
