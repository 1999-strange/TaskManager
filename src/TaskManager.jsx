import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, X, Settings, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [expandedDates, setExpandedDates] = useState(new Set());
  
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

  // Calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInMinutes = Math.round((end - start) / (1000 * 60));
    
    if (durationInMinutes < 60) {
      return `${durationInMinutes} minutes`;
    } else {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      return `${hours} hours ${minutes} minutes`;
    }
  };

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedTasks');
        const savedTimerState = localStorage.getItem('timerState');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
        
        if (savedTimerState) {
          const {
            activeTaskId: savedActiveTaskId,
            isBreakTime: savedIsBreakTime,
            pomodoroTime: savedPomodoroTime,
            breakTime: savedBreakTime,
            timerStart: savedTimerStart,
            lastTick: savedLastTick,
            customPomodoroTime: savedCustomPomodoroTime,
            customBreakTime: savedCustomBreakTime
          } = JSON.parse(savedTimerState);
          
          setActiveTaskId(savedActiveTaskId);
          setIsBreakTime(savedIsBreakTime);
          setPomodoroTime(savedPomodoroTime);
          setBreakTime(savedBreakTime);
          setCustomPomodoroTime(savedCustomPomodoroTime);
          setCustomBreakTime(savedCustomBreakTime);
          
          if (savedTimerStart) timerStartRef.current = savedTimerStart;
          if (savedLastTick) lastTickRef.current = savedLastTick;
        }
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
        
        if (activeTaskId) {
          const timerState = {
            activeTaskId,
            isBreakTime,
            pomodoroTime,
            breakTime,
            timerStart: timerStartRef.current,
            lastTick: lastTickRef.current,
            customPomodoroTime,
            customBreakTime
          };
          localStorage.setItem('timerState', JSON.stringify(timerState));
        } else {
          localStorage.removeItem('timerState');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        setError('Failed to save data');
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [tasks, completedTasks, activeTaskId, isBreakTime, pomodoroTime, breakTime, customPomodoroTime, customBreakTime]);

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
              setTimerAlertMessage('Break time is over! Time to focus...');
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
              setTimerAlertMessage('Focus time is over! Time for a break...');
              setShowTimerAlert(true);
              setIsBreakTime(true);
              setBreakTime(customBreakTime * 60);
              setTimeout(() => setShowTimerAlert(false), 3000);
              return customPomodoroTime * 60;
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

  // Updated formatDateTime function to use 24-hour format
  const formatDateTime = useCallback((date) => {
    const inputDate = new Date(date);
    const today = new Date();
    
    const isSameDay = inputDate.getDate() === today.getDate() &&
                     inputDate.getMonth() === today.getMonth() &&
                     inputDate.getFullYear() === today.getFullYear();
    
    if (isSameDay) {
      return inputDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      return inputDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }, []);

  const handleAddTask = useCallback((e) => {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    
    if (!trimmedTask) return;
    
    try {
      const newTaskItem = {
        id: Date.now(),
        text: trimmedTask,
        date: new Date().toISOString().split('T')[0],
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

  // Group completed tasks by date
  const completedTasksByDate = completedTasks.reduce((acc, task) => {
    const date = new Date(task.completedAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));
  const sortedCompletedDates = Object.keys(completedTasksByDate)
    .sort((a, b) => new Date(b) - new Date(a));

  const toggleDateExpansion = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="m-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-600">
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Progress bar and time display */}
      <div className="mb-4 md:mb-6 bg-white/90 rounded-2xl shadow-sm p-3 md:p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 md:w-8 md:h-8 text-gray-900" />
            <span className="text-2xl md:text-3xl font-medium text-gray-900">Today's Progress</span>
          </div>
          <span className="font-mono text-3xl md:text-4xl text-gray-900 tracking-wider">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        
        {/* Progress bar section */}
        <div className="relative w-full">
          <div className="relative w-full h-4 md:h-5 bg-gray-100/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
              style={{ width: `${(time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100}%` }}
            />
          </div>
          
          {/* Time markers */}
          <div className="relative w-full h-8 mt-2">
            {[6, 9, 12, 15, 18, 21].map(hour => (
              <div
                key={hour}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <div className="h-3 w-0.5 bg-gray-200" />
                <span className="text-xs md:text-base text-gray-500 mt-1">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 text-right text-lg md:text-xl text-gray-500 font-medium">
            {((time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Settings Section */}
        <div className="bg-white rounded-xl p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Focus (min)</span>
              <input
                type="number"
                value={customPomodoroTime}
                onChange={handlePomodoroTimeChange}
                className="w-full px-3 py-2 border-0 rounded-lg bg-gray-100/50 text-center"
                min="1"
                max={MAX_POMODORO_TIME}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Break (min)</span>
              <input
                type="number"
                value={customBreakTime}
                onChange={handleBreakTimeChange}
                className="w-full px-3 py-2 border-0 rounded-lg bg-gray-100/50 text-center"
                min="1"
                max={MAX_BREAK_TIME}
              />
            </div>
          </div>
          <button
            onClick={updateTimes}
            className="w-full py-2 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Update</span>
          </button>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-4 py-3 text-base border-0 rounded-xl bg-white"
            placeholder="Add new task..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-4 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Alerts */}
        {showTimerAlert && (
          <Alert className="py-2">
            <Clock className="h-4 w-4" />
            <AlertDescription>{timerAlertMessage}</AlertDescription>
          </Alert>
        )}

        {showCompletionAlert && (
          <Alert className="py-2">
            <Check className="h-4 w-4" />
            <AlertDescription>{completedTaskMessage}</AlertDescription>
          </Alert>
        )}

        {/* Tasks List */}
        {sortedDates.map(date => (
          <div key={date} className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </h2>
            {tasksByDate[date].map(task => (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-3 ${
                  activeTaskId === task.id ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="space-y-2">
                  <p className="text-base text-gray-700 break-words">
                    {task.text}
                  </p>
                  {task.startAt && (
                    <div className="text-sm text-blue-600">
                      Started: {formatDateTime(task.startAt)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2">
                    {activeTaskId === task.id ? (
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <span className="font-mono font-medium">
                          {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                        </span>
                        <button
                          onClick={() => setIsBreakTime(!isBreakTime)}
                          className="text-sm px-2 py-1 bg-gray-100 rounded"
                        >
                          {isBreakTime ? "Break" : "Focus"}
                        </button>
                        <button
                          onClick={resetTimer}
                          className="p-1"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPomodoro(task.id)}
                        className="p-2 text-blue-600"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => completeTask(task.id)}
                      className="p-2 text-green-600"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-600"
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
          <div className="text-center text-gray-500 py-8 text-sm">
            No tasks yet. Start by adding a new task!
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800">Completed Tasks</h2>
            {sortedCompletedDates.map(date => (
              <div key={date} className="bg-white rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className="w-full px-3 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                    <span className="text-gray-500">
                      ({completedTasksByDate[date].length})
                    </span>
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {expandedDates.has(date) && (
                  <div className="divide-y divide-gray-100">
                    {completedTasksByDate[date].map(task => (
                      <div key={task.id} className="p-3 text-sm">
                        <p className="line-through text-gray-500">{task.text}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          <div>Started: {formatDateTime(task.startAt)}</div>
                          <div>Completed: {formatDateTime(task.completedAt)}</div>
                          {calculateDuration(task.startAt, task.completedAt) && (
                            <div className="text-blue-500">
                              Duration: {calculateDuration(task.startAt, task.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;