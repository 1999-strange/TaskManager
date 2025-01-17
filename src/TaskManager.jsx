import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
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
      } catch (error) {
        console.error('Error saving data:', error);
        setError('Failed to save data');
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [tasks, completedTasks]);

  // Clock update
  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Pomodoro timer
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
              setTimerAlertMessage('Break time over! Back to focus mode...');
              setShowTimerAlert(true);
              setIsBreakTime(false);
              setPomodoroTime(customPomodoroTime * 60);
              setTimeout(() => setShowTimerAlert(false), 3000);
              return customBreakTime * 60;
            }
            return next;
          });
        } else {
          setPomodoroTime(prev => {
            const next = prev - elapsed;
            if (next <= 0) {
              setTimerAlertMessage('Focus session complete! Taking a break...');
              setShowTimerAlert(true);
              setIsBreakTime(true);
              setTimeout(() => setShowTimerAlert(false), 3000);
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

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDateTime = useCallback((date) => {
    return new Date(date).toLocaleString();
  }, []);

  // Task management functions
  const handleAddTask = useCallback((e) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    
    if (!trimmedTask) return;
    
    try {
      const newTaskItem = {
        id: Date.now(),
        text: trimmedTask,
        date: new Date().toISOString().split('T')[0], // 使用当前日期
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
  }, [newTask]);

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
  }, [tasks, activeTaskId, resetTimer]);

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

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen bg-white">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-600">
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Progress bar and time display */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-gray-900" />
            <span className="text-xl font-medium text-gray-900">今日进度</span>
          </div>
          <span className="font-mono text-xl text-gray-900">
            {time.toLocaleTimeString('zh-CN', { hour12: false })}
          </span>
        </div>
        <div className="relative w-full">
          {/* Progress bar with gradient */}
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${(time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100}%` }}
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
                  <div className="h-2 w-0.5 bg-gray-200" />
                  <span className="text-xs text-gray-500">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Percentage display */}
          <div className="mt-1 text-right text-sm text-gray-500">
            {((time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Add task form with time settings */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">专注</span>
            <input
              type="number"
              value={customPomodoroTime}
              onChange={handlePomodoroTimeChange}
              className="w-16 px-2 py-1 border rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none text-center"
              placeholder="25"
              min="1"
              max={MAX_POMODORO_TIME}
            />
            <span className="text-sm text-gray-600">分钟</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">休息</span>
            <input
              type="number"
              value={customBreakTime}
              onChange={handleBreakTimeChange}
              className="w-16 px-2 py-1 border rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none text-center"
              placeholder="5"
              min="1"
              max={MAX_BREAK_TIME}
            />
            <span className="text-sm text-gray-600">分钟</span>
          </div>
          
          <button
            onClick={updateTimes}
            className="px-3 py-1 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            <span>更新</span>
          </button>
        </div>

      {/* Timer Alert */}
      {showTimerAlert && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertTitle>计时器更新</AlertTitle>
          <AlertDescription>{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Completion Alert */}
      {showCompletionAlert && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertTitle>任务完成！</AlertTitle>
          <AlertDescription>{completedTaskMessage}</AlertDescription>
        </Alert>
      )}

      {/* Add task form */}
        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="添加新任务..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Tasks grouped by date */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(date).toLocaleDateString()}
            </h2>
            {tasksByDate[date].map(task => (
              <div
                key={task.id}
                className={`bg-white border rounded-lg p-4 ${
                  activeTaskId === task.id ? 'border-blue-400' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-lg text-gray-700">{task.text}</span>
                    {task.startAt && (
                      <div className="text-sm text-blue-600 mt-1">
                        开始时间: {formatDateTime(task.startAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTaskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
                          <span className="text-lg font-mono font-semibold text-gray-600">
                            {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                          </span>
                          <button
                            onClick={() => setIsBreakTime(!isBreakTime)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            {isBreakTime ? "休息中" : "专注中"}
                          </button>
                          <button
                            onClick={resetTimer}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPomodoro(task.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="开始专注"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => completeTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="完成任务"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="删除任务"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            暂无任务,开始添加新任务吧!
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">已完成任务</h2>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="line-through text-gray-500">{task.text}</span>
                    <div className="flex flex-col text-sm text-gray-400 mt-1">
                      <span>开始时间: {formatDateTime(task.startAt)}</span>
                      <span>完成时间: {formatDateTime(task.completedAt)}</span>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;