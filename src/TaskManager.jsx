import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings } from 'lucide-react';

const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_BREAK_TIME = 5;
const MAX_POMODORO_TIME = 60;
const MAX_BREAK_TIME = 30;

const TaskManager = () => {
  // Core states
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  
  // Pomodoro states
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(DEFAULT_POMODORO_TIME * 60);
  const [customPomodoroTime, setCustomPomodoroTime] = useState(DEFAULT_POMODORO_TIME);
  const [customBreakTime, setCustomBreakTime] = useState(DEFAULT_BREAK_TIME);
  
  // Timer refs
  const timerStartRef = useRef(null);
  const lastTickRef = useRef(null);

  // Load saved tasks from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
        
        if (savedCompletedTasks) {
          setCompletedTasks(JSON.parse(savedCompletedTasks));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer
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
      resetTimer();
    }

    return () => clearInterval(timer);
  }, [activeTaskId, pomodoroTime]);

  // Utility functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getDayProgress = useCallback(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return (totalMinutes / (24 * 60)) * 100;
  }, []);

  const resetTimer = useCallback(() => {
    setActiveTaskId(null);
    setPomodoroTime(customPomodoroTime * 60);
    timerStartRef.current = null;
    lastTickRef.current = null;
  }, [customPomodoroTime]);

  // Task management functions
  const handleAddTask = useCallback((e) => {
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
  }, [newTask]);

  const startPomodoro = useCallback((taskId) => {
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
  }, [customPomodoroTime]);

  const completeTask = useCallback((taskId) => {
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
        resetTimer();
      }
    }
  }, [tasks, activeTaskId, resetTimer]);

  const deleteTask = useCallback((taskId) => {
    if (activeTaskId === taskId) {
      resetTimer();
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, [activeTaskId, resetTimer]);

  const handlePomodoroTimeChange = useCallback((e) => {
    const value = e.target.value;
    if (value === '') {
      setCustomPomodoroTime('');
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setCustomPomodoroTime(Math.max(1, Math.min(MAX_POMODORO_TIME, numValue)));
      }
    }
  }, []);

  const handleBreakTimeChange = useCallback((e) => {
    const value = e.target.value;
    if (value === '') {
      setCustomBreakTime('');
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        setCustomBreakTime(Math.max(1, Math.min(MAX_BREAK_TIME, numValue)));
      }
    }
  }, []);

  const updateTimes = useCallback(() => {
    const pomodoroValue = customPomodoroTime === '' ? DEFAULT_POMODORO_TIME : customPomodoroTime;
    const breakValue = customBreakTime === '' ? DEFAULT_BREAK_TIME : customBreakTime;
    
    const newPomodoro = Math.max(1, Math.min(MAX_POMODORO_TIME, pomodoroValue));
    const newBreak = Math.max(1, Math.min(MAX_BREAK_TIME, breakValue));
    
    setCustomPomodoroTime(newPomodoro);
    setCustomBreakTime(newBreak);
    setPomodoroTime(newPomodoro * 60);
  }, [customPomodoroTime, customBreakTime]);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Time settings */}
      <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="number"
            value={customPomodoroTime}
            onChange={handlePomodoroTimeChange}
            className="px-4 py-2 border rounded-lg flex-1 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Focus time (minutes)"
            min="1"
            max={MAX_POMODORO_TIME}
          />
          <input
            type="number"
            value={customBreakTime}
            onChange={handleBreakTimeChange}
            className="px-4 py-2 border rounded-lg flex-1 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Break time (minutes)"
            min="1"
            max={MAX_BREAK_TIME}
          />
          <button
            onClick={updateTimes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            <span>Update Time</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
            <span className="text-2xl font-bold text-gray-800">Daily Progress</span>
          </div>
          <span className="text-3xl font-mono font-semibold text-blue-600">
            {time.toLocaleTimeString()}
          </span>
        </div>
        <div className="relative w-full">
          {/* Progress bar */}
          <div className="relative w-full h-4 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${getDayProgress()}%` }}
            />
          </div>
          
          {/* Time markers */}
          <div className="relative w-full h-6 mt-1">
            {[6, 9, 12, 15, 18, 21].map(hour => {
              const percentage = (hour / 24) * 100;
              return (
                <div
                  key={hour}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${percentage}%` }}
                >
                  <div className="h-2 w-0.5 bg-gray-300" />
                  <span className="text-xs text-gray-500">
                    {hour === 12 ? '12pm' : hour > 12 ? `${hour}pm` : `${hour}am`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Percentage display */}
          <div className="mt-2 text-right text-sm text-blue-600 font-medium">
            {getDayProgress().toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-lg border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Add new task..."
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

      {/* Task list */}
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
                      onClick={resetTimer}
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

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Completed Tasks</h2>
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
                      Started: {new Date(task.startAt).toLocaleTimeString()}
                    </span>
                  )}
                  {task.endAt && (
                    <span>
                      Finished: {new Date(task.endAt).toLocaleTimeString()}
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