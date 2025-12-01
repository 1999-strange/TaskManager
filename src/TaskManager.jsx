import React, { 
  useState, useEffect, useRef, useCallback, memo, createContext, 
  useContext, useMemo, useReducer 
} from 'react';
import { 
  Clock, Check, Play, Pause, Plus, Trash2, AlertTriangle, 
  Calendar, ChevronDown, ChevronRight, X, Target, Zap, 
  Shield, Flame, Lock, Unlock, GitBranch, Terminal,
  Radio, Crosshair, Activity, AlertCircle, Volume2, VolumeX,
  Award, TrendingUp, BarChart3, History, Settings, Bell,
  Eye, EyeOff, Sparkles, Crown, Star, Layers, Link2, Unlink,
  ArrowRight, RotateCcw, Maximize2, Minimize2, Moon, Sun,
  ChevronUp, Circle, Square, Triangle, Hexagon, Diamond,
  CheckCircle2, XCircle, Timer, Coffee, Brain, Rocket,
  Info, AlertOctagon, PartyPopper, BellRing, Monitor
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// ████████╗ ██████╗███████╗    ██╗   ██╗██████╗    ██████╗ 
// ╚══██╔══╝██╔════╝██╔════╝    ██║   ██║╚════██╗   ╚════██╗
//    ██║   ██║     ███████╗    ██║   ██║ █████╔╝    █████╔╝
//    ██║   ██║     ╚════██║    ╚██╗ ██╔╝ ╚═══██╗   ██╔═══╝ 
//    ██║   ╚██████╗███████║     ╚████╔╝ ██████╔╝██╗███████╗
//    ╚═╝    ╚═════╝╚══════╝      ╚═══╝  ╚═════╝ ╚═╝╚══════╝
//                                                          
// TACTICAL CONTROL SYSTEM v3.2
// With Day/Night Theme & In-App Notifications
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  FOCUS_TIME: 25 * 60,
  BREAK_TIME: 5 * 60,
  DELAY_PROTOCOL_TIME: 15 * 60,
  MELTDOWN_THRESHOLD: 3,
  PURITY_REDUCTION_PER_EXCEPTION: 7,
  DAILY_POLICY_LIMIT: 1,
  NOTIFICATION_DURATION: 5000,
  AUTO_THEME_ENABLED: true,
  DAY_START_HOUR: 6,
  NIGHT_START_HOUR: 18,
};

const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  NORMAL: 'normal',
  LOW: 'low'
};

// Theme color tokens
const THEMES = {
  dark: {
    name: 'dark',
    label: '深色模式',
    icon: Moon,
    bg: {
      primary: '#0a0a0f',
      secondary: '#111118',
      tertiary: '#1a1a24',
      card: 'rgba(255,255,255,0.03)',
      cardHover: 'rgba(255,255,255,0.05)',
    },
    text: {
      primary: 'rgba(255,255,255,0.95)',
      secondary: 'rgba(255,255,255,0.70)',
      tertiary: 'rgba(255,255,255,0.40)',
      muted: 'rgba(255,255,255,0.20)',
    },
    border: {
      primary: 'rgba(255,255,255,0.08)',
      secondary: 'rgba(255,255,255,0.05)',
      accent: 'rgba(16,185,129,0.30)',
    },
    accent: {
      emerald: '#10b981',
      cyan: '#06b6d4',
      rose: '#f43f5e',
      amber: '#f59e0b',
      purple: '#a855f7',
    },
    glow: {
      emerald: 'rgba(16,185,129,0.15)',
      cyan: 'rgba(6,182,212,0.15)',
      rose: 'rgba(244,63,94,0.15)',
      amber: 'rgba(245,158,11,0.15)',
    },
    gradient: {
      orb1: 'rgba(16,185,129,0.05)',
      orb2: 'rgba(6,182,212,0.05)',
    }
  },
  light: {
    name: 'light',
    label: '浅色模式',
    icon: Sun,
    bg: {
      primary: '#f8fafc',
      secondary: '#f1f5f9',
      tertiary: '#e2e8f0',
      card: 'rgba(255,255,255,0.80)',
      cardHover: 'rgba(255,255,255,0.95)',
    },
    text: {
      primary: 'rgba(15,23,42,0.95)',
      secondary: 'rgba(15,23,42,0.70)',
      tertiary: 'rgba(15,23,42,0.50)',
      muted: 'rgba(15,23,42,0.25)',
    },
    border: {
      primary: 'rgba(15,23,42,0.10)',
      secondary: 'rgba(15,23,42,0.06)',
      accent: 'rgba(16,185,129,0.40)',
    },
    accent: {
      emerald: '#059669',
      cyan: '#0891b2',
      rose: '#e11d48',
      amber: '#d97706',
      purple: '#9333ea',
    },
    glow: {
      emerald: 'rgba(16,185,129,0.10)',
      cyan: 'rgba(6,182,212,0.10)',
      rose: 'rgba(244,63,94,0.10)',
      amber: 'rgba(245,158,11,0.10)',
    },
    gradient: {
      orb1: 'rgba(16,185,129,0.08)',
      orb2: 'rgba(6,182,212,0.08)',
    }
  }
};

const PRIORITY_CONFIG = {
  [PRIORITY.CRITICAL]: { 
    label: 'CRITICAL', 
    colorKey: 'rose',
  },
  [PRIORITY.HIGH]: { 
    label: 'HIGH', 
    colorKey: 'amber',
  },
  [PRIORITY.NORMAL]: { 
    label: 'NORMAL', 
    colorKey: 'cyan',
  },
  [PRIORITY.LOW]: { 
    label: 'LOW', 
    colorKey: 'muted',
  }
};

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_FOCUS: { id: 'first_focus', name: '初次启动', desc: '完成第一次专注', icon: Rocket, tier: 'bronze' },
  CHAIN_10: { id: 'chain_10', name: '十连击', desc: '达成10次连续专注', icon: Zap, tier: 'bronze' },
  CHAIN_25: { id: 'chain_25', name: '坚持不懈', desc: '达成25次连续专注', icon: Shield, tier: 'silver' },
  CHAIN_50: { id: 'chain_50', name: '钢铁意志', desc: '达成50次连续专注', icon: Crown, tier: 'gold' },
  CHAIN_100: { id: 'chain_100', name: '传奇', desc: '达成100次连续专注', icon: Star, tier: 'legendary' },
  PURITY_100: { id: 'purity_100', name: '纯净系统', desc: '保持100%纯净度完成25次', icon: Sparkles, tier: 'silver' },
  WEEK_STREAK: { id: 'week_streak', name: '一周连胜', desc: '连续7天使用系统', icon: Calendar, tier: 'silver' },
  POLICY_MASTER: { id: 'policy_master', name: '国策大师', desc: '解锁10个国策节点', icon: GitBranch, tier: 'gold' },
  NO_EXCEPTIONS: { id: 'no_exceptions', name: '零容忍', desc: '不添加任何例外完成50次', icon: Shield, tier: 'legendary' },
};

const TIER_CONFIG = {
  bronze: { colorKey: 'amber' },
  silver: { colorKey: 'cyan' },
  gold: { colorKey: 'amber' },
  legendary: { colorKey: 'purple' },
};

// Default policy tree
const DEFAULT_POLICY_TREE = [
  { id: 'root', name: '基础生存', description: '系统根节点', parentId: null, status: 'active', icon: 'hexagon', tier: 1 },
  { id: 'morning', name: '晨间仪式', description: '每日固定时间起床', parentId: 'root', status: 'locked', icon: 'sun', tier: 2 },
  { id: 'diet', name: '饮食规律', description: '三餐定时定量', parentId: 'root', status: 'locked', icon: 'coffee', tier: 2 },
  { id: 'exercise', name: '运动习惯', description: '每周运动3次以上', parentId: 'root', status: 'locked', icon: 'activity', tier: 2 },
  { id: 'meditation', name: '冥想10分钟', description: '每日静心冥想', parentId: 'morning', status: 'locked', icon: 'brain', tier: 3 },
  { id: 'journal', name: '晨间日记', description: '记录想法与计划', parentId: 'morning', status: 'locked', icon: 'edit', tier: 3 },
  { id: 'meal_log', name: '记录饮食', description: '追踪每餐摄入', parentId: 'diet', status: 'locked', icon: 'clipboard', tier: 3 },
  { id: 'calorie', name: '控制热量', description: '每日热量在目标范围', parentId: 'meal_log', status: 'locked', icon: 'target', tier: 4 },
  { id: 'deep_meditation', name: '深度冥想30分钟', description: '延长冥想时间', parentId: 'meditation', status: 'locked', icon: 'sparkles', tier: 4 },
  { id: 'cardio', name: '有氧运动', description: '每周150分钟有氧', parentId: 'exercise', status: 'locked', icon: 'heart', tier: 3 },
  { id: 'strength', name: '力量训练', description: '每周2次力量训练', parentId: 'exercise', status: 'locked', icon: 'zap', tier: 3 },
];

