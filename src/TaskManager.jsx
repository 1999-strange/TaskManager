import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, Trash2, Settings, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [timerAlertMessage, setTimerAlertMessage] = useState('');
  const [error, setError] = useState(null);
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // Custom completion alert state
  const [completionAlert, setCompletionAlert] = useState({
    show: false,
    task: null
  });
  
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
    
    // Return null if either date is invalid
    if (start.getFullYear() <= 1970 || end.getFullYear() <= 1970) return null;
    
    const durationInMinutes = Math.round((end - start) / (1000 * 60));
    
    if (durationInMinutes < 60) {
      return `${durationInMinutes} minutes`;
    } else {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      return `${hours} hours ${minutes} minutes`;
    }
  };

  // Format date time with null check
  const formatDateTime = useCallback((date) => {
    if (!date) return 'Not started';
    
    const inputDate = new Date(date);
    const today = new Date();
    
    // Check if valid date
    if (inputDate.getFullYear() <= 1970) return 'Not started';
    
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

  // Calculate timer progress
  const calculateProgress = useCallback(() => {
    if (!activeTaskId) return 0;
    const totalTime = isBreakTime ? (customBreakTime * 60) : (customPomodoroTime * 60);
    const currentTime = isBreakTime ? breakTime : pomodoroTime;
    return ((totalTime - currentTime) / totalTime) * 100;
  }, [activeTaskId, isBreakTime, breakTime, pomodoroTime, customBreakTime, customPomodoroTime]);

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

  // Task management functions
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

  const startEditing = useCallback((task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  }, []);

  const handleRename = useCallback((taskId) => {
    const trimmedText = editingText.trim();
    if (!trimmedText) return;

    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, text: trimmedText }
          : task
      ));
      setEditingTaskId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error renaming task:', error);
      setError('Failed to rename task');
    }
  }, [editingText]);

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
            ? { ...task, startAt: task.startAt || new Date() }
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

  const deleteCompletedTask = useCallback((taskId) => {
    try {
      const taskToDelete = completedTasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      const taskDate = new Date(taskToDelete.completedAt).toISOString().split('T')[0];
      const remainingTasksForDate = completedTasks.filter(t => 
        t.id !== taskId && 
        new Date(t.completedAt).toISOString().split('T')[0] === taskDate
      );
      
      // Remove the task from completedTasks
      setCompletedTasks// Remove the task from completedTasks
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
      
      // If this was the last task for this date, automatically remove the date
      if (remainingTasksForDate.length === 0) {
        // The date will automatically disappear from the UI since there are no more tasks
        // No need to manually handle expandedDates as this date won't be shown anymore
      }
    } catch (error) {
      console.error('Error deleting completed task:', error);
      setError('Failed to delete completed task');
    }
  }, [completedTasks]);

  const completeTask = useCallback((taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const completedTask = {
        ...task,
        endAt: task.startAt ? new Date() : null,
        completedAt: new Date()
      };
      
      setCompletedTasks(prev => [...prev, completedTask]);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Show completion alert
      setCompletionAlert({
        show: true,
        task: completedTask
      });
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setCompletionAlert({
          show: false,
          task: null
        });
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
    <div className="p-2 md:p-6 max-w-1xl mx-auto min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-600">
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Custom Completion Alert */}
      {completionAlert.show && completionAlert.task && (
        <div className="fixed top-4 right-4 left-4 md:top-6 md:right-6 md:left-auto md:w-96 bg-white shadow-lg rounded-xl p-4 border border-green-100 z-50 transform transition-all duration-300 ease-out opacity-100 translate-y-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Task Completed!</h4>
              <p className="text-gray-600 break-words">{completionAlert.task.text}</p>
              {completionAlert.task.startAt && (
                <div className="mt-2 text-sm text-gray-500">
                  Duration: {calculateDuration(completionAlert.task.startAt, completionAlert.task.completedAt)}
                </div>
              )}
            </div>
            <button 
              onClick={() => setCompletionAlert({ show: false, task: null })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Timer Alert */}
      {showTimerAlert && (
        <Alert className="mb-3">
          <Clock className="h-4 w-4" />
          <AlertTitle>Timer Update</AlertTitle>
          <AlertDescription>{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Progress bar and time display */}
      <div className="mb-3 md:mb-6 bg-white/90 rounded-xl shadow-sm p-3 backdrop-blur-xl">
        <div className="flex sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
            <span className="text-xl md:text-3xl font-medium text-gray-900">Today's Progress</span>
          </div>
          <span className="font-mono text-2xl md:text-4xl text-gray-900 tracking-wider">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        
        {/* Progress bar section */}
        <div className="relative w-full">
          <div className="relative w-full h-3 md:h-5 bg-gray-100/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
              style={{ width: `${(time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100}%` }}
            />
          </div>
          
          {/* Time markers */}
          <div className="relative w-full h-6 mt-1">
            {[6, 9, 12, 15, 18, 21].map(hour => (
              <div
                key={hour}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <div className="h-2 w-0.5 bg-gray-200" />
                <span className="text-xs md:text-base text-gray-500 mt-0.5">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          <div className="mt-1 text-right text-base md:text-xl text-gray-500 font-medium">
            {((time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Settings and Add Task Form */}
      <div className="mb-4 md:mb-6 bg-white/90 rounded-xl shadow-sm p-3 backdrop-blur-xl">
        {/* Time Settings */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-sm md:text-base text-gray-600">Focus</span>
              <input
                type="number"
                value={customPomodoroTime}
                onChange={handlePomodoroTimeChange}
                className="w-16 md:w-24 px-2 py-1.5 border-0 rounded-lg bg-gray-100/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-center text-base"
                placeholder="25"
                min="1"
                max={MAX_POMODORO_TIME}
              />
              <span className="text-sm md:text-base text-gray-600">min</span>
            </div>
            
            <div className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-sm md:text-base text-gray-600">Break</span>
              <input
                type="number"
                value={customBreakTime}
                onChange={handleBreakTimeChange}
                className="w-16 md:w-24 px-2 py-1.5 border-0 rounded-lg bg-gray-100/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-center text-base"
                placeholder="5"
                min="1"
                max={MAX_BREAK_TIME}
              />
              <span className="text-sm md:text-base text-gray-600">min</span>
            </div>
            
            <button
              onClick={updateTimes}
              className="px-3 py-1.5 bg-gray-900 text-white text-sm md:text-base rounded-lg hover:bg-gray-800 flex items-center gap-2 flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span>Update</span>
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="flex-1 px-3 py-2 md:py-4 text-base border-0 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-100/50 backdrop-blur-sm"
            placeholder="Add new task..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-4 py-2 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 md:space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2 px-1">
              <Calendar className="w-5 h-5 md:w-7 md:h-7" />
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            {tasksByDate[date].map(task => (
              <div
                key={task.id}
                className={`bg-white/90 backdrop-blur-xl shadow-sm border-0 rounded-xl p-3 md:p-5 ${
                  activeTaskId === task.id ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingTaskId === task.id ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleRename(task.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-3 py-2 text-base border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          autoFocus
                          onBlur={() => handleRename(task.id)}
                        />
                      </form>
                    ) : (
                      <div 
                        className="group flex items-center gap-2"
                        onClick={() => startEditing(task)}
                      >
                        <span className="text-base md:text-xl text-gray-700 block break-words cursor-pointer group-hover:text-blue-600">
                          {task.text}
                        </span>
                        <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {task.startAt && (
                      <div className="text-sm md:text-base text-blue-600 mt-1">
                        Started at: {formatDateTime(task.startAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activeTaskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="text-base md:text-xl font-mono font-semibold text-gray-900 min-w-[70px] text-center">
                              {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                            </span>
                            <button
                              onClick={() => setIsBreakTime(!isBreakTime)}
                              className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">
                              {isBreakTime ? "Break" : "Focus"}
                            </button>
                            <button
                              onClick={resetTimer}
                              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                              <Pause className="w-5 h-5 md:w-7 md:h-7" />
                            </button>
                          </div>
                          {/* Timer Progress Bar */}
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-200"
                              style={{ width: `${calculateProgress()}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPomodoro(task.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Start Focus"
                      >
                        <Play className="w-5 h-5 md:w-7 md:h-7" />
                      </button>
                    )}
                    <button
                      onClick={() => completeTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Complete Task"
                    >
                      <Check className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Task"
                    >
                      <X className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-base md:text-lg">
            No tasks yet. Start by adding a new task!
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-6 border-t pt-4 md:pt-6">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-3">Completed Tasks</h2>
          <div className="space-y-2 md:space-y-3">
            {sortedCompletedDates.map(date => (
              <div key={date} className="border border-gray-100 rounded-xl overflow-hidden bg-white/90 backdrop-blur-xl">
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className="w-full px-3 py-2 bg-gray-50/80 flex items-center justify-between hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-base md:text-lg font-medium text-gray-700">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      ({completedTasksByDate[date].length} tasks)
                    </span>
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {expandedDates.has(date) && (
                  <div className="divide-y divide-gray-100">
                    {completedTasksByDate[date].map(task => (
                      <div key={task.id} className="p-3 md:p-5 bg-white">
                        <div className="flex items-start gap-2 pr-4">
                          <div className="flex-1 min-w-0">
                            <span className="line-through text-base md:text-lg text-gray-500 block break-words">
                              {task.text}
                            </span>
                            <div className="flex flex-col text-xs md:text-sm text-gray-400 mt-1">
                              <span>{task.startAt ? `Started: ${formatDateTime(task.startAt)}` : 'Not started'}</span>
                              <span>Completed: {formatDateTime(task.completedAt)}</span>
                              {task.startAt && calculateDuration(task.startAt, task.completedAt) && (
                                <span className="text-blue-500">
                                  Duration: {calculateDuration(task.startAt, task.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                          <AlertDialog>
                           <AlertDialogTrigger asChild>
                        <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         title="Delete completed task"
                           >
                            <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                             </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this completed task?
                                    <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                                      <p className="text-gray-900">{task.text}</p>
                                      <p className="text-sm text-gray-500 mt-1">
                                        Completed: {formatDateTime(task.completedAt)}
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCompletedTask(task.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;