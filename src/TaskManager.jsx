import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings } from 'lucide-react';

const TaskManager = () => {
  // 基础状态
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  
  // 番茄钟相关状态
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [customPomodoroTime, setCustomPomodoroTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  
  // Refs for timer
  const timerStartRef = useRef(null);
  const lastTickRef = useRef(null);

  // 加载保存的任务
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to load tasks:', e);
      }
    }

    const savedCompletedTasks = localStorage.getItem('completedTasks');
    if (savedCompletedTasks) {
      try {
        setCompletedTasks(JSON.parse(savedCompletedTasks));
      } catch (e) {
        console.error('Failed to load completed tasks:', e);
      }
    }
  }, []);

  // 保存任务到 localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  // 时钟更新
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 番茄钟计时器
  useEffect(() => {
    let timer;
    if (activeTaskId && pomodoroTime > 0) {
      if (!timerStartRef.current) {
        timerStartRef.current = Date.now();
        lastTickRef.current = Date.now();
      }

      timer = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        
        if (elapsed >= 1) {
          setPomodoroTime(prev => {
            const next = prev - elapsed;
            return next > 0 ? next : 0;
          });
          lastTickRef.current = now;
        }
      }, 100);
    } else if (pomodoroTime === 0 && activeTaskId) {
      completeTask(activeTaskId);
      setActiveTaskId(null);
      timerStartRef.current = null;
      lastTickRef.current = null;
    }

    return () => clearInterval(timer);
  }, [activeTaskId, pomodoroTime]);

  // 工具函数
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDayProgress = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return (totalMinutes / (24 * 60)) * 100;
  };

  // 任务管理函数
  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    
    if (trimmedTask) {
      const newTaskItem = {
        id: Date.now(),
        text: trimmedTask,
        startAt: null,
        endAt: null,
        createdAt: new Date()
      };
      
      setTasks(prev => [...prev, newTaskItem]);
      setNewTask('');
    }
  };

  const startPomodoro = (taskId) => {
    setActiveTaskId(taskId);
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, startAt: new Date() }
          : task
      )
    );
    setPomodoroTime(customPomodoroTime * 60);
    timerStartRef.current = Date.now();
    lastTickRef.current = Date.now();
  };

  const stopPomodoro = () => {
    setActiveTaskId(null);
    setPomodoroTime(customPomodoroTime * 60);
    timerStartRef.current = null;
    lastTickRef.current = null;
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const completedTask = {
        ...task,
        endAt: new Date(),
        completedAt: new Date()
      };
      
      setCompletedTasks(prev => [...prev, completedTask]);
      setTasks(prev => prev.filter(t => t.id !== taskId));

      if (activeTaskId === taskId) {
        stopPomodoro();
      }
    }
  };

  const deleteTask = (taskId) => {
    if (activeTaskId === taskId) {
      stopPomodoro();
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTimes = () => {
    const newPomodoro = Math.max(1, Math.min(60, customPomodoroTime));
    const newBreak = Math.max(1, Math.min(30, customBreakTime));
    
    setCustomPomodoroTime(newPomodoro);
    setPomodoroTime(newPomodoro * 60);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 时间设置 */}
      <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            value={customPomodoroTime}
            onChange={e => setCustomPomodoroTime(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
            className="px-4 py-2 border rounded-lg flex-1 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="专注时间（分钟）"
            min="1"
            max="60"
          />
          <input
            type="number"
            value={customBreakTime}
            onChange={e => setCustomBreakTime(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            className="px-4 py-2 border rounded-lg flex-1 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="休息时间（分钟）"
            min="1"
            max="30"
          />
          <button
            onClick={updateTimes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            <span>更新时间</span>
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
            <span className="text-2xl font-bold text-gray-800">今日进度</span>
          </div>
          <span className="text-3xl font-mono font-semibold text-blue-600">
            {time.toLocaleTimeString()}
          </span>
        </div>
        <div className="relative w-full h-4 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${getDayProgress()}%` }}
          />
        </div>
        <div className="mt-2 text-right text-sm text-blue-600 font-medium">
          {getDayProgress().toFixed(1)}%
        </div>
      </div>

      {/* 添加任务表单 */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-lg border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="添加新任务..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* 任务列表 */}
      <div className="space-y-4 mb-6">
        {tasks.map(task => (
          <div
            key={task.id}
            className="backdrop-blur-lg bg-white/70 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex-1 text-lg text-gray-700">{task.text}</span>
              <div className="flex items-center gap-3">
                {activeTaskId === task.id ? (
                  <div className="flex items-center gap-2 bg-red-50/70 backdrop-blur-sm px-4 py-2 rounded-lg animate-pulse">
                    <span className="text-lg font-mono font-semibold text-red-600">
                      {formatTime(pomodoroTime)}
                    </span>
                    <button
                      onClick={stopPomodoro}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startPomodoro(task.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => completeTask(task.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 已完成任务 */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">已完成任务</h2>
          {completedTasks.map(task => (
            <div
              key={task.id}
              className="backdrop-blur-lg bg-white/30 rounded-xl p-4 transition-all duration-300 hover:bg-white/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="line-through text-gray-500">{task.text}</span>
                <div className="flex gap-4 text-sm text-gray-400 font-mono">
                  {task.startAt && (
                    <span>
                      开始: {new Date(task.startAt).toLocaleTimeString()}
                    </span>
                  )}
                  {task.endAt && (
                    <span>
                      完成: {new Date(task.endAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManager;