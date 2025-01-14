import React, { useState, useEffect } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings } from 'lucide-react';

export const TaskManager = () => {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedCompletedTasks = localStorage.getItem('completedTasks');
    return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : [];
  });
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [customPomodoroTime, setCustomPomodoroTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);

  // 检查是否需要清空任务
  const checkAndClearTasks = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 在午夜 00:00 时清空任务
    if (hours === 0 && minutes === 0) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 将当前任务移动到已完成，并标记为自动完成
      const tasksToComplete = tasks.map(task => ({
        ...task,
        endAt: now,
        completedAt: now,
        autoCompleted: true
      }));
      
      setCompletedTasks(prev => [...prev, ...tasksToComplete]);
      setTasks([]);
      
      // 可以选择性地保留最近7天的已完成任务
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      setCompletedTasks(prev => 
        prev.filter(task => new Date(task.completedAt) > sevenDaysAgo)
      );
    }
  };

  useEffect(() => {
    setTime(new Date());
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now);
      checkAndClearTasks();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [tasks]);

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

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTasks = [
        ...tasks,
        { id: Date.now(), text: newTask, startAt: null, endAt: null },
      ];
      setTasks(newTasks);
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

  // 计算一天的进度百分比
  const getDayProgress = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return (totalMinutes / (24 * 60)) * 100;
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto bg-blue-50 min-h-screen">
      {/* 时间设置 */}
      <div className="mb-6 p-4 md:p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            value={customPomodoroTime}
            onChange={(e) => setCustomPomodoroTime(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg flex-1"
            placeholder="番茄钟时间（分钟）"
          />
          <input
            type="number"
            value={customBreakTime}
            onChange={(e) => setCustomBreakTime(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg flex-1"
            placeholder="休息时间（分钟）"
          />
          <button
            onClick={updateCustomTimes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="inline w-5 h-5 mr-1" />
            更新时间
          </button>
        </div>
      </div>

      {/* 时间进度条 */}
      <div className="mb-8 p-4 md:p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">今日进度</span>
          </div>
          <span className="text-3xl font-mono font-semibold text-blue-600">
            {time.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </span>
        </div>
        <div className="relative w-full h-4 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${getDayProgress()}%` }}
          />
        </div>
        <div className="mt-2 text-right text-sm text-blue-600 font-medium">
          {getDayProgress().toFixed(1)}%
        </div>
      </div>

      {/* 添加任务表单 */}
      <form onSubmit={addTask} className="mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors font-semibold"
          >
            <Plus className="w-6 h-6" />
            <span>添加</span>
          </button>
        </div>
      </form>

      {/* 任务列表 */}
      <div className="mb-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">进行中的任务</h2>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startPomodoro(task.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => completeTask(task.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            className="p-4 bg-blue-50 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:bg-blue-100 transition-all"
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="line-through text-gray-500 text-lg">
                {task.text}
              </span>
              {task.autoCompleted && (
                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">自动结束</span>
              )}
            </div>
            <div className="flex gap-4 text-sm text-gray-400 font-mono">
              <span>
                开始: {task.startAt ? new Date(task.startAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无'}
              </span>
              <span>
                完成: {task.endAt ? new Date(task.endAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;