import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings, Calendar, ChevronDown, ChevronUp, BarChart, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_BREAK_TIME = 5;
const MAX_POMODORO_TIME = 60;
const MAX_BREAK_TIME = 30;

const TaskManager = () => {
  // Custom Tailwind animations
  const customStyles = document.createElement('style');
  customStyles.textContent = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient-slow {
      background-size: 200% 200%;
      animation: gradient 15s ease infinite;
    }
    .animate-spin-slow {
      animation: spin 3s linear infinite;
    }
    .animate-pulse-slow {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes scale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .hover-scale {
      transition: transform 0.3s ease;
    }
    .hover-scale:hover {
      transform: scale(1.02);
    }
  `;
  document.head.appendChild(customStyles);

  // Core states
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [timerAlertMessage, setTimerAlertMessage] = useState('');
  const [completedTaskMessage, setCompletedTaskMessage] = useState('');
  const [error, setError] = useState(null);
  
  // Pomodoro states
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(DEFAULT_POMODORO_TIME * 60);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME * 60);
  const [customPomodoroTime, setCustomPomodoroTime] = useState(DEFAULT_POMODORO_TIME);
  const [customBreakTime, setCustomBreakTime] = useState(DEFAULT_BREAK_TIME);
  
  // Timer refs
  const timerStartRef = useRef(null);
  const lastTickRef = useRef(null);

  // Statistics
  const [stats, setStats] = useState({
    totalTasksCompleted: 0,
    totalPomodoroTime: 0,
    todayTasksCompleted: 0,
    weekTasksCompleted: 0
  });

  // Utility functions
  const getDayProgress = useCallback(() => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    return (totalMinutes / (24 * 60)) * 100;
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDateTime = useCallback((date) => {
    return new Date(date).toLocaleString();
  }, []);

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        const savedStats = localStorage.getItem('taskStats');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
        if (savedStats) setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading saved data:', error);
        setError('Failed to load saved data');
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const saveData = () => {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
        localStorage.setItem('taskStats', JSON.stringify(stats));
      } catch (error) {
        console.error('Error saving data:', error);
        setError('Failed to save data');
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [tasks, completedTasks, stats]);

  // Clock update
  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().catch(error => {
        console.error('Error requesting notification permission:', error);
        setError('Unable to request notification permission');
      });
    }
  }, []);

  // Pomodoro timer with improved accuracy
  useEffect(() => {
    if (!activeTaskId) return;

    const initializeTimer = () => {
      if (!timerStartRef.current) {
        timerStartRef.current = Date.now();
        lastTickRef.current = Date.now();
      }
    };

    const updateTimer = () => {
      try {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);
        
        if (elapsed < 1) return;

        if (isBreakTime) {
          setBreakTime(prev => {
            const next = prev - elapsed;
            if (next <= 0) {
              showNotification('Break Time Over', 'Time to get back to work!');
              setTimerAlertMessage('Break time over! Back to focus mode...');
              setShowTimerAlert(true);
              setIsBreakTime(false);
              setPomodoroTime(customPomodoroTime * 60);
              // Hide the alert after 3 seconds
              setTimeout(() => {
                setShowTimerAlert(false);
              }, 3000);
              return customBreakTime * 60;
            }
            return next;
          });
        } else {
          setPomodoroTime(prev => {
            const next = prev - elapsed;
            if (next <= 0) {
              showNotification('Pomodoro Complete', 'Time for a break!');
              setTimerAlertMessage('Focus session complete! Taking a break...');
              setShowTimerAlert(true);
              setIsBreakTime(true);
              setStats(prev => ({
                ...prev,
                totalPomodoroTime: prev.totalPomodoroTime + customPomodoroTime
              }));
              // Hide the alert after 3 seconds
              setTimeout(() => {
                setShowTimerAlert(false);
              }, 3000);
              return customBreakTime * 60;
            }
            return next;
          });
        }
        
        lastTickRef.current = now;
      } catch (error) {
        console.error('Error updating timer:', error);
        setError('Timer update failed');
        resetTimer();
      }
    };

    initializeTimer();
    const timerInterval = setInterval(updateTimer, 100);
    
    return () => clearInterval(timerInterval);
  }, [activeTaskId, isBreakTime, customPomodoroTime, customBreakTime]);

  // Update statistics
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const todayTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt);
      return taskDate.toDateString() === today.toDateString();
    });

    const weekTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt);
      return taskDate >= startOfWeek;
    });

    setStats(prev => ({
      ...prev,
      totalTasksCompleted: completedTasks.length,
      todayTasksCompleted: todayTasks.length,
      weekTasksCompleted: weekTasks.length
    }));
  }, [completedTasks]);

  // Task management functions
  const handleAddTask = useCallback((e) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    
    if (!trimmedTask) return;
    
    try {
      const newTaskItem = {
        id: Date.now(),
        text: trimmedTask,
        date: taskDate,
        startAt: null,
        endAt: null,
        createdAt: new Date()
      };
      
      setTasks(prev => [...prev, newTaskItem]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  }, [newTask, taskDate]);

  // Memoized notification handler
  const showNotification = useCallback((title, body) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      setError('Failed to show notification');
    }
  }, []);

  const startPomodoro = useCallback((taskId) => {
    try {
      setActiveTaskId(taskId);
      setIsBreakTime(false);
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, startAt: new Date() }
            : task
        )
      );
      setPomodoroTime(customPomodoroTime * 60);
      setBreakTime(customBreakTime * 60);
      timerStartRef.current = Date.now();
      lastTickRef.current = Date.now();
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      setError('Failed to start pomodoro');
    }
  }, [customPomodoroTime, customBreakTime]);

  const resetTimer = useCallback(() => {
    setActiveTaskId(null);
    setIsBreakTime(false);
    setPomodoroTime(customPomodoroTime * 60);
    setBreakTime(customBreakTime * 60);
    timerStartRef.current = null;
    lastTickRef.current = null;
  }, [customPomodoroTime, customBreakTime]);

  const completeTask = useCallback((taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const completedTask = {
        ...task,
        endAt: new Date(),
        completedAt: new Date()
      };
      
      setCompletedTasks(prev => [...prev, completedTask]);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTaskMessage(task.text);
      setShowCompletionAlert(true);
      
      showNotification('Task Completed', `Congratulations! You've completed: ${task.text}`);

      setTimeout(() => {
        setShowCompletionAlert(false);
      }, 3000);

      if (activeTaskId === taskId) {
        resetTimer();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  }, [tasks, activeTaskId, resetTimer, showNotification]);

  const deleteTask = useCallback((taskId) => {
    try {
      if (activeTaskId === taskId) {
        resetTimer();
      }
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  }, [activeTaskId, resetTimer]);

  const handlePomodoroTimeChange = useCallback((e) => {
    const value = e.target.value;
    if (!value) {
      setCustomPomodoroTime('');
      return;
    }
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setCustomPomodoroTime(Math.max(1, Math.min(MAX_POMODORO_TIME, numValue)));
    }
  }, []);

  const handleBreakTimeChange = useCallback((e) => {
    const value = e.target.value;
    if (!value) {
      setCustomBreakTime('');
      return;
    }
    
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setCustomBreakTime(Math.max(1, Math.min(MAX_BREAK_TIME, numValue)));
    }
  }, []);

  const updateTimes = useCallback(() => {
    try {
      const pomodoroValue = customPomodoroTime || DEFAULT_POMODORO_TIME;
      const breakValue = customBreakTime || DEFAULT_BREAK_TIME;
      
      const newPomodoro = Math.max(1, Math.min(MAX_POMODORO_TIME, pomodoroValue));
      const newBreak = Math.max(1, Math.min(MAX_BREAK_TIME, breakValue));
      
      setCustomPomodoroTime(newPomodoro);
      setCustomBreakTime(newBreak);
      setPomodoroTime(newPomodoro * 60);
      setBreakTime(newBreak * 60);
    } catch (error) {
      console.error('Error updating times:', error);
      setError('Failed to update times');
    }
  }, [customPomodoroTime, customBreakTime]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 animate-gradient-slow">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Time settings */}
      <div className="backdrop-blur-lg bg-white/70 rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-gray-600 font-medium">Pomodoro Time (minutes)</label>
            <input
              type="number"
              value={customPomodoroTime}
              onChange={handlePomodoroTimeChange}
              className="w-full px-4 py-2 border rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none hover:bg-white/70"
              placeholder="Focus time (minutes)"
              min="1"
              max={MAX_POMODORO_TIME}
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm text-gray-600 font-medium">Break Time (minutes)</label>
            <input
              type="number"
              value={customBreakTime}
              onChange={handleBreakTimeChange}
              className="w-full px-4 py-2 border rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:outline-none hover:bg-white/70"
              placeholder="Break time (minutes)"
              min="1"
              max={MAX_BREAK_TIME}
            />
          </div>
          <button
            onClick={updateTimes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 self-end"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
            <span>Update Times</span>
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
                    {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
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

      {/* Statistics Panel */}
      <div className="mb-6">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80"
        >
          <div className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold">Statistics</span>
          </div>
          {showStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {showStats && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 transform-gpu transition-all duration-300">
            <div className="p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg hover:bg-white/80 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Today</h3>
              <p className="text-gray-600">Tasks Completed: {stats.todayTasksCompleted}</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg hover:bg-white/80 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">This Week</h3>
              <p className="text-gray-600">Tasks Completed: {stats.weekTasksCompleted}</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg hover:bg-white/80 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Total</h3>
              <p className="text-gray-600">Tasks Completed: {stats.totalTasksCompleted}</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg hover:bg-white/80 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Focus Time</h3>
              <p className="text-gray-600">Total Minutes: {stats.totalPomodoroTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Timer Alert */}
      {showTimerAlert && (
        <Alert className="mb-4 transform-gpu transition-all duration-300 animate-pulse bg-blue-50">
          <Clock className="h-4 w-4" />
          <AlertTitle>Timer Update</AlertTitle>
          <AlertDescription>{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Completion Alert */}
      {showCompletionAlert && (
        <Alert variant="success" className="mb-4 transform-gpu transition-all duration-300 animate-pulse">
          <Check className="h-4 w-4" />
          <AlertTitle>Task Completed!</AlertTitle>
          <AlertDescription>{completedTaskMessage}</AlertDescription>
        </Alert>
      )}

      {/* Add task form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-lg border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none hover:bg-white/80 transition-all duration-300"
            placeholder="Add new task..."
          />
          <input
            type="date"
            value={taskDate}
            onChange={e => setTaskDate(e.target.value)}
            className="px-4 py-3 bg-white/70 backdrop-blur-lg border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none hover:bg-white/80 transition-all duration-300"
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
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Tasks</h2>
        {tasks.map(task => (
          <div
            key={task.id}
            className={`backdrop-blur-lg bg-white/70 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 p-4 transform hover:-translate-y-1 hover:bg-white/80
              ${activeTaskId === task.id ? 'border-2 border-blue-400 animate-pulse-slow' : ''}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-lg text-gray-700">{task.text}</span>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(task.date).toLocaleDateString()}</span>
                  {task.startAt && (
                    <span className="text-blue-600">
                      Started: {formatDateTime(task.startAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeTaskId === task.id ? (
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 ${isBreakTime ? 'bg-green-50/70' : 'bg-red-50/70'} backdrop-blur-sm px-4 py-2 rounded-lg animate-pulse-slow`}>
                      <span className={`text-lg font-mono font-semibold ${isBreakTime ? 'text-green-600' : 'text-red-600'}`}>
                        {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                      </span>
                      <button
                        onClick={() => setIsBreakTime(!isBreakTime)}
                        className={`p-2 ${isBreakTime ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'} rounded-lg transition-all duration-300`}
                        title={isBreakTime ? "Switch to Focus" : "Take a Break"}
                      >
                        {isBreakTime ? "Break" : "Focus"}
                      </button>
                      <button
                        onClick={resetTimer}
                        className={`p-2 ${isBreakTime ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'} rounded-lg transition-all duration-300`}
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                    </div>
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
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No active tasks. Add a new task to get started!
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      <div className="mb-6">
        <button
          onClick={() => setShowCompletedTasks(!showCompletedTasks)}
          className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/80"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-lg font-semibold">Completed Tasks</span>
          </div>
          {showCompletedTasks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {showCompletedTasks && (
          <div className="mt-2 space-y-2 transform-gpu transition-all duration-300">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="p-4 bg-white/30 backdrop-blur-lg rounded-xl shadow-md hover-scale transition-all duration-300 hover:bg-white/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="line-through text-gray-500">{task.text}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Completed: {formatDateTime(task.completedAt)}</span>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No completed tasks yet. Keep working!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;