// Notification types
const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle2, colorKey: 'emerald' },
  warning: { icon: AlertTriangle, colorKey: 'amber' },
  error: { icon: XCircle, colorKey: 'rose' },
  info: { icon: Info, colorKey: 'cyan' },
  achievement: { icon: Award, colorKey: 'purple' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════════════════════════

// Theme Context
const ThemeContext = createContext(null);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// Notification Context
const NotificationContext = createContext(null);

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatTime = (seconds) => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (date) => {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const formatDateTime = (date) => {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const calculatePurity = (exceptions) => {
  const baseReduction = exceptions.length * CONFIG.PURITY_REDUCTION_PER_EXCEPTION;
  return Math.max(0, 100 - baseReduction);
};

const clsx = (...classes) => classes.filter(Boolean).join(' ');

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= CONFIG.NIGHT_START_HOUR || hour < CONFIG.DAY_START_HOUR;
};

// ═══════════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('tcs_theme');
    if (saved) return saved;
    return isNightTime() ? 'dark' : 'light';
  });
  const [autoTheme, setAutoTheme] = useState(() => {
    const saved = localStorage.getItem('tcs_auto_theme');
    return saved !== null ? JSON.parse(saved) : CONFIG.AUTO_THEME_ENABLED;
  });
  
  const theme = THEMES[themeName];
  const isDark = themeName === 'dark';
  
  // Auto theme switching
  useEffect(() => {
    if (!autoTheme) return;
    
    const checkTime = () => {
      const shouldBeDark = isNightTime();
      setThemeName(shouldBeDark ? 'dark' : 'light');
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [autoTheme]);
  
  // Save preferences
  useEffect(() => {
    localStorage.setItem('tcs_theme', themeName);
    localStorage.setItem('tcs_auto_theme', JSON.stringify(autoTheme));
  }, [themeName, autoTheme]);
  
  const toggleTheme = useCallback(() => {
    setThemeName(prev => prev === 'dark' ? 'light' : 'dark');
    setAutoTheme(false);
  }, []);
  
  const value = useMemo(() => ({
    theme,
    themeName,
    isDark,
    autoTheme,
    setAutoTheme,
    toggleTheme,
    setThemeName,
  }), [theme, themeName, isDark, autoTheme, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION PROVIDER & TOAST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      type: 'info',
      duration: CONFIG.NOTIFICATION_DURATION,
      ...notification,
      createdAt: Date.now(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Convenience methods
  const notify = useMemo(() => ({
    success: (title, message) => addNotification({ type: 'success', title, message }),
    warning: (title, message) => addNotification({ type: 'warning', title, message }),
    error: (title, message) => addNotification({ type: 'error', title, message }),
    info: (title, message) => addNotification({ type: 'info', title, message }),
    achievement: (title, message) => addNotification({ type: 'achievement', title, message, duration: 8000 }),
  }), [addNotification]);
  
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notify,
  }), [notifications, addNotification, removeNotification, clearAll, notify]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const NotificationToast = memo(({ notification, onDismiss }) => {
  const { theme, isDark } = useTheme();
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const Icon = config.icon;
  const accentColor = theme.accent[config.colorKey];
  
  const [isExiting, setIsExiting] = useState(false);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };
  
  return (
    <div 
      className={clsx(
        'relative flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl',
        'shadow-xl transition-all duration-300',
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      )}
      style={{
        background: isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: theme.border.primary,
        boxShadow: `0 8px 32px ${theme.glow[config.colorKey]}`,
      }}
    >
      {/* Accent line */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
        style={{ background: accentColor }}
      />
      
      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
        style={{ background: `${accentColor}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div 
          className="font-medium text-sm mb-0.5"
          style={{ color: theme.text.primary }}
        >
          {notification.title}
        </div>
        {notification.message && (
          <div 
            className="text-sm"
            style={{ color: theme.text.tertiary }}
          >
            {notification.message}
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-lg transition-colors flex-shrink-0"
        style={{ color: theme.text.muted }}
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      {notification.duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden"
          style={{ background: theme.border.secondary }}
        >
          <div 
            className="h-full rounded-full animate-shrink"
            style={{ 
              background: accentColor,
              animationDuration: `${notification.duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
});

const NotificationContainer = memo(() => {
  const { notifications, removeNotification } = useNotifications();
  
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto animate-slideIn">
          <NotificationToast 
            notification={notification} 
            onDismiss={removeNotification}
          />
        </div>
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const useAudio = () => {
  const [enabled, setEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);
  
  const playSound = useCallback((type) => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      
      const now = ctx.currentTime;
      
      switch (type) {
        case 'activate':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(220, now);
          oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;
          
        case 'success':
          oscillator.type = 'sine';
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
          });
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;
          
        case 'warning':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(300, now);
          oscillator.frequency.setValueAtTime(200, now + 0.15);
          oscillator.frequency.setValueAtTime(300, now + 0.3);
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          oscillator.start(now);
          oscillator.stop(now + 0.45);
          break;
          
        case 'failure':
          oscillator.type = 'sawtooth';
          filter.frequency.value = 800;
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.6);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          oscillator.start(now);
          oscillator.stop(now + 0.6);
          break;
          
        case 'unlock':
          oscillator.type = 'sine';
          [392, 523.25, 659.25].forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, now + i * 0.12);
          });
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;
          
        case 'meltdown':
          oscillator.type = 'sawtooth';
          filter.frequency.value = 500;
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          oscillator.frequency.setValueAtTime(350, now + 0.35);
          oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.7);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          oscillator.start(now);
          oscillator.stop(now + 0.8);
          break;
          
        default:
          break;
      }
    } catch (e) {
      console.log('Audio not available:', e);
    }
  }, [enabled, getAudioContext]);
  
  return { enabled, setEnabled, playSound };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PWA NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const usePWANotifications = () => {
  const [permission, setPermission] = useState('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);
  
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);
  
  const sendNotification = useCallback((title, options = {}) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      return notification;
    }
    return null;
  }, [permission]);
  
  return { permission, requestPermission, sendNotification };
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const GlassCard = memo(({ 
  children, 
  className = '', 
  glowColor = 'emerald',
  intensity = 'normal',
  hover = true,
  onClick,
  ...props 
}) => {
  const { theme, isDark } = useTheme();
  
  const intensityConfig = {
    subtle: { blur: 'backdrop-blur-sm', opacity: isDark ? 0.02 : 0.6 },
    normal: { blur: 'backdrop-blur-md', opacity: isDark ? 0.03 : 0.7 },
    strong: { blur: 'backdrop-blur-lg', opacity: isDark ? 0.05 : 0.85 },
  };
  
  const config = intensityConfig[intensity];
  
  return (
    <div 
      className={clsx(
        'rounded-2xl border transition-all duration-500',
        config.blur,
        hover && 'hover:shadow-xl',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: isDark 
          ? `rgba(255,255,255,${config.opacity})` 
          : `rgba(255,255,255,${config.opacity})`,
        borderColor: theme.border.primary,
        boxShadow: hover ? `0 0 0 0 ${theme.glow[glowColor]}` : undefined,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT TEXT
// ═══════════════════════════════════════════════════════════════════════════════

const GradientText = memo(({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <span 
      className={clsx('bg-clip-text text-transparent bg-gradient-to-r animate-gradient bg-[length:200%_auto]', className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${theme.accent.emerald}, ${theme.accent.cyan}, ${theme.accent.emerald})`
      }}
    >
      {children}
    </span>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// GLITCH TEXT
// ═══════════════════════════════════════════════════════════════════════════════

const GlitchText = memo(({ text, className = '', active = true }) => {
  const [displayText, setDisplayText] = useState(text);
  
  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      return;
    }
    
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        const chars = text.split('');
        const idx = Math.floor(Math.random() * chars.length);
        chars[idx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        setDisplayText(chars.join(''));
        setTimeout(() => setDisplayText(text), 50);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [text, active]);
  
  return <span className={className}>{displayText}</span>;
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEON RING
// ═══════════════════════════════════════════════════════════════════════════════

const NeonRing = memo(({ progress, size = 120, strokeWidth = 4, colorKey = 'emerald' }) => {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const color = theme.accent[colorKey];
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={theme.border.secondary}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ 
          filter: `drop-shadow(0 0 8px ${color})`,
          transition: 'stroke-dashoffset 0.5s ease'
        }}
      />
    </svg>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// THEME TOGGLE BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeToggle = memo(() => {
  const { theme, isDark, autoTheme, toggleTheme, setAutoTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-3 rounded-xl border transition-all duration-300"
        style={{
          background: theme.bg.card,
          borderColor: theme.border.primary,
          color: theme.text.secondary,
        }}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
      
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div 
            className="absolute right-0 top-full mt-2 p-2 rounded-xl border z-50 min-w-[200px] animate-fadeIn"
            style={{
              background: isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: theme.border.primary,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Theme options */}
            <button
              onClick={() => { setAutoTheme(false); toggleTheme(); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{ color: theme.text.secondary }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm">切换到{isDark ? '浅色' : '深色'}模式</span>
            </button>
            
            <div 
              className="my-2 h-px"
              style={{ background: theme.border.secondary }}
            />
            
            {/* Auto theme toggle */}
            <button
              onClick={() => { setAutoTheme(!autoTheme); setShowMenu(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
              style={{ color: theme.text.secondary }}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4" />
                <span className="text-sm">自动切换</span>
              </div>
              <div 
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ 
                  background: autoTheme ? theme.accent.emerald : theme.border.primary 
                }}
              >
                <div 
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ 
                    transform: autoTheme ? 'translateX(22px)' : 'translateX(2px)' 
                  }}
                />
              </div>
            </button>
            
            {autoTheme && (
              <div 
                className="px-3 py-2 text-xs"
                style={{ color: theme.text.muted }}
              >
                {CONFIG.DAY_START_HOUR}:00 - {CONFIG.NIGHT_START_HOUR}:00 浅色
                <br />
                {CONFIG.NIGHT_START_HOUR}:00 - {CONFIG.DAY_START_HOUR}:00 深色
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAIN COUNTER
// ═══════════════════════════════════════════════════════════════════════════════

const ChainCounter = memo(({ current, longest, purity, totalFocus }) => {
  const { theme, isDark } = useTheme();
  const progress = longest > 0 ? Math.min(100, (current / longest) * 100) : 0;
  const toRecord = longest - current;
  
  const purityColor = purity > 70 ? theme.accent.emerald : purity > 40 ? theme.accent.amber : theme.accent.rose;
  
  return (
    <GlassCard className="p-6" glowColor="emerald">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent.emerald}15` }}
          >
            <Activity className="w-5 h-5" style={{ color: theme.accent.emerald }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
              Chain Status
            </h3>
            <p className="text-xs" style={{ color: theme.text.muted }}>连续专注记录</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-light tracking-tight" style={{ color: theme.text.primary }}>
            #{current}
          </div>
          <div className="text-xs" style={{ color: theme.text.muted }}>当前链条</div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: theme.text.muted }}>距离打破记录</span>
          <span style={{ color: theme.accent.emerald }}>
            {toRecord > 0 ? `还差 ${toRecord} 次` : '🏆 新纪录！'}
          </span>
        </div>
        <div 
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: theme.border.secondary }}
        >
          <div 
            className="h-full rounded-full transition-all duration-700"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${theme.accent.emerald}, ${theme.accent.cyan})`
            }}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '最长记录', value: longest, color: theme.text.primary },
          { label: '纯净度', value: `${purity}%`, color: purityColor },
          { label: '总专注', value: totalFocus, color: theme.text.primary },
        ].map(stat => (
          <div 
            key={stat.label}
            className="text-center p-3 rounded-xl"
            style={{ background: theme.bg.card }}
          >
            <div className="text-xl font-light" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.muted }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM STATUS
// ═══════════════════════════════════════════════════════════════════════════════

const SystemStatus = memo(({ time, runDays, todayCompleted, streak }) => {
  const { theme } = useTheme();
  
  return (
    <GlassCard className="p-6" glowColor="cyan">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${theme.accent.cyan}15` }}
        >
          <Terminal className="w-5 h-5" style={{ color: theme.accent.cyan }} />
        </div>
        <div>
          <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
            System Status
          </h3>
          <p className="text-xs" style={{ color: theme.text.muted }}>系统运行状态</p>
        </div>
      </div>
      
      {/* Time */}
      <div className="text-center mb-6">
        <div 
          className="text-4xl font-extralight tracking-wider font-mono"
          style={{ color: theme.accent.cyan }}
        >
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div className="text-xs mt-1" style={{ color: theme.text.muted }}>
          {time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: '运行天数', value: runDays, color: theme.text.tertiary },
          { icon: Check, label: '今日完成', value: todayCompleted, color: theme.accent.emerald },
          { icon: Flame, label: '连续天数', value: streak, color: theme.accent.amber },
        ].map(stat => (
          <div 
            key={stat.label}
            className="text-center p-2 rounded-lg"
            style={{ background: theme.bg.card }}
          >
            <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-lg font-light" style={{ color: theme.text.primary }}>{stat.value}</div>
            <div className="text-[9px] uppercase" style={{ color: theme.text.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRECEDENT DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

const PrecedentDatabase = memo(({ exceptions, failures, purity }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const totalUsage = useMemo(() => 
    exceptions.reduce((sum, ex) => sum + (ex.usageCount || 0), 0),
    [exceptions]
  );
  
  const purityColor = purity > 70 ? theme.accent.emerald : purity > 40 ? theme.accent.amber : theme.accent.rose;
  
  return (
    <GlassCard className="p-6" glowColor="amber">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent.amber}15` }}
          >
            <History className="w-5 h-5" style={{ color: theme.accent.amber }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
              Precedent Database
            </h3>
            <p className="text-xs" style={{ color: theme.text.muted }}>判例法数据库</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm" style={{ color: theme.accent.amber }}>{exceptions.length} 例外</div>
            <div className="text-xs" style={{ color: theme.text.muted }}>{failures.length} 失败</div>
          </div>
          <ChevronDown 
            className={clsx('w-5 h-5 transition-transform duration-300', expanded && 'rotate-180')}
            style={{ color: theme.text.muted }}
          />
        </div>
      </button>
      
      {expanded && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          {/* Purity meter */}
          <div 
            className="p-4 rounded-xl border"
            style={{ background: theme.bg.card, borderColor: theme.border.secondary }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: theme.text.muted }}>系统纯净度</span>
              <span className="text-sm font-medium" style={{ color: purityColor }}>
                {purity}%
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ background: theme.border.secondary }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${purity}%`, background: purityColor }}
              />
            </div>
          </div>
          
          {/* Exceptions */}
          {exceptions.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>
                合法例外
              </h4>
              <div className="space-y-2">
                {exceptions.map((ex, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      background: `${theme.accent.amber}08`,
                      borderColor: `${theme.accent.amber}20`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" style={{ color: `${theme.accent.amber}90` }} />
                      <div>
                        <div className="text-sm" style={{ color: theme.text.secondary }}>{ex.name}</div>
                        <div className="text-[10px]" style={{ color: theme.text.muted }}>
                          创建于 #{ex.chainAtCreation} · 使用 {ex.usageCount || 0} 次
                        </div>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: theme.text.muted }}>{formatDate(ex.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Failures */}
          {failures.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>
                失败记录
              </h4>
              <div className="space-y-2">
                {failures.slice(-5).reverse().map((fail, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      background: `${theme.accent.rose}08`,
                      borderColor: `${theme.accent.rose}20`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4" style={{ color: `${theme.accent.rose}90` }} />
                      <div>
                        <div className="text-sm" style={{ color: theme.text.secondary }}>
                          链条 #{fail.chainBroken} 断裂
                        </div>
                        <div className="text-[10px]" style={{ color: theme.text.muted }}>{fail.reason}</div>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: theme.text.muted }}>{formatDate(fail.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Summary */}
          <div 
            className="grid grid-cols-3 gap-3 pt-4 border-t"
            style={{ borderColor: theme.border.secondary }}
          >
            {[
              { label: '例外总数', value: exceptions.length, color: theme.accent.amber },
              { label: '失败次数', value: failures.length, color: theme.accent.rose },
              { label: '例外使用', value: totalUsage, color: theme.accent.cyan },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-light" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[9px] uppercase" style={{ color: theme.text.muted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const AchievementBadge = memo(({ achievement, unlocked, unlockedAt }) => {
  const { theme } = useTheme();
  const config = ACHIEVEMENTS[achievement];
  if (!config) return null;
  
  const tierConfig = TIER_CONFIG[config.tier];
  const color = theme.accent[tierConfig.colorKey];
  const Icon = config.icon;
  
  return (
    <div 
      className={clsx(
        'relative p-4 rounded-xl border transition-all duration-300',
        !unlocked && 'opacity-50'
      )}
      style={{
        background: unlocked ? `${color}10` : theme.bg.card,
        borderColor: unlocked ? `${color}30` : theme.border.secondary,
        boxShadow: unlocked ? `0 4px 20px ${color}20` : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: unlocked ? `${color}20` : theme.border.secondary }}
        >
          <Icon className="w-5 h-5" style={{ color: unlocked ? color : theme.text.muted }} />
        </div>
        <div className="flex-1">
          <div 
            className="text-sm font-medium"
            style={{ color: unlocked ? theme.text.primary : theme.text.tertiary }}
          >
            {config.name}
          </div>
          <div className="text-[10px]" style={{ color: theme.text.muted }}>{config.desc}</div>
        </div>
        {unlocked && (
          <CheckCircle2 className="w-5 h-5" style={{ color }} />
        )}
      </div>
      {unlocked && unlockedAt && (
        <div className="text-[9px] mt-2" style={{ color: theme.text.muted }}>
          解锁于 {formatDate(unlockedAt)}
        </div>
      )}
    </div>
  );
});

const AchievementsPanel = memo(({ unlockedAchievements }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;
  
  return (
    <GlassCard className="p-6" glowColor="purple">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent.purple}15` }}
          >
            <Award className="w-5 h-5" style={{ color: theme.accent.purple }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>Achievements</h3>
            <p className="text-xs" style={{ color: theme.text.muted }}>成就系统</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm" style={{ color: theme.accent.purple }}>{unlockedCount}/{totalCount}</div>
          <ChevronDown 
            className={clsx('w-5 h-5 transition-transform duration-300', expanded && 'rotate-180')}
            style={{ color: theme.text.muted }}
          />
        </div>
      </button>
      
      {expanded && (
        <div className="mt-6 space-y-3 animate-fadeIn">
          {Object.entries(ACHIEVEMENTS).map(([key]) => (
            <AchievementBadge 
              key={key}
              achievement={key}
              unlocked={!!unlockedAchievements[key]}
              unlockedAt={unlockedAchievements[key]?.unlockedAt}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

const SacredSwitch = memo(({ onActivate, disabled, currentChain, exceptions }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative">
      {/* Glow */}
      <div 
        className={clsx(
          'absolute inset-0 rounded-2xl transition-all duration-700 blur-xl',
          isHovered && !disabled ? 'scale-105' : ''
        )}
        style={{
          background: isHovered && !disabled ? theme.glow.emerald : 'transparent'
        }}
      />
      
      <button
        onClick={onActivate}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'relative w-full py-8 px-6 rounded-2xl font-medium transition-all duration-500',
          'border-2 backdrop-blur-sm',
          disabled && 'cursor-not-allowed'
        )}
        style={{
          background: disabled ? theme.bg.card : `${theme.accent.emerald}10`,
          borderColor: disabled ? theme.border.secondary : `${theme.accent.emerald}40`,
          color: disabled ? theme.text.muted : theme.accent.emerald,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={{ 
              background: disabled ? theme.border.secondary : `${theme.accent.emerald}20`,
              transform: isHovered && !disabled ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <Crosshair 
              className="w-8 h-8" 
              style={{ color: disabled ? theme.text.muted : theme.accent.emerald }}
            />
          </div>
          
          <div className="text-center">
            <div className="text-xl tracking-wide mb-1">启动专注模式</div>
            <div style={{ color: disabled ? theme.text.muted : `${theme.accent.emerald}90` }}>
              Chain #{currentChain + 1}
            </div>
          </div>
          
          {exceptions.length > 0 && !disabled && (
            <div className="flex flex-wrap gap-2 justify-center">
              {exceptions.slice(0, 3).map((ex, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 rounded-lg text-[10px]"
                  style={{ background: theme.border.secondary, color: theme.text.muted }}
                >
                  {ex.name}
                </span>
              ))}
              {exceptions.length > 3 && (
                <span 
                  className="px-2 py-1 rounded-lg text-[10px]"
                  style={{ background: theme.border.secondary, color: theme.text.muted }}
                >
                  +{exceptions.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELAY PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

const DelayProtocol = memo(({ onLaunch, onActivate, active, timeRemaining, disabled }) => {
  const { theme } = useTheme();
  const urgency = timeRemaining < 180;
  const progress = ((CONFIG.DELAY_PROTOCOL_TIME - timeRemaining) / CONFIG.DELAY_PROTOCOL_TIME) * 100;
  
  const color = urgency ? theme.accent.rose : theme.accent.amber;
  
  if (active) {
    return (
      <div 
        className={clsx('relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300', urgency && 'animate-pulse')}
        style={{
          background: `${color}10`,
          borderColor: `${color}50`,
        }}
      >
        {/* Progress background */}
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{ 
            width: `${progress}%`,
            background: `${color}08`
          }}
        />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 animate-pulse" style={{ color }} />
              <span className="text-sm uppercase tracking-wider" style={{ color: theme.text.tertiary }}>
                Delay Protocol Active
              </span>
            </div>
            <span 
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: `${color}20`, color }}
            >
              {urgency ? 'URGENT' : 'COUNTING'}
            </span>
          </div>
          
          <div className="text-center mb-6">
            <div 
              className="text-6xl font-extralight tracking-tighter font-mono"
              style={{ color }}
            >
              T-{formatTime(timeRemaining)}
            </div>
            <p className="text-sm mt-3" style={{ color: theme.text.muted }}>
              倒计时结束前必须启动，否则触发审判
            </p>
          </div>
          
          <button
            onClick={onActivate}
            className="w-full py-4 rounded-xl font-medium transition-all duration-300"
            style={{
              background: urgency ? theme.accent.rose : theme.accent.emerald,
              color: 'white'
            }}
          >
            立即启动专注模式
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={onLaunch}
      disabled={disabled}
      className="w-full py-5 px-6 rounded-2xl transition-all duration-300 border"
      style={{
        background: theme.bg.card,
        borderColor: theme.border.primary,
        color: disabled ? theme.text.muted : theme.text.tertiary,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <Zap className="w-5 h-5" />
        <span className="text-sm tracking-wide">预约启动 (T-15:00)</span>
      </div>
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRIBUNAL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const TribunalModal = memo(({ 
  isOpen, violation, currentChain, exceptions, purity,
  onAdmitDefeat, onModifyLaw, onClose 
}) => {
  const { theme, isDark } = useTheme();
  const [customException, setCustomException] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const predefinedExceptions = [
    { id: 'drink', name: '饮水', icon: Coffee },
    { id: 'bathroom', name: '上厕所', icon: Clock },
    { id: 'emergency', name: '紧急电话', icon: Bell },
    { id: 'page_leave', name: '离开页面', icon: Eye },
  ].filter(e => !exceptions.some(ex => ex.name === e.name));
  
  const handleModifyLaw = (name) => {
    onModifyLaw(name);
    setCustomException('');
    setShowCustomInput(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg animate-scaleIn">
        <div 
          className="rounded-2xl border-2 overflow-hidden"
          style={{
            background: isDark ? 'rgba(20,20,30,0.98)' : 'rgba(255,255,255,0.98)',
            borderColor: `${theme.accent.rose}50`,
          }}
        >
          {/* Header */}
          <div 
            className="px-6 py-5 border-b"
            style={{ 
              background: `${theme.accent.rose}10`,
              borderColor: `${theme.accent.rose}20`
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${theme.accent.rose}20` }}
              >
                <AlertTriangle className="w-6 h-6 animate-pulse" style={{ color: theme.accent.rose }} />
              </div>
              <div>
                <h2 className="text-xl font-medium" style={{ color: theme.text.primary }}>审 判 庭</h2>
                <p className="text-sm" style={{ color: theme.text.muted }}>The Tribunal</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Violation info */}
            <div 
              className="p-4 rounded-xl border"
              style={{ background: theme.bg.card, borderColor: theme.border.secondary }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: theme.text.muted }}>
                违规事项
              </div>
              <div className="font-medium" style={{ color: theme.text.primary }}>
                {violation?.reason || '专注模式中断'}
              </div>
              {violation?.duration && (
                <div className="text-sm mt-1" style={{ color: theme.text.muted }}>
                  已持续: {Math.floor(violation.duration / 60)}分{violation.duration % 60}秒
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="space-y-4">
              {/* Admit defeat */}
              <button
                onClick={onAdmitDefeat}
                className="w-full p-5 rounded-xl border-2 text-left group transition-all duration-300"
                style={{
                  background: `${theme.accent.rose}05`,
                  borderColor: `${theme.accent.rose}30`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: `${theme.accent.rose}10` }}
                  >
                    <X className="w-6 h-6" style={{ color: theme.accent.rose }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium mb-1" style={{ color: theme.accent.rose }}>
                      承认失败
                    </div>
                    <div className="text-sm" style={{ color: theme.text.tertiary }}>
                      链条归零，从 #1 重新开始
                    </div>
                    <div className="text-xs mt-2 font-mono" style={{ color: `${theme.accent.rose}80` }}>
                      Chain #{currentChain} → #0
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Modify law */}
              <div 
                className="p-5 rounded-xl border-2"
                style={{
                  background: `${theme.accent.amber}05`,
                  borderColor: `${theme.accent.amber}30`,
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.accent.amber}10` }}
                  >
                    <AlertCircle className="w-6 h-6" style={{ color: theme.accent.amber }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium mb-1" style={{ color: theme.accent.amber }}>
                      修改法律
                    </div>
                    <div className="text-sm" style={{ color: theme.text.tertiary }}>
                      将此行为设为永久合法例外
                    </div>
                    <div className="text-xs mt-2" style={{ color: `${theme.accent.amber}80` }}>
                      纯净度: {purity}% → {Math.max(0, purity - CONFIG.PURITY_REDUCTION_PER_EXCEPTION)}%
                    </div>
                  </div>
                </div>
                
                {/* Predefined */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {predefinedExceptions.map(ex => {
                    const Icon = ex.icon;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => handleModifyLaw(ex.name)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200"
                        style={{
                          background: theme.bg.card,
                          borderColor: theme.border.secondary,
                          color: theme.text.secondary,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{ex.name}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom */}
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customException}
                      onChange={(e) => setCustomException(e.target.value)}
                      placeholder="输入自定义例外..."
                      className="flex-1 px-4 py-3 rounded-xl border text-sm"
                      style={{
                        background: theme.bg.card,
                        borderColor: theme.border.secondary,
                        color: theme.text.primary,
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => customException.trim() && handleModifyLaw(customException.trim())}
                      disabled={!customException.trim()}
                      className="px-5 py-3 rounded-xl font-medium text-sm transition-colors"
                      style={{
                        background: theme.accent.amber,
                        color: 'black',
                        opacity: customException.trim() ? 1 : 0.5,
                      }}
                    >
                      确认
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full px-4 py-3 rounded-xl border border-dashed text-sm transition-all"
                    style={{
                      borderColor: theme.border.primary,
                      color: theme.text.muted,
                    }}
                  >
                    + 自定义例外
                  </button>
                )}
              </div>
            </div>
            
            {/* History */}
            {exceptions.length > 0 && (
              <div 
                className="pt-4 border-t"
                style={{ borderColor: theme.border.secondary }}
              >
                <div className="text-xs uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>
                  历史判例
                </div>
                <div className="space-y-2">
                  {exceptions.slice(-3).map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span style={{ color: theme.text.tertiary }}>
                        #{ex.chainAtCreation} · 「{ex.name}」
                      </span>
                      <span style={{ color: theme.text.muted }}>{formatDate(ex.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS MODE OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

const FocusModeOverlay = memo(({ 
  active, chainNumber, taskName, timeRemaining, isBreak,
  onInterrupt, onComplete, onToggleBreak
}) => {
  const { theme, isDark } = useTheme();
  const [showInterruptWarning, setShowInterruptWarning] = useState(false);
  
  if (!active) return null;
  
  const totalTime = isBreak ? CONFIG.BREAK_TIME : CONFIG.FOCUS_TIME;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const color = isBreak ? theme.accent.cyan : theme.accent.emerald;
  
  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: isDark ? '#0a0a0f' : '#f8fafc' }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`
          }}
        />
      </div>
      
      {/* Top bar */}
      <div 
        className="relative flex items-center justify-between px-8 py-6 border-b"
        style={{ borderColor: theme.border.secondary }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: color }}
          />
          <span 
            className="text-sm uppercase tracking-widest"
            style={{ color: theme.text.muted }}
          >
            {isBreak ? 'Break Mode' : 'Focus Mode'} · Chain #{chainNumber}
          </span>
        </div>
        
        <button
          onClick={() => setShowInterruptWarning(true)}
          className="px-5 py-2 rounded-xl border text-sm transition-colors"
          style={{
            borderColor: `${theme.accent.rose}30`,
            color: theme.accent.rose,
          }}
        >
          紧急中断
        </button>
      </div>
      
      {/* Main */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8">
        {/* Timer ring */}
        <div className="relative mb-8">
          <NeonRing 
            progress={progress} 
            size={280} 
            strokeWidth={4} 
            colorKey={isBreak ? 'cyan' : 'emerald'}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-7xl font-extralight tracking-tighter font-mono"
              style={{ color }}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        
        {/* Task */}
        <div className="text-center mb-12">
          <div className="text-2xl font-light mb-2" style={{ color: theme.text.primary }}>
            {taskName || '专注中...'}
          </div>
          <div className="text-sm" style={{ color: theme.text.muted }}>
            {isBreak ? '休息一下，准备下一轮' : '保持专注，完成目标'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onToggleBreak}
            className="px-8 py-4 rounded-xl border transition-all"
            style={{
              borderColor: isBreak ? `${theme.accent.emerald}40` : `${theme.accent.cyan}40`,
              color: isBreak ? theme.accent.emerald : theme.accent.cyan,
            }}
          >
            {isBreak ? '跳过休息' : '需要休息'}
          </button>
          
          <button
            onClick={onComplete}
            className="px-8 py-4 rounded-xl font-medium transition-all"
            style={{
              background: theme.accent.emerald,
              color: isDark ? 'black' : 'white',
            }}
          >
            完成任务
          </button>
        </div>
      </div>
      
      {/* Interrupt warning */}
      {showInterruptWarning && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <div 
            className="max-w-sm p-6 rounded-2xl border"
            style={{
              background: isDark ? 'rgba(20,20,30,0.98)' : 'rgba(255,255,255,0.98)',
              borderColor: theme.border.primary,
            }}
          >
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `${theme.accent.rose}10` }}
              >
                <AlertTriangle className="w-8 h-8" style={{ color: theme.accent.rose }} />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: theme.text.primary }}>
                确认中断？
              </h3>
              <p className="text-sm" style={{ color: theme.text.tertiary }}>
                中断专注模式将触发审判庭
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInterruptWarning(false)}
                className="flex-1 py-3 rounded-xl border transition-colors"
                style={{
                  borderColor: theme.border.primary,
                  color: theme.text.secondary,
                }}
              >
                继续专注
              </button>
              <button
                onClick={() => {
                  setShowInterruptWarning(false);
                  onInterrupt();
                }}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{
                  background: theme.accent.rose,
                  color: 'white',
                }}
              >
                确认中断
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION ITEM & QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

const MissionItem = memo(({ mission, isActive, onStart, onComplete, onDelete }) => {
  const { theme } = useTheme();
  const config = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG[PRIORITY.NORMAL];
  const color = theme.accent[config.colorKey] || theme.text.muted;
  
  return (
    <div 
      className={clsx(
        'group relative p-4 rounded-xl border transition-all duration-300',
        isActive && 'shadow-lg'
      )}
      style={{
        background: isActive ? `${theme.accent.emerald}08` : theme.bg.card,
        borderColor: isActive ? `${theme.accent.emerald}30` : theme.border.secondary,
      }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="px-2 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider border"
          style={{
            background: `${color}10`,
            borderColor: `${color}30`,
            color,
          }}
        >
          {config.label}
        </div>
        
        <div className="flex-1 min-w-0">
          <div style={{ color: theme.text.primary }}>{mission.text}</div>
          {mission.estimatedTime && (
            <div className="flex items-center gap-1 text-xs mt-1" style={{ color: theme.text.muted }}>
              <Timer className="w-3 h-3" />
              <span>预计 {mission.estimatedTime} 分钟</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isActive && (
            <button
              onClick={onStart}
              className="p-2 rounded-lg transition-colors"
              style={{ color: theme.accent.emerald }}
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onComplete}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.accent.emerald }}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.accent.rose }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {isActive && (
        <div 
          className="absolute left-0 top-4 bottom-4 w-1 rounded-r"
          style={{ background: theme.accent.emerald }}
        />
      )}
    </div>
  );
});

const MissionQueue = memo(({ missions, activeMissionId, onStart, onComplete, onDelete }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: theme.text.muted }}>
            Mission Queue
          </span>
        </div>
        <span className="text-xs" style={{ color: theme.text.muted }}>{missions.length} 任务</span>
      </div>
      
      {missions.length === 0 ? (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: theme.bg.card }}
          >
            <Terminal className="w-8 h-8" style={{ color: theme.text.muted }} />
          </div>
          <p className="text-sm" style={{ color: theme.text.muted }}>任务队列为空</p>
          <p className="text-xs mt-1" style={{ color: theme.text.muted }}>添加任务开始专注</p>
        </div>
      ) : (
        <div className="space-y-2">
          {missions.map(mission => (
            <MissionItem
              key={mission.id}
              mission={mission}
              isActive={mission.id === activeMissionId}
              onStart={() => onStart(mission.id)}
              onComplete={() => onComplete(mission.id)}
              onDelete={() => onDelete(mission.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADD MISSION FORM
// ═══════════════════════════════════════════════════════════════════════════════

const AddMissionForm = memo(({ onAdd }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(PRIORITY.NORMAL);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onAdd({
      id: generateId(),
      text: text.trim(),
      priority,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
      createdAt: new Date()
    });
    
    setText('');
    setEstimatedTime('');
    setExpanded(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="添加新任务..."
          className="flex-1 px-5 py-4 rounded-xl border transition-all duration-300"
          style={{
            background: theme.bg.card,
            borderColor: theme.border.primary,
            color: theme.text.primary,
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-5 py-4 rounded-xl font-medium transition-all"
          style={{
            background: theme.accent.emerald,
            color: 'white',
            opacity: text.trim() ? 1 : 0.3,
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {expanded && (
        <div className="flex flex-wrap gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: theme.text.muted }}>优先级:</span>
            <div className="flex gap-1">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                const color = theme.accent[config.colorKey] || theme.text.muted;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all border"
                    style={{
                      background: priority === key ? `${color}15` : 'transparent',
                      borderColor: priority === key ? `${color}40` : 'transparent',
                      color: priority === key ? color : theme.text.muted,
                    }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: theme.text.muted }}>预计:</span>
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="分钟"
              className="w-20 px-3 py-1.5 rounded-lg border text-xs"
              style={{
                background: theme.bg.card,
                borderColor: theme.border.secondary,
                color: theme.text.secondary,
              }}
            />
          </div>
        </div>
      )}
    </form>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETED MISSIONS
// ═══════════════════════════════════════════════════════════════════════════════

const CompletedMissions = memo(({ missions, onDelete }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  if (missions.length === 0) return null;
  
  return (
    <div 
      className="pt-6 mt-6 border-t"
      style={{ borderColor: theme.border.secondary }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full transition-colors"
        style={{ color: theme.text.muted }}
      >
        <ChevronRight 
          className={clsx('w-4 h-4 transition-transform duration-200', expanded && 'rotate-90')}
        />
        <CheckCircle2 className="w-4 h-4" style={{ color: `${theme.accent.emerald}70` }} />
        <span className="text-xs uppercase tracking-wider">Completed</span>
        <span className="text-xs">({missions.length})</span>
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-2 animate-fadeIn">
          {missions.map(mission => (
            <div 
              key={mission.id}
              className="group flex items-center gap-3 p-3 rounded-lg"
              style={{ background: theme.bg.card }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: `${theme.accent.emerald}50` }} />
              <span 
                className="flex-1 line-through text-sm"
                style={{ color: theme.text.muted }}
              >
                {mission.text}
              </span>
              <span className="text-xs" style={{ color: theme.text.muted }}>
                {formatDateTime(mission.completedAt)}
              </span>
              <button
                onClick={() => onDelete(mission.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: theme.accent.rose }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY TREE (Simplified for space)
// ═══════════════════════════════════════════════════════════════════════════════

const PolicyNodeIcon = memo(({ icon, className, style }) => {
  const icons = {
    hexagon: Hexagon, sun: Sun, coffee: Coffee, activity: Activity,
    brain: Brain, edit: Terminal, clipboard: Layers, target: Target,
    sparkles: Sparkles, heart: Activity, zap: Zap,
  };
  const Icon = icons[icon] || Circle;
  return <Icon className={className} style={style} />;
});

const PolicyTreePanel = memo(({ nodes, dailyUnlockUsed, onUnlockNode, onActivateNode }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const activeCount = nodes.filter(n => n.status === 'active').length;
  const unlockedCount = nodes.filter(n => n.status === 'unlocked' || n.status === 'active').length;
  
  const nodesByTier = useMemo(() => {
    const tiers = {};
    nodes.forEach(node => {
      if (!tiers[node.tier]) tiers[node.tier] = [];
      tiers[node.tier].push(node);
    });
    return tiers;
  }, [nodes]);
  
  const canUnlock = useCallback((node) => {
    if (node.status !== 'locked' || dailyUnlockUsed) return false;
    if (!node.parentId) return true;
    const parent = nodes.find(n => n.id === node.parentId);
    return parent && (parent.status === 'active' || parent.status === 'unlocked');
  }, [nodes, dailyUnlockUsed]);
  
  const statusColors = {
    active: theme.accent.emerald,
    unlocked: theme.accent.cyan,
    locked: theme.text.muted,
    failed: theme.accent.rose,
  };
  
  return (
    <GlassCard className="p-6" glowColor="cyan">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent.cyan}15` }}
          >
            <GitBranch className="w-5 h-5" style={{ color: theme.accent.cyan }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
              Policy Focus Tree
            </h3>
            <p className="text-xs" style={{ color: theme.text.muted }}>国策树 · RSIP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm" style={{ color: theme.accent.cyan }}>{activeCount} 激活</div>
            <div className="text-xs" style={{ color: theme.text.muted }}>{unlockedCount}/{nodes.length}</div>
          </div>
          <ChevronDown 
            className={clsx('w-5 h-5 transition-transform', expanded && 'rotate-180')}
            style={{ color: theme.text.muted }}
          />
        </div>
      </button>
      
      {expanded && (
        <div className="mt-6 animate-fadeIn">
          {/* Daily unlock status */}
          <div 
            className="mb-6 p-4 rounded-xl border"
            style={{
              background: dailyUnlockUsed ? `${theme.accent.rose}05` : `${theme.accent.emerald}05`,
              borderColor: dailyUnlockUsed ? `${theme.accent.rose}20` : `${theme.accent.emerald}20`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dailyUnlockUsed ? (
                  <Lock className="w-4 h-4" style={{ color: theme.accent.rose }} />
                ) : (
                  <Unlock className="w-4 h-4" style={{ color: theme.accent.emerald }} />
                )}
                <span className="text-sm" style={{ color: theme.text.secondary }}>
                  {dailyUnlockUsed ? '今日配额已用' : '今日可解锁 1 个节点'}
                </span>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: dailyUnlockUsed ? `${theme.accent.rose}15` : `${theme.accent.emerald}15`,
                  color: dailyUnlockUsed ? theme.accent.rose : theme.accent.emerald,
                }}
              >
                {dailyUnlockUsed ? '0/1' : '1/1'}
              </span>
            </div>
          </div>
          
          {/* Nodes by tier */}
          <div className="space-y-6">
            {Object.entries(nodesByTier).sort(([a], [b]) => a - b).map(([tier, tierNodes]) => (
              <div key={tier}>
                <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>
                  Tier {tier}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tierNodes.map(node => {
                    const color = statusColors[node.status];
                    const canUnlockThis = canUnlock(node);
                    
                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          if (canUnlockThis) onUnlockNode(node.id);
                          else if (node.status === 'unlocked') onActivateNode(node.id);
                        }}
                        disabled={node.status === 'locked' && !canUnlockThis}
                        className={clsx(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          node.status === 'locked' && !canUnlockThis && 'opacity-50 cursor-not-allowed'
                        )}
                        style={{
                          background: `${color}08`,
                          borderColor: `${color}30`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: `${color}15` }}
                          >
                            <PolicyNodeIcon icon={node.icon} className="w-5 h-5" style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium" style={{ color }}>{node.name}</div>
                            <div className="text-[10px]" style={{ color: theme.text.muted }}>{node.description}</div>
                          </div>
                          {node.status === 'locked' && <Lock className="w-4 h-4" style={{ color: theme.text.muted }} />}
                          {node.status === 'active' && <CheckCircle2 className="w-4 h-4" style={{ color }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const SettingsPanel = memo(({ audioEnabled, onAudioToggle, notificationPermission, onRequestNotification }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  return (
    <GlassCard className="p-4" glowColor="none" intensity="subtle">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: theme.text.muted }}>Settings</span>
        </div>
        <ChevronDown 
          className={clsx('w-4 h-4 transition-transform', expanded && 'rotate-180')}
          style={{ color: theme.text.muted }}
        />
      </button>
      
      {expanded && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          {/* Audio */}
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: theme.bg.card }}
          >
            <div className="flex items-center gap-3">
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" style={{ color: theme.accent.emerald }} />
              ) : (
                <VolumeX className="w-4 h-4" style={{ color: theme.text.muted }} />
              )}
              <span className="text-sm" style={{ color: theme.text.secondary }}>音效</span>
            </div>
            <button
              onClick={onAudioToggle}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ background: audioEnabled ? theme.accent.emerald : theme.border.primary }}
            >
              <div 
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: audioEnabled ? 'translateX(26px)' : 'translateX(4px)' }}
              />
            </button>
          </div>
          
          {/* Notifications */}
          <div 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: theme.bg.card }}
          >
            <div className="flex items-center gap-3">
              <Bell 
                className="w-4 h-4" 
                style={{ color: notificationPermission === 'granted' ? theme.accent.emerald : theme.text.muted }}
              />
              <span className="text-sm" style={{ color: theme.text.secondary }}>通知</span>
            </div>
            {notificationPermission === 'granted' ? (
              <span className="text-xs" style={{ color: theme.accent.emerald }}>已启用</span>
            ) : (
              <button
                onClick={onRequestNotification}
                className="text-xs"
                style={{ color: theme.accent.cyan }}
              >
                启用
              </button>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const TacticalControlSystemInner = () => {
  const { theme, isDark } = useTheme();
  const { notify } = useNotifications();
  
  // State
  const [time, setTime] = useState(new Date());
  const [currentChain, setCurrentChain] = useState(0);
  const [longestChain, setLongestChain] = useState(0);
  const [totalFocus, setTotalFocus] = useState(0);
  const [exceptions, setExceptions] = useState([]);
  const [failures, setFailures] = useState([]);
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [activeMissionId, setActiveMissionId] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(CONFIG.FOCUS_TIME);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(CONFIG.BREAK_TIME);
  const [isDelayActive, setIsDelayActive] = useState(false);
  const [delayTimeRemaining, setDelayTimeRemaining] = useState(CONFIG.DELAY_PROTOCOL_TIME);
  const [tribunalOpen, setTribunalOpen] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [policyNodes, setPolicyNodes] = useState(DEFAULT_POLICY_TREE);
  const [dailyUnlockUsed, setDailyUnlockUsed] = useState(false);
  const [achievements, setAchievements] = useState({});
  const [runDays, setRunDays] = useState(1);
  const [streak, setStreak] = useState(1);
  const [todayCompleted, setTodayCompleted] = useState(0);
  
  const { enabled: audioEnabled, setEnabled: setAudioEnabled, playSound } = useAudio();
  const { permission: pwaPermission, requestPermission, sendNotification } = usePWANotifications();
  
  const focusStartTimeRef = useRef(null);
  
  const purity = useMemo(() => calculatePurity(exceptions), [exceptions]);
  const activeMission = useMemo(() => missions.find(m => m.id === activeMissionId), [missions, activeMissionId]);
  
  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Load data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tcs_v3_data');
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentChain(data.currentChain || 0);
        setLongestChain(data.longestChain || 0);
        setTotalFocus(data.totalFocus || 0);
        setExceptions(data.exceptions || []);
        setFailures(data.failures || []);
        setMissions(data.missions || []);
        setCompletedMissions(data.completedMissions || []);
        setPolicyNodes(data.policyNodes || DEFAULT_POLICY_TREE);
        setAchievements(data.achievements || {});
        setRunDays(data.runDays || 1);
        setStreak(data.streak || 1);
        
        const lastDate = data.lastDate;
        const today = new Date().toDateString();
        if (lastDate !== today) {
          setTodayCompleted(0);
          setDailyUnlockUsed(false);
          
          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) setStreak(prev => prev + 1);
          else if (diffDays > 1) setStreak(1);
          
          setRunDays(prev => prev + 1);
        } else {
          setTodayCompleted(data.todayCompleted || 0);
          setDailyUnlockUsed(data.dailyUnlockUsed || false);
        }
      }
    } catch (e) {
      console.error('Load failed:', e);
    }
  }, []);
  
  // Save data
  useEffect(() => {
    try {
      const data = {
        currentChain, longestChain, totalFocus, exceptions, failures,
        missions, completedMissions, policyNodes, achievements,
        runDays, streak, todayCompleted, dailyUnlockUsed,
        lastDate: new Date().toDateString()
      };
      localStorage.setItem('tcs_v3_data', JSON.stringify(data));
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, [currentChain, longestChain, totalFocus, exceptions, failures, missions, 
      completedMissions, policyNodes, achievements, runDays, streak, todayCompleted, dailyUnlockUsed]);
  
  // Focus timer
  useEffect(() => {
    if (!isFocusMode) return;
    
    const timer = setInterval(() => {
      if (isBreakMode) {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBreakMode(false);
            setFocusTimeRemaining(CONFIG.FOCUS_TIME);
            playSound('activate');
            notify.info('休息结束', '准备开始新一轮专注！');
            sendNotification('休息结束', { body: '准备开始新一轮专注！' });
            return CONFIG.BREAK_TIME;
          }
          return prev - 1;
        });
      } else {
        setFocusTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBreakMode(true);
            setBreakTimeRemaining(CONFIG.BREAK_TIME);
            playSound('success');
            notify.success('专注完成！', '休息一下吧');
            sendNotification('专注完成！', { body: '休息一下吧' });
            return CONFIG.FOCUS_TIME;
          }
          if (prev === 60) {
            playSound('warning');
            notify.warning('还剩1分钟', '坚持住！');
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isFocusMode, isBreakMode, playSound, notify, sendNotification]);
  
  // Delay timer
  useEffect(() => {
    if (!isDelayActive) return;
    
    const timer = setInterval(() => {
      setDelayTimeRemaining(prev => {
        if (prev <= 1) {
          setIsDelayActive(false);
          setCurrentViolation({ reason: '预约超时未启动', type: 'delay_timeout' });
          setTribunalOpen(true);
          playSound('failure');
          notify.error('预约超时！', '触发审判庭');
          sendNotification('预约超时！', { body: '触发审判庭' });
          return CONFIG.DELAY_PROTOCOL_TIME;
        }
        if (prev === 180) {
          playSound('warning');
          notify.warning('预约倒计时', '还剩3分钟！');
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isDelayActive, playSound, notify, sendNotification]);
  
  // Achievement checker
  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements = { ...achievements };
      let hasNew = false;
      
      const checks = [
        { key: 'FIRST_FOCUS', condition: totalFocus >= 1 },
        { key: 'CHAIN_10', condition: currentChain >= 10 },
        { key: 'CHAIN_25', condition: currentChain >= 25 },
        { key: 'CHAIN_50', condition: currentChain >= 50 },
        { key: 'CHAIN_100', condition: currentChain >= 100 },
        { key: 'WEEK_STREAK', condition: streak >= 7 },
        { key: 'POLICY_MASTER', condition: policyNodes.filter(n => n.status === 'active' || n.status === 'unlocked').length >= 10 },
        { key: 'PURITY_100', condition: purity === 100 && totalFocus >= 25 },
        { key: 'NO_EXCEPTIONS', condition: exceptions.length === 0 && totalFocus >= 50 },
      ];
      
      checks.forEach(({ key, condition }) => {
        if (condition && !achievements[key]) {
          newAchievements[key] = { unlockedAt: new Date() };
          hasNew = true;
          const achievement = ACHIEVEMENTS[key];
          if (achievement) {
            playSound('unlock');
            notify.achievement(`🏆 ${achievement.name}`, achievement.desc);
          }
        }
      });
      
      if (hasNew) setAchievements(newAchievements);
    };
    
    checkAchievements();
  }, [currentChain, totalFocus, streak, purity, policyNodes, exceptions, achievements, playSound, notify]);
  
  // Handlers
  const handleActivateFocus = useCallback(() => {
    setIsFocusMode(true);
    setIsBreakMode(false);
    setFocusTimeRemaining(CONFIG.FOCUS_TIME);
    setIsDelayActive(false);
    setDelayTimeRemaining(CONFIG.DELAY_PROTOCOL_TIME);
    focusStartTimeRef.current = Date.now();
    playSound('activate');
    notify.success('专注模式启动', `Chain #${currentChain + 1}`);
  }, [playSound, notify, currentChain]);
  
  const handleLaunchDelay = useCallback(() => {
    setIsDelayActive(true);
    setDelayTimeRemaining(CONFIG.DELAY_PROTOCOL_TIME);
    playSound('warning');
    notify.info('预约已启动', '15分钟内必须开始专注');
    sendNotification('预约已启动', { body: '15分钟内必须开始专注' });
  }, [playSound, notify, sendNotification]);
  
  const handleInterruptFocus = useCallback(() => {
    const elapsed = focusStartTimeRef.current 
      ? Math.floor((Date.now() - focusStartTimeRef.current) / 1000) : 0;
    
    setIsFocusMode(false);
    setIsBreakMode(false);
    setCurrentViolation({ reason: '专注模式中断', type: 'focus_interrupt', duration: elapsed });
    setTribunalOpen(true);
    playSound('failure');
    notify.error('专注中断', '触发审判庭');
  }, [playSound, notify]);
  
  const handleCompleteFocus = useCallback(() => {
    setIsFocusMode(false);
    setIsBreakMode(false);
    
    const newChain = currentChain + 1;
    setCurrentChain(newChain);
    setTotalFocus(prev => prev + 1);
    
    if (newChain > longestChain) setLongestChain(newChain);
    
    if (activeMissionId) {
      const mission = missions.find(m => m.id === activeMissionId);
      if (mission) {
        setCompletedMissions(prev => [...prev, { ...mission, completedAt: new Date() }]);
        setMissions(prev => prev.filter(m => m.id !== activeMissionId));
        setTodayCompleted(prev => prev + 1);
      }
      setActiveMissionId(null);
    }
    
    playSound('success');
    notify.success('任务完成！', `Chain #${newChain}`);
    sendNotification('任务完成！', { body: `Chain #${newChain}` });
  }, [currentChain, longestChain, activeMissionId, missions, playSound, notify, sendNotification]);
  
  const handleToggleBreak = useCallback(() => {
    if (isBreakMode) {
      setIsBreakMode(false);
      setFocusTimeRemaining(CONFIG.FOCUS_TIME);
    } else {
      setIsBreakMode(true);
      setBreakTimeRemaining(CONFIG.BREAK_TIME);
    }
  }, [isBreakMode]);
  
  const handleAdmitDefeat = useCallback(() => {
    setFailures(prev => [...prev, { chainBroken: currentChain, date: new Date(), reason: '承认失败' }]);
    setCurrentChain(0);
    setTribunalOpen(false);
    setCurrentViolation(null);
    playSound('failure');
    notify.error('链条断裂', '从头开始');
  }, [currentChain, playSound, notify]);
  
  const handleModifyLaw = useCallback((name) => {
    setExceptions(prev => [...prev, { name, createdAt: new Date(), chainAtCreation: currentChain, usageCount: 0 }]);
    setTribunalOpen(false);
    setCurrentViolation(null);
    playSound('warning');
    notify.warning('法律已修改', `「${name}」现为合法例外`);
  }, [currentChain, playSound, notify]);
  
  const handleAddMission = useCallback((mission) => setMissions(prev => [...prev, mission]), []);
  
  const handleStartMission = useCallback((id) => {
    setActiveMissionId(id);
    handleActivateFocus();
  }, [handleActivateFocus]);
  
  const handleCompleteMission = useCallback((id) => {
    const mission = missions.find(m => m.id === id);
    if (mission) {
      setCompletedMissions(prev => [...prev, { ...mission, completedAt: new Date() }]);
      setMissions(prev => prev.filter(m => m.id !== id));
      setTodayCompleted(prev => prev + 1);
      if (id === activeMissionId) handleCompleteFocus();
    }
  }, [missions, activeMissionId, handleCompleteFocus]);
  
  const handleDeleteMission = useCallback((id) => {
    setMissions(prev => prev.filter(m => m.id !== id));
    if (id === activeMissionId) setActiveMissionId(null);
  }, [activeMissionId]);
  
  const handleDeleteCompletedMission = useCallback((id) => {
    setCompletedMissions(prev => prev.filter(m => m.id !== id));
  }, []);
  
  const handleUnlockNode = useCallback((id) => {
    setPolicyNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'unlocked' } : n));
    setDailyUnlockUsed(true);
    playSound('unlock');
    notify.success('节点已解锁', '明天可以继续解锁');
  }, [playSound, notify]);
  
  const handleActivateNode = useCallback((id) => {
    setPolicyNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'active' } : n));
    playSound('success');
    notify.success('国策已激活', '开始执行！');
  }, [playSound, notify]);
  
  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ 
        background: theme.bg.primary,
        color: theme.text.primary,
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: theme.gradient.orb1 }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: theme.gradient.orb2 }}
        />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(${theme.text.muted} 1px, transparent 1px), linear-gradient(90deg, ${theme.text.muted} 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      {/* Focus overlay */}
      <FocusModeOverlay
        active={isFocusMode}
        chainNumber={currentChain + 1}
        taskName={activeMission?.text}
        timeRemaining={isBreakMode ? breakTimeRemaining : focusTimeRemaining}
        isBreak={isBreakMode}
        onInterrupt={handleInterruptFocus}
        onComplete={handleCompleteFocus}
        onToggleBreak={handleToggleBreak}
      />
      
      {/* Tribunal */}
      <TribunalModal
        isOpen={tribunalOpen}
        violation={currentViolation}
        currentChain={currentChain}
        exceptions={exceptions}
        purity={purity}
        onAdmitDefeat={handleAdmitDefeat}
        onModifyLaw={handleModifyLaw}
        onClose={() => setTribunalOpen(false)}
      />
      
      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl border flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent.emerald}20, ${theme.accent.cyan}20)`,
                  borderColor: theme.border.primary,
                }}
              >
                <Crosshair className="w-6 h-6" style={{ color: theme.accent.emerald }} />
              </div>
              <div>
                <h1 className="text-2xl font-light tracking-tight">
                  <GradientText>Tactical Control System</GradientText>
                </h1>
                <p className="text-sm" style={{ color: theme.text.muted }}>
                  v3.2 · 硬核自律指挥终端
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-light" style={{ color: theme.accent.emerald }}>#{currentChain}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.muted }}>Chain</div>
                </div>
                <div className="w-px h-8" style={{ background: theme.border.primary }} />
                <div className="text-center">
                  <div 
                    className="text-2xl font-light"
                    style={{ color: purity > 70 ? theme.accent.emerald : purity > 40 ? theme.accent.amber : theme.accent.rose }}
                  >
                    {purity}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: theme.text.muted }}>Purity</div>
                </div>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ChainCounter 
              current={currentChain} 
              longest={longestChain} 
              purity={purity}
              totalFocus={totalFocus}
            />
            <SystemStatus 
              time={time}
              runDays={runDays}
              todayCompleted={todayCompleted}
              streak={streak}
            />
            <PrecedentDatabase 
              exceptions={exceptions}
              failures={failures}
              purity={purity}
            />
            <AchievementsPanel unlockedAchievements={achievements} />
            <SettingsPanel
              audioEnabled={audioEnabled}
              onAudioToggle={() => setAudioEnabled(!audioEnabled)}
              notificationPermission={pwaPermission}
              onRequestNotification={requestPermission}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Control panel */}
            <GlassCard className="p-8" glowColor="emerald" intensity="strong">
              <div className="flex items-center gap-3 mb-8">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${theme.accent.emerald}15` }}
                >
                  <Zap className="w-5 h-5" style={{ color: theme.accent.emerald }} />
                </div>
                <div>
                  <h2 className="text-lg font-medium" style={{ color: theme.text.primary }}>Control Panel</h2>
                  <p className="text-xs" style={{ color: theme.text.muted }}>战术控制面板</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <SacredSwitch
                  onActivate={handleActivateFocus}
                  disabled={isFocusMode || isDelayActive}
                  currentChain={currentChain}
                  exceptions={exceptions}
                />
                <DelayProtocol
                  onLaunch={handleLaunchDelay}
                  onActivate={handleActivateFocus}
                  active={isDelayActive}
                  timeRemaining={delayTimeRemaining}
                  disabled={isFocusMode}
                />
              </div>
            </GlassCard>
            
            {/* Missions */}
            <GlassCard className="p-8" glowColor="cyan">
              <AddMissionForm onAdd={handleAddMission} />
              <div className="mt-8">
                <MissionQueue
                  missions={missions}
                  activeMissionId={activeMissionId}
                  onStart={handleStartMission}
                  onComplete={handleCompleteMission}
                  onDelete={handleDeleteMission}
                />
                <CompletedMissions
                  missions={completedMissions}
                  onDelete={handleDeleteCompletedMission}
                />
              </div>
            </GlassCard>
            
            {/* Policy tree */}
            <PolicyTreePanel
              nodes={policyNodes}
              dailyUnlockUsed={dailyUnlockUsed}
              onUnlockNode={handleUnlockNode}
              onActivateNode={handleActivateNode}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer 
          className="mt-12 pt-6 border-t"
          style={{ borderColor: theme.border.secondary }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: theme.text.muted }}>
            <span>Tactical Control System v3.2</span>
            <span>Chain #{currentChain} · Purity {purity}% · Day {runDays}</span>
          </div>
        </footer>
      </div>
      
      {/* Notification container */}
      <NotificationContainer />
      
      {/* Global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-shrink { animation: shrink linear forwards; }
        .animate-gradient { animation: gradient 3s ease infinite; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.3); }
        
        *:focus-visible { outline: 2px solid rgba(16, 185, 129, 0.5); outline-offset: 2px; }
        
        ::selection { background: rgba(16, 185, 129, 0.3); }
      `}</style>
    </div>
  );
};

// Main export with providers
const TacticalControlSystemV3 = () => (
  <ThemeProvider>
    <NotificationProvider>
      <TacticalControlSystemInner />
    </NotificationProvider>
  </ThemeProvider>
);

export default TacticalControlSystemV3;
