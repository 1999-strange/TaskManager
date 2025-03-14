import React, { useState, useEffect, useRef, useCallback, memo, createContext, useContext } from 'react';
import { Clock, Check, Play, Pause, Plus, Trash2, Settings, Calendar, ChevronDown, ChevronRight, X, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Constants
const DEFAULT_POMODORO_TIME = 25;
const DEFAULT_BREAK_TIME = 5;
const MAX_POMODORO_TIME = 60;
const MAX_BREAK_TIME = 30;

// Theme context
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  followSystem: true,
  setFollowSystem: () => {},
});

// Theme provider component
const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [followSystem, setFollowSystem] = useState(true);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedFollowSystem = localStorage.getItem('followSystem');
    
    if (savedFollowSystem !== null) {
      setFollowSystem(savedFollowSystem === 'true');
    }
    
    if (savedTheme !== null && savedFollowSystem === 'false') {
      setIsDark(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);
  
  // Listen for system preference changes
  useEffect(() => {
    if (!followSystem) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [followSystem]);
  
  // Update document class when theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('followSystem', followSystem.toString());
  }, [isDark, followSystem]);
  
  const toggleTheme = useCallback(() => {
    if (followSystem) {
      // If following system, switch to manual mode first
      setFollowSystem(false);
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDark(prev => !prev);
    }
  }, [followSystem]);
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, followSystem, setFollowSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
const useTheme = () => useContext(ThemeContext);

