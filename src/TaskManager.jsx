import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Check, Play, Pause, Plus, Trash2, Settings, Calendar, ChevronDown, ChevronRight, X, Moon, Sun, Monitor } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_BREAK_TIME = 5;
const MAX_POMODORO_TIME = 60;
const MAX_BREAK_TIME = 30;

// Theme options
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

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
  
  // Theme state
  const [themePreference, setThemePreference] = useState(THEME_OPTIONS.SYSTEM);
  
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

  // Dark mode system preference media query
  useEffect(() => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
      setThemePreference(savedTheme);
    }
    
    // Create media query for system preference detection
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Handle system preference changes
    const handleSystemThemeChange = (e) => {
      if (themePreference === THEME_OPTIONS.SYSTEM) {
        const isDark = e.matches;
        document.documentElement.classList.toggle('dark', isDark);
      }
    };
    
    // Add listener for system preference changes
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Apply theme based on preference
    if (themePreference === THEME_OPTIONS.DARK) {
      document.documentElement.classList.add('dark');
    } else if (themePreference === THEME_OPTIONS.LIGHT) {
      document.documentElement.classList.remove('dark');
    } else if (themePreference === THEME_OPTIONS.SYSTEM) {
      const systemPrefersDark = darkModeMediaQuery.matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    }
    
    return () => darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [themePreference]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('themePreference', themePreference);
  }, [themePreference]);

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
      // Create a new Date object for consistent date handling
      const now = new Date();
      const newTaskItem = {
        id: now.getTime(), // Using timestamp for ID
        text: trimmedTask,
        date: now.toISOString().split('T')[0],
        startAt: null,
        endAt: null,
        createdAt: now
      };
      
      // Update tasks state with proper error handling
      setTasks(prev => {
        const updatedTasks = [...prev, newTaskItem];
        try {
          // Verify the new state is valid
          if (!Array.isArray(updatedTasks)) {
            throw new Error('Invalid tasks state');
          }
          return updatedTasks;
        } catch (error) {
          console.error('Error updating tasks:', error);
          return prev; // Return previous state if update fails
        }
      });
      
      // Clear input field
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
      setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
      
      // No need to manually handle expandedDates as this date won't be shown anymore if empty
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

  // Handle theme toggle
  const handleThemeToggle = useCallback(() => {
    setThemePreference(prev => {
      // Cycle through theme options: light -> dark -> system -> light
      const nextTheme = prev === THEME_OPTIONS.LIGHT 
        ? THEME_OPTIONS.DARK 
        : prev === THEME_OPTIONS.DARK 
          ? THEME_OPTIONS.SYSTEM 
          : THEME_OPTIONS.LIGHT;
      
      // Update localStorage immediately to prevent flashing
      localStorage.setItem('themePreference', nextTheme);
      
      return nextTheme;
    });
  }, []);

  // Theme icon based on current preference
  const ThemeIcon = useCallback(() => {
    switch (themePreference) {
      case THEME_OPTIONS.DARK:
        return <Moon className="w-5 h-5" />;
      case THEME_OPTIONS.SYSTEM:
        return <Monitor className="w-5 h-5" />;
      case THEME_OPTIONS.LIGHT:
      default:
        return <Sun className="w-5 h-5" />;
    }
  }, [themePreference]);

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
    <div className="p-2 md:p-6 max-w-1xl mx-auto min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleThemeToggle}
          className="p-3 rounded-full bg-background border border-border shadow-md text-foreground hover:bg-accent transition-colors"
          title={`Theme: ${themePreference} (click to change)`}
        >
          <ThemeIcon />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-destructive">
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Custom Completion Alert */}
      {completionAlert.show && completionAlert.task && (
        <div className="fixed top-4 right-4 left-4 md:top-6 md:right-6 md:left-auto md:w-96 bg-card text-card-foreground shadow-lg rounded-xl p-4 border border-border z-50 transform transition-all duration-300 ease-out opacity-100 translate-y-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold mb-1">Task Completed!</h4>
              <p className="text-muted-foreground break-words">{completionAlert.task.text}</p>
              {completionAlert.task.startAt && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Duration: {calculateDuration(completionAlert.task.startAt, completionAlert.task.completedAt)}
                </div>
              )}
            </div>
            <button 
              onClick={() => setCompletionAlert({ show: false, task: null })}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Timer Alert */}
      {showTimerAlert && (
        <Alert className="mb-3 bg-primary/10 border-primary/20">
          <Clock className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-medium">Timer Update</AlertTitle>
          <AlertDescription className="text-primary/80">{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Progress bar and time display */}
      <div className="mb-3 md:mb-6 bg-card text-card-foreground rounded-xl shadow-sm p-3 backdrop-blur-xl transition-colors duration-200">
        <div className="flex sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-foreground" />
            <span className="text-xl md:text-3xl font-medium">Today's Progress</span>
          </div>
          <span className="font-mono text-2xl md:text-4xl tracking-wider">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        
        {/* Progress bar section */}
        <div className="relative w-full">
          <div className="relative w-full h-3 md:h-5 bg-muted rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-1000"
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
                <div className="h-2 w-0.5 bg-border" />
                <span className="text-xs md:text-base text-muted-foreground mt-0.5">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          <div className="mt-1 text-right text-base md:text-xl text-muted-foreground font-medium">
            {((time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Settings and Add Task Form */}
      <div className="mb-4 md:mb-6 bg-card text-card-foreground rounded-xl shadow-sm p-3 backdrop-blur-xl transition-colors duration-200">
        {/* Time Settings */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-sm md:text-base text-muted-foreground">Focus</span>
              <input
                type="number"
                value={customPomodoroTime}
                onChange={handlePomodoroTimeChange}
                className="w-16 md:w-24 px-2 py-1.5 border-0 rounded-lg bg-muted/50 backdrop-blur-sm focus:ring-2 focus:ring-primary focus:outline-none text-center text-base"
                placeholder="25"
                min="1"
                max={MAX_POMODORO_TIME}
              />
              <span className="text-sm md:text-base text-muted-foreground">min</span>
            </div>
            
            <div className="inline-flex items-center gap-2 flex-shrink-0">
              <span className="text-sm md:text-base text-muted-foreground">Break</span>
              <input
                type="number"
                value={customBreakTime}
                onChange={handleBreakTimeChange}
                className="w-16 md:w-24 px-2 py-1.5 border-0 rounded-lg bg-muted/50 backdrop-blur-sm focus:ring-2 focus:ring-primary focus:outline-none text-center text-base"
                placeholder="5"
                min="1"
                max={MAX_BREAK_TIME}
              />
              <span className="text-sm md:text-base text-muted-foreground">min</span>
            </div>
            
            <button
              onClick={updateTimes}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-sm md:text-base rounded-lg hover:bg-primary/90 flex items-center gap-2 flex-shrink-0 transition-colors"
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
            className="flex-1 px-3 py-2 md:py-4 text-base border-0 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-muted/50 backdrop-blur-sm transition-colors"
            placeholder="Add new task..."
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="px-4 py-2 md:py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 md:space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2 px-1">
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
                className={`bg-card text-card-foreground backdrop-blur-xl shadow-sm border-0 rounded-xl p-3 md:p-5 transition-colors ${
                  activeTaskId === task.id ? 'ring-2 ring-primary' : ''
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
                          className="flex-1 px-3 py-2 text-base border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background text-foreground"
                          autoFocus
                          onBlur={() => handleRename(task.id)}
                        />
                      </form>
                    ) : (
                      <div 
                        className="group flex items-center gap-2"
                        onClick={() => startEditing(task)}
                      >
                        <span className="text-base md:text-xl text-foreground block break-words cursor-pointer group-hover:text-primary transition-colors">
                          {task.text}
                        </span>
                        <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {task.startAt && (
                      <div className="text-sm md:text-base text-primary mt-1">
                        Started at: {formatDateTime(task.startAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activeTaskId === task.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-2 px-3 py-1.5 rounded-lg bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-base md:text-xl font-mono font-semibold text-foreground min-w-[70px] text-center">
                              {formatTime(isBreakTime ? breakTime : pomodoroTime)}
                            </span>
                            <button
                              onClick={() => setIsBreakTime(!isBreakTime)}
                              className="px-2 py-1.5 text-foreground hover:bg-accent rounded-lg text-sm transition-colors">
                              {isBreakTime ? "Break" : "Focus"}
                            </button>
                            <button
                              onClick={resetTimer}
                              className="p-1.5 text-foreground hover:bg-accent rounded-lg transition-colors"
                            >
                              <Pause className="w-5 h-5 md:w-7 md:h-7" />
                            </button>
                          </div>
                          {/* Timer Progress Bar */}
                          <div className="w-full h-2 bg-background rounded-full overflow-hidden transition-colors">
                            <div
                              className="h-full bg-primary transition-all duration-200"
                              style={{ width: `${calculateProgress()}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPomodoro(task.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Start Focus"
                      >
                        <Play className="w-5 h-5 md:w-7 md:h-7" />
                      </button>
                    )}
                    <button
                      onClick={() => completeTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
                      title="Complete Task"
                    >
                      <Check className="w-5 h-5 md:w-7 md:h-7" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
          <div className="text-center text-muted-foreground py-8 text-base md:text-lg">
            No tasks yet. Start by adding a new task!
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-6 border-t border-border pt-4 md:pt-6 transition-colors">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3">Completed Tasks</h2>
          <div className="space-y-2 md:space-y-3">
            {sortedCompletedDates.map(date => (
              <div key={date} className="border border-border rounded-xl overflow-hidden bg-card text-card-foreground backdrop-blur-xl transition-colors">
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className="w-full px-3 py-2 bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-base md:text-lg font-medium text-foreground">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      ({completedTasksByDate[date].length} tasks)
                    </span>
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedDates.has(date) && (
                  <div className="divide-y divide-border">
                    {completedTasksByDate[date].map(task => (
                      <div key={task.id} className="p-3 md:p-5 bg-card">
                        <div className="flex items-start gap-2 pr-4">
                          <div className="flex-1 min-w-0">
                            <span className="line-through text-base md:text-lg text-muted-foreground block break-words">
                              {task.text}
                            </span>
                            <div className="flex flex-col text-xs md:text-sm text-muted-foreground mt-1">
                              <span>{task.startAt ? `Started: ${formatDateTime(task.startAt)}` : 'Not started'}</span>
                              <span>Completed: {formatDateTime(task.completedAt)}</span>
                              {task.startAt && calculateDuration(task.startAt, task.completedAt) && (
                                <span className="text-primary">
                                  Duration: {calculateDuration(task.startAt, task.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                  title="Delete completed task"
                                >
                                  <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-background border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to delete this completed task?
                                    <div className="mt-2 p-2 bg-muted rounded-lg">
                                      <p className="text-foreground">{task.text}</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Completed: {formatDateTime(task.completedAt)}
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCompletedTask(task.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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