// Theme toggle button
const ThemeToggle = () => {
  const { isDark, toggleTheme, followSystem, setFollowSystem } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600" />
        )}
      </button>
      <button
        onClick={() => {
          setFollowSystem(prev => !prev);
          if (!followSystem) {
            // When switching to system mode, update theme immediately
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            // This will be handled by the theme provider
          }
        }}
        className={`text-xs px-2 py-1 rounded transition-colors ${
          followSystem 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}
        title={followSystem ? "Using system preference" : "Using manual setting"}
      >
        {followSystem ? "Auto" : "Manual"}
      </button>
    </div>
  );
};

// Memoized Components
const TimerDisplay = memo(({ time, isBreakTime, resetTimer, toggleBreakTime, progress }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex flex-col gap-2 px-3 py-1.5 rounded-lg bg-gray-50/80 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-base md:text-xl font-mono font-semibold text-gray-900 dark:text-gray-100 min-w-[70px] text-center">
          {time}
        </span>
        <button
          onClick={toggleBreakTime}
          className="px-2 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors">
          {isBreakTime ? "Break" : "Focus"}
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Pause className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
      {/* Timer Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} transition-all duration-200`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

const TaskItem = memo(({ 
  task, 
  isActive, 
  onStart, 
  onComplete, 
  onDelete, 
  onEdit, 
  isEditing, 
  editText, 
  setEditText, 
  handleRename,
  formatDateTime,
  timerDisplay 
}) => (
  <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-sm border-0 dark:border-gray-700 rounded-xl p-3 md:p-4 transition-all duration-200 hover:shadow-md ${
    isActive ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''
  }`}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleRename(task.id);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 px-3 py-2 text-base border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
              onBlur={() => handleRename(task.id)}
            />
          </form>
        ) : (
          <div 
            className="group flex items-center gap-2"
            onClick={onEdit}
          >
            <span className="text-base md:text-lg text-gray-700 dark:text-gray-200 block break-words cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {task.text}
            </span>
            <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        {task.startAt && (
          <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Started at: {formatDateTime(task.startAt)}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive ? (
          timerDisplay
        ) : (
          <button
            onClick={onStart}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Start Focus"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}
        <button
          onClick={onComplete}
          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
          title="Complete Task"
        >
          <Check className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title="Delete Task"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  </div>
));

const CompletedTaskItem = memo(({ 
  task, 
  formatDateTime, 
  calculateDuration, 
  onDelete 
}) => (
  <div className="p-3 md:p-4 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
    <div className="flex items-start gap-2 pr-4">
      <div className="flex-1 min-w-0">
        <span className="line-through text-base text-gray-500 dark:text-gray-400 block break-words">
          {task.text}
        </span>
        <div className="flex flex-wrap gap-x-3 text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
          <span>{task.startAt ? `Started: ${formatDateTime(task.startAt)}` : 'Not started'}</span>
          <span>Completed: {formatDateTime(task.completedAt)}</span>
          {task.startAt && calculateDuration(task.startAt, task.completedAt) && (
            <span className="text-blue-500 dark:text-blue-400 font-medium">
              Duration: {calculateDuration(task.startAt, task.completedAt)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete completed task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 dark:text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this completed task?
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100">{task.text}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Completed: {formatDateTime(task.completedAt)}
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
));

const DateGroup = memo(({ 
  date, 
  tasks, 
  activeTaskId, 
  onStart, 
  onComplete, 
  onDelete, 
  formatDateTime, 
  startEditing, 
  handleRename, 
  editingTaskId, 
  editingText, 
  setEditingText, 
  isBreakTime, 
  resetTimer, 
  toggleBreakTime, 
  formatTime, 
  calculateProgress,
  pomodoroTime, 
  breakTime 
}) => (
  <div className="space-y-3">
    <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 px-1">
      <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      <span>{new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })}</span>
    </h2>
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isActive={activeTaskId === task.id}
          onStart={() => onStart(task.id)}
          onComplete={() => onComplete(task.id)}
          onDelete={() => onDelete(task.id)}
          onEdit={() => startEditing(task)}
          isEditing={editingTaskId === task.id}
          editText={editingText}
          setEditingText={setEditingText}
          handleRename={handleRename}
          formatDateTime={formatDateTime}
          timerDisplay={
            <TimerDisplay
              time={formatTime(isBreakTime ? breakTime : pomodoroTime)}
              isBreakTime={isBreakTime}
              resetTimer={resetTimer}
              toggleBreakTime={toggleBreakTime}
              progress={calculateProgress()}
            />
          }
        />
      ))}
    </div>
  </div>
));

const CompletedDateGroup = memo(({ 
  date, 
  tasks, 
  isExpanded, 
  onToggle, 
  formatDateTime, 
  calculateDuration, 
  onDelete 
}) => (
  <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-200">
    <button
      onClick={onToggle}
      className="w-full px-3 py-2 bg-gray-50/80 dark:bg-gray-700/80 flex items-center justify-between hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-base font-medium text-gray-700 dark:text-gray-200">
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">
          {tasks.length} tasks
        </span>
      </div>
      {isExpanded ? (
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
    </button>
    
    {isExpanded && (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {tasks.map(task => (
          <CompletedTaskItem
            key={task.id}
            task={task}
            formatDateTime={formatDateTime}
            calculateDuration={calculateDuration}
            onDelete={() => onDelete(task.id)}
          />
        ))}
      </div>
    )}
  </div>
));

const TimerSettingsControl = memo(({ 
  customPomodoroTime, 
  customBreakTime, 
  handlePomodoroTimeChange, 
  handleBreakTimeChange, 
  updateTimes 
}) => (
  <div className="flex flex-col gap-3 mb-3">
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 flex-shrink-0 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg px-2 py-1">
        <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">Focus</span>
        <input
          type="number"
          value={customPomodoroTime}
          onChange={handlePomodoroTimeChange}
          className="w-16 px-2 py-1.5 border-0 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none text-center text-base text-gray-900 dark:text-gray-100"
          placeholder="25"
          min="1"
          max={MAX_POMODORO_TIME}
        />
        <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">min</span>
      </div>
      
      <div className="inline-flex items-center gap-2 flex-shrink-0 bg-gray-50/80 dark:bg-gray-700/80 rounded-lg px-2 py-1">
        <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">Break</span>
        <input
          type="number"
          value={customBreakTime}
          onChange={handleBreakTimeChange}
          className="w-16 px-2 py-1.5 border-0 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none text-center text-base text-gray-900 dark:text-gray-100"
          placeholder="5"
          min="1"
          max={MAX_BREAK_TIME}
        />
        <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">min</span>
      </div>
      
      <button
        onClick={updateTimes}
        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 flex items-center gap-2 flex-shrink-0 shadow-sm transition-all duration-200"
      >
        <Settings className="w-4 h-4" />
        <span>Update</span>
      </button>
    </div>
  </div>
));

const AddTaskForm = memo(({ newTask, setNewTask, handleAddTask }) => (
  <form onSubmit={handleAddTask} className="flex gap-2">
    <input
      type="text"
      value={newTask}
      onChange={e => setNewTask(e.target.value)}
      className="flex-1 px-3 py-3 text-base border-0 rounded-xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-sm text-gray-900 dark:text-gray-100"
      placeholder="Add new task..."
    />
    <button
      type="submit"
      disabled={!newTask.trim()}
      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 disabled:opacity-50 flex items-center justify-center shadow-sm transition-all duration-200"
    >
      <Plus className="w-5 h-5" />
    </button>
  </form>
));

const DayProgressBar = memo(({ time }) => {
  const progress = (time.getHours() * 60 + time.getMinutes()) / (24 * 60) * 100;
  const { isDark } = useTheme();
  
  return (
    <div className="relative w-full">
      <div className="relative w-full h-4 bg-gray-50/80 dark:bg-gray-700/80 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
        <div
          className={`absolute top-0 left-0 h-full ${
            isDark 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
              : 'bg-gradient-to-r from-blue-400 to-blue-600'
          } transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="relative w-full h-6 mt-1">
        {[6, 9, 12, 15, 18, 21].map(hour => (
          <div
            key={hour}
            className="absolute transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            <div className="h-2 w-0.5 bg-gray-200 dark:bg-gray-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      <div className="mt-1 text-right text-base text-gray-500 dark:text-gray-400 font-medium">
        <span className="bg-gray-50/80 dark:bg-gray-700/80 px-2 py-1 rounded-lg text-sm">
          Day progress: {progress.toFixed(1)}%
        </span>
      </div>
    </div>
  );
});

// Main component
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
  
  // Get theme from context
  const { isDark } = useTheme();
  
  // Timer refs
  const timerStartRef = useRef(null);
  const lastTickRef = useRef(null);

  // Calculate duration between two dates
  const calculateDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Return null if either date is invalid
    if (start.getFullYear() <= 1970 || end.getFullYear() <= 1970) return null;
    
    const durationInMinutes = Math.round((end - start) / (1000 * 60));
    
    if (durationInMinutes < 60) {
      return `${durationInMinutes} min`;
    } else {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }, []);

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

  const toggleBreakTime = useCallback(() => {
    setIsBreakTime(prev => !prev);
  }, []);

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

  const toggleDateExpansion = useCallback((date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  }, []);

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

  return (
    <div className={`p-2 md:p-4 max-w-4xl mx-auto min-h-screen bg-gradient-to-b ${
      isDark 
        ? 'from-gray-900 to-gray-800 text-gray-100' 
        : 'from-gray-50 to-white/80'
    } transition-colors duration-300`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-3 shadow-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <AlertTitle className="text-red-800 dark:text-red-200">Error</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
          <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-600 dark:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Custom Completion Alert */}
      {completionAlert.show && completionAlert.task && (
        <div className="fixed top-4 right-4 left-4 md:top-6 md:right-6 md:left-auto md:w-96 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 border-l-4 border-green-500 dark:border-green-400 z-50 transform transition-all duration-300 ease-out opacity-100 translate-y-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Task Completed!</h4>
              <p className="text-gray-600 dark:text-gray-300 break-words">{completionAlert.task.text}</p>
              {completionAlert.task.startAt && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Duration: {calculateDuration(completionAlert.task.startAt, completionAlert.task.completedAt)}
                </div>
              )}
            </div>
            <button 
              onClick={() => setCompletionAlert({ show: false, task: null })}
              className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Timer Alert */}
      {showTimerAlert && (
        <Alert className="mb-3 shadow-md bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800">
          <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Timer Update</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">{timerAlertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Theme toggle and Progress bar and time display */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-medium text-gray-800 dark:text-gray-100">Daily Progress</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="font-mono text-2xl text-gray-800 dark:text-gray-100 tracking-wider bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <DayProgressBar time={time} />
      </div>

      {/* Settings and Add Task Form */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        {/* Time Settings */}
        <TimerSettingsControl
          customPomodoroTime={customPomodoroTime}
          customBreakTime={customBreakTime}
          handlePomodoroTimeChange={handlePomodoroTimeChange}
          handleBreakTimeChange={handleBreakTimeChange}
          updateTimes={updateTimes}
        />

        {/* Add Task Form */}
        <AddTaskForm 
          newTask={newTask}
          setNewTask={setNewTask}
          handleAddTask={handleAddTask}
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedDates.map(date => (
          <DateGroup
            key={date}
            date={date}
            tasks={tasksByDate[date]}
            activeTaskId={activeTaskId}
            onStart={startPomodoro}
            onComplete={completeTask}
            onDelete={deleteTask}
            formatDateTime={formatDateTime}
            startEditing={startEditing}
            handleRename={handleRename}
            editingTaskId={editingTaskId}
            editingText={editingText}
            setEditingText={setEditingText}
            isBreakTime={isBreakTime}
            resetTimer={resetTimer}
            toggleBreakTime={toggleBreakTime}
            formatTime={formatTime}
            calculateProgress={calculateProgress}
            pomodoroTime={pomodoroTime}
            breakTime={breakTime}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <Plus className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-base">No tasks yet. Start by adding a new task!</p>
            </div>
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-6 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Completed Tasks</h2>
          </div>
          <div className="space-y-2">
            {sortedCompletedDates.map(date => (
              <CompletedDateGroup
                key={date}
                date={date}
                tasks={completedTasksByDate[date]}
                isExpanded={expandedDates.has(date)}
                onToggle={() => toggleDateExpansion(date)}
                formatDateTime={formatDateTime}
                calculateDuration={calculateDuration}
                onDelete={deleteCompletedTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main app with theme provider
const ThemeEnabledTaskManager = () => {
  return (
    <ThemeProvider>
      <TaskManager />
    </ThemeProvider>
  );
};

export default ThemeEnabledTaskManager;