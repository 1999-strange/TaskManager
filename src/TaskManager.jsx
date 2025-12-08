// ═══════════════════════════════════════════════════════════════════════════════
// 主应用代码开始
// ═══════════════════════════════════════════════════════════════════════════════

import React, { 
  useState, useEffect, useRef, useCallback, memo, createContext, 
  useContext, useMemo
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
  Info, AlertOctagon, PartyPopper, BellRing, Monitor,
  Sliders, Save, RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS - 支持自定义
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  FOCUS_TIME: 25 * 60,           // 默认25分钟
  BREAK_TIME: 5 * 60,            // 默认5分钟
  DELAY_PROTOCOL_TIME: 15 * 60,  // 默认15分钟
  LONG_BREAK_TIME: 15 * 60,      // 长休息15分钟
  SESSIONS_BEFORE_LONG_BREAK: 4, // 4次专注后长休息
  MELTDOWN_THRESHOLD: 3,
  PURITY_REDUCTION_PER_EXCEPTION: 7,
  DAILY_POLICY_LIMIT: 1,
  NOTIFICATION_DURATION: 5000,
  AUTO_THEME_ENABLED: true,
  DAY_START_HOUR: 6,
  NIGHT_START_HOUR: 18,
};

// 时间预设选项
const TIME_PRESETS = {
  focus: [
    { label: '15分钟', value: 15 * 60 },
    { label: '25分钟', value: 25 * 60 },
    { label: '30分钟', value: 30 * 60 },
    { label: '45分钟', value: 45 * 60 },
    { label: '60分钟', value: 60 * 60 },
    { label: '90分钟', value: 90 * 60 },
    { label: '120分钟', value: 120 * 60 },
  ],
  break: [
    { label: '3分钟', value: 3 * 60 },
    { label: '5分钟', value: 5 * 60 },
    { label: '10分钟', value: 10 * 60 },
    { label: '15分钟', value: 15 * 60 },
    { label: '20分钟', value: 20 * 60 },
  ],
  delay: [
    { label: '5分钟', value: 5 * 60 },
    { label: '10分钟', value: 10 * 60 },
    { label: '15分钟', value: 15 * 60 },
    { label: '20分钟', value: 20 * 60 },
    { label: '30分钟', value: 30 * 60 },
  ]
};

const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  NORMAL: 'normal',
  LOW: 'low'
};

// Apple-inspired theme tokens with blue accent
const THEMES = {
  light: {
    name: 'light',
    label: '浅色',
    icon: Sun,
    bg: {
      primary: '#F5F5F7',
      secondary: '#FFFFFF',
      tertiary: '#E8E8ED',
      elevated: 'rgba(255, 255, 255, 0.72)',
      card: 'rgba(255, 255, 255, 0.8)',
      cardHover: 'rgba(255, 255, 255, 0.92)',
      blur: 'rgba(255, 255, 255, 0.65)',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#424245',
      tertiary: '#86868B',
      muted: '#AEAEB2',
      inverse: '#FFFFFF',
    },
    border: {
      primary: 'rgba(0, 0, 0, 0.06)',
      secondary: 'rgba(0, 0, 0, 0.04)',
      focus: 'rgba(0, 122, 255, 0.4)',
    },
    accent: {
      blue: '#007AFF',
      indigo: '#5856D6',
      green: '#34C759',
      orange: '#FF9500',
      red: '#FF3B30',
      teal: '#5AC8FA',
      purple: '#AF52DE',
      pink: '#FF2D55',
    },
    fill: {
      blue: 'rgba(0, 122, 255, 0.12)',
      indigo: 'rgba(88, 86, 214, 0.12)',
      green: 'rgba(52, 199, 89, 0.12)',
      orange: 'rgba(255, 149, 0, 0.12)',
      red: 'rgba(255, 59, 48, 0.12)',
      teal: 'rgba(90, 200, 250, 0.12)',
      purple: 'rgba(175, 82, 222, 0.12)',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
      md: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
      lg: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
      xl: '0 24px 60px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.08)',
      glow: '0 0 40px rgba(0, 122, 255, 0.15)',
    },
  },
  dark: {
    name: 'dark',
    label: '深色',
    icon: Moon,
    bg: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      elevated: 'rgba(44, 44, 46, 0.72)',
      card: 'rgba(44, 44, 46, 0.65)',
      cardHover: 'rgba(58, 58, 60, 0.75)',
      blur: 'rgba(28, 28, 30, 0.72)',
    },
    text: {
      primary: '#F5F5F7',
      secondary: '#A1A1A6',
      tertiary: '#6E6E73',
      muted: '#48484A',
      inverse: '#1D1D1F',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      focus: 'rgba(10, 132, 255, 0.5)',
    },
    accent: {
      blue: '#0A84FF',
      indigo: '#5E5CE6',
      green: '#30D158',
      orange: '#FF9F0A',
      red: '#FF453A',
      teal: '#64D2FF',
      purple: '#BF5AF2',
      pink: '#FF375F',
    },
    fill: {
      blue: 'rgba(10, 132, 255, 0.18)',
      indigo: 'rgba(94, 92, 230, 0.18)',
      green: 'rgba(48, 209, 88, 0.18)',
      orange: 'rgba(255, 159, 10, 0.18)',
      red: 'rgba(255, 69, 58, 0.18)',
      teal: 'rgba(100, 210, 255, 0.18)',
      purple: 'rgba(191, 90, 242, 0.18)',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
      md: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
      lg: '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
      xl: '0 24px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',
      glow: '0 0 60px rgba(10, 132, 255, 0.25)',
    },
  }
};

const PRIORITY_CONFIG = {
  [PRIORITY.CRITICAL]: { label: '紧急', colorKey: 'red' },
  [PRIORITY.HIGH]: { label: '重要', colorKey: 'orange' },
  [PRIORITY.NORMAL]: { label: '普通', colorKey: 'blue' },
  [PRIORITY.LOW]: { label: '低优先', colorKey: 'teal' }
};

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
  bronze: { colorKey: 'orange' },
  silver: { colorKey: 'teal' },
  gold: { colorKey: 'orange' },
  legendary: { colorKey: 'purple' },
};

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

const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle2, colorKey: 'green' },
  warning: { icon: AlertTriangle, colorKey: 'orange' },
  error: { icon: XCircle, colorKey: 'red' },
  info: { icon: Info, colorKey: 'blue' },
  achievement: { icon: Award, colorKey: 'purple' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext(null);
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

const NotificationContext = createContext(null);
const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

const ConfigContext = createContext(null);
const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
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

const formatTimeVerbose = (seconds) => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  if (mins === 0) return `${secs}秒`;
  if (secs === 0) return `${mins}分钟`;
  return `${mins}分${secs}秒`;
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
  const baseReduction = exceptions.length * DEFAULT_CONFIG.PURITY_REDUCTION_PER_EXCEPTION;
  return Math.max(0, 100 - baseReduction);
};

const clsx = (...classes) => classes.filter(Boolean).join(' ');

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= DEFAULT_CONFIG.NIGHT_START_HOUR || hour < DEFAULT_CONFIG.DAY_START_HOUR;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG PROVIDER - 管理自定义时间配置
// ═══════════════════════════════════════════════════════════════════════════════

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('focus_pro_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Config load failed:', e);
    }
    return DEFAULT_CONFIG;
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('focus_pro_config', JSON.stringify(config));
    } catch (e) {
      console.error('Config save failed:', e);
    }
  }, [config]);
  
  const updateConfig = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);
  
  const value = useMemo(() => ({
    config,
    updateConfig,
    resetConfig,
  }), [config, updateConfig, resetConfig]);
  
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('focus_pro_theme');
    if (saved) return saved;
    return isNightTime() ? 'dark' : 'light';
  });
  const [autoTheme, setAutoTheme] = useState(() => {
    const saved = localStorage.getItem('focus_pro_auto_theme');
    return saved !== null ? JSON.parse(saved) : DEFAULT_CONFIG.AUTO_THEME_ENABLED;
  });
  
  const theme = THEMES[themeName];
  const isDark = themeName === 'dark';
  
  useEffect(() => {
    if (!autoTheme) return;
    const checkTime = () => {
      const shouldBeDark = isNightTime();
      setThemeName(shouldBeDark ? 'dark' : 'light');
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [autoTheme]);
  
  useEffect(() => {
    localStorage.setItem('focus_pro_theme', themeName);
    localStorage.setItem('focus_pro_auto_theme', JSON.stringify(autoTheme));
  }, [themeName, autoTheme]);
  
  const toggleTheme = useCallback(() => {
    setThemeName(prev => prev === 'dark' ? 'light' : 'dark');
    setAutoTheme(false);
  }, []);
  
  const value = useMemo(() => ({
    theme, themeName, isDark, autoTheme, setAutoTheme, toggleTheme, setThemeName,
  }), [theme, themeName, isDark, autoTheme, toggleTheme]);
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      type: 'info',
      duration: DEFAULT_CONFIG.NOTIFICATION_DURATION,
      ...notification,
      createdAt: Date.now(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (newNotification.duration > 0) {
      setTimeout(() => removeNotification(id), newNotification.duration);
    }
    
    return id;
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => setNotifications([]), []);
  
  const notify = useMemo(() => ({
    success: (title, message) => addNotification({ type: 'success', title, message }),
    warning: (title, message) => addNotification({ type: 'warning', title, message }),
    error: (title, message) => addNotification({ type: 'error', title, message }),
    info: (title, message) => addNotification({ type: 'info', title, message }),
    achievement: (title, message) => addNotification({ type: 'achievement', title, message, duration: 8000 }),
  }), [addNotification]);
  
  const value = useMemo(() => ({
    notifications, addNotification, removeNotification, clearAll, notify,
  }), [notifications, addNotification, removeNotification, clearAll, notify]);
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE WORKER HOOK - 实时更新支持
// ═══════════════════════════════════════════════════════════════════════════════

const useServiceWorker = () => {
  const [swReady, setSwReady] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker 不支持');
      return;
    }
    
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker 注册成功');
        setSwRegistration(registration);
        setSwReady(true);
      })
      .catch((error) => {
        console.error('Service Worker 注册失败:', error);
      });
    
    const handleMessage = (event) => {
      const { type, data } = event.data;
      switch (type) {
        case 'ACTION_COMPLETE':
          window.dispatchEvent(new CustomEvent('sw-complete'));
          break;
        case 'ACTION_PAUSE':
          window.dispatchEvent(new CustomEvent('sw-pause'));
          break;
        case 'ACTION_START_NOW':
          window.dispatchEvent(new CustomEvent('sw-start-now'));
          break;
        case 'ACTION_CANCEL':
          window.dispatchEvent(new CustomEvent('sw-cancel'));
          break;
        case 'TIME_UP':
          window.dispatchEvent(new CustomEvent('sw-time-up', { detail: data }));
          break;
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const sendToSW = useCallback((type, data = {}) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type, data });
    }
  }, []);
  
  const startFocusNotification = useCallback((timeRemaining, isBreak, chainNumber, taskName) => {
    sendToSW('START_FOCUS', { timeRemaining, isBreak, chainNumber, taskName });
  }, [sendToSW]);
  
  const syncTime = useCallback((timeRemaining, isBreak) => {
    sendToSW('SYNC_TIME', { timeRemaining, isBreak });
  }, [sendToSW]);
  
  const updateState = useCallback((timeRemaining, isBreak, taskName) => {
    sendToSW('UPDATE_STATE', { timeRemaining, isBreak, taskName });
  }, [sendToSW]);
  
  const stopFocusNotification = useCallback(() => {
    sendToSW('STOP_FOCUS');
  }, [sendToSW]);
  
  const completeFocusNotification = useCallback((chainNumber) => {
    sendToSW('COMPLETE_FOCUS', { chainNumber });
  }, [sendToSW]);
  
  const startDelayNotification = useCallback((timeRemaining, chainNumber) => {
    sendToSW('DELAY_START', { timeRemaining, chainNumber });
  }, [sendToSW]);
  
  return {
    swReady,
    swRegistration,
    startFocusNotification,
    syncTime,
    updateState,
    stopFocusNotification,
    completeFocusNotification,
    startDelayNotification
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PWA NOTIFICATIONS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

const usePWANotifications = () => {
  const [permission, setPermission] = useState('default');
  const [isAndroid, setIsAndroid] = useState(false);
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/i.test(userAgent));
    
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
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [200, 100, 200],
            ...options
          });
        });
        return null;
      }
      
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        ...options
      });
      notification.onclick = () => { window.focus(); notification.close(); };
      return notification;
    }
    return null;
  }, [permission]);
  
  return { permission, requestPermission, sendNotification, isAndroid };
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO HOOK
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
          oscillator.frequency.setValueAtTime(440, now);
          oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gainNode.gain.setValueAtTime(0.08, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
        case 'success':
          oscillator.type = 'sine';
          [523.25, 659.25, 783.99].forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, now + i * 0.08);
          });
          gainNode.gain.setValueAtTime(0.08, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          oscillator.start(now);
          oscillator.stop(now + 0.35);
          break;
        case 'warning':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(350, now);
          oscillator.frequency.setValueAtTime(280, now + 0.12);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
        case 'failure':
          oscillator.type = 'sawtooth';
          filter.frequency.value = 600;
          oscillator.frequency.setValueAtTime(180, now);
          oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.4);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;
        case 'unlock':
          oscillator.type = 'sine';
          [523.25, 659.25, 783.99].forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
          });
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
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
// APPLE-STYLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const AppleCard = memo(({ children, className = '', padding = 'normal', hover = true, onClick, ...props }) => {
  const { theme } = useTheme();
  const paddingClasses = { none: '', small: 'p-4', normal: 'p-6', large: 'p-8' };
  
  return (
    <div 
      className={clsx(
        'rounded-2xl backdrop-blur-xl transition-all duration-300',
        paddingClasses[padding],
        hover && 'hover:scale-[1.01]',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      style={{
        background: theme.bg.card,
        boxShadow: theme.shadow.md,
        border: `0.5px solid ${theme.border.primary}`,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

const AppleRing = memo(({ progress, size = 120, strokeWidth = 8, colorKey = 'blue' }) => {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const color = theme.accent[colorKey];
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={`ring-gradient-${colorKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: theme.accent.teal, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.border.secondary} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`url(#ring-gradient-${colorKey})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.3s ease-out' }} />
    </svg>
  );
});

const NotificationToast = memo(({ notification, onDismiss }) => {
  const { theme } = useTheme();
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const Icon = config.icon;
  const accentColor = theme.accent[config.colorKey];
  const fillColor = theme.fill[config.colorKey];
  const [isExiting, setIsExiting] = useState(false);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 280);
  };
  
  return (
    <div className={clsx('relative flex items-start gap-3 p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 ease-out', isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100')} style={{ background: theme.bg.blur, boxShadow: theme.shadow.lg, border: `0.5px solid ${theme.border.primary}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: fillColor }}>
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="font-semibold text-[15px] leading-tight" style={{ color: theme.text.primary }}>{notification.title}</div>
        {notification.message && <div className="text-[13px] mt-0.5 leading-snug" style={{ color: theme.text.tertiary }}>{notification.message}</div>}
      </div>
      <button onClick={handleDismiss} className="p-1 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0" style={{ color: theme.text.muted }}>
        <X className="w-4 h-4" />
      </button>
      {notification.duration > 0 && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden" style={{ background: theme.border.secondary }}>
          <div className="h-full rounded-full animate-shrink" style={{ background: accentColor, animationDuration: `${notification.duration}ms` }} />
        </div>
      )}
    </div>
  );
});

const NotificationContainer = memo(() => {
  const { notifications, removeNotification } = useNotifications();
  
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto animate-slideIn">
          <NotificationToast notification={notification} onDismiss={removeNotification} />
        </div>
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// TIME PICKER COMPONENT - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const TimePicker = memo(({ value, onChange, presets, label, min = 60, max = 7200 }) => {
  const { theme } = useTheme();
  const [showCustom, setShowCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(Math.floor(value / 60));
  const [customSeconds, setCustomSeconds] = useState(value % 60);
  
  const handlePresetClick = (presetValue) => {
    onChange(presetValue);
    setShowCustom(false);
  };
  
  const handleCustomConfirm = () => {
    const totalSeconds = Math.max(min, Math.min(max, customMinutes * 60 + customSeconds));
    onChange(totalSeconds);
    setShowCustom(false);
  };
  
  const isSelected = (presetValue) => value === presetValue;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: theme.text.secondary }}>{label}</span>
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: theme.accent.blue }}>
          {formatTimeVerbose(value)}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className="px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: isSelected(preset.value) ? theme.accent.blue : theme.bg.tertiary,
              color: isSelected(preset.value) ? '#FFFFFF' : theme.text.secondary,
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: showCustom ? theme.fill.blue : theme.bg.tertiary,
            color: showCustom ? theme.accent.blue : theme.text.tertiary,
            border: showCustom ? `1px solid ${theme.accent.blue}` : '1px solid transparent',
          }}
        >
          自定义
        </button>
      </div>
      
      {showCustom && (
        <div className="flex items-center gap-3 p-4 rounded-xl animate-fadeIn" style={{ background: theme.bg.tertiary }}>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 px-3 py-2 rounded-lg text-center text-[15px] font-semibold outline-none"
              style={{ background: theme.bg.secondary, color: theme.text.primary, border: `1px solid ${theme.border.focus}` }}
              min="0"
              max="120"
            />
            <span className="text-[13px]" style={{ color: theme.text.tertiary }}>分</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customSeconds}
              onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-16 px-3 py-2 rounded-lg text-center text-[15px] font-semibold outline-none"
              style={{ background: theme.bg.secondary, color: theme.text.primary, border: `1px solid ${theme.border.focus}` }}
              min="0"
              max="59"
            />
            <span className="text-[13px]" style={{ color: theme.text.tertiary }}>秒</span>
          </div>
          <button
            onClick={handleCustomConfirm}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: theme.accent.blue, color: '#FFFFFF' }}
          >
            确认
          </button>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// THEME TOGGLE - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const ThemeToggle = memo(() => {
  const { theme, isDark, autoTheme, toggleTheme, setAutoTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: theme.bg.elevated, boxShadow: theme.shadow.sm, border: `0.5px solid ${theme.border.primary}` }}
      >
        {isDark ? <Moon className="w-5 h-5" style={{ color: theme.accent.blue }} /> : <Sun className="w-5 h-5" style={{ color: theme.accent.orange }} />}
      </button>
      
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 p-2 rounded-2xl z-50 min-w-[200px] backdrop-blur-xl animate-scaleIn origin-top-right" style={{ background: theme.bg.blur, boxShadow: theme.shadow.xl, border: `0.5px solid ${theme.border.primary}` }}>
            <button onClick={() => { setAutoTheme(false); toggleTheme(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200" style={{ color: theme.text.secondary }}>
              {isDark ? <Sun className="w-5 h-5" style={{ color: theme.accent.orange }} /> : <Moon className="w-5 h-5" style={{ color: theme.accent.blue }} />}
              <span className="text-[15px] font-medium">切换到{isDark ? '浅色' : '深色'}</span>
            </button>
            <div className="my-1.5 mx-3 h-px" style={{ background: theme.border.secondary }} />
            <button onClick={() => { setAutoTheme(!autoTheme); setShowMenu(false); }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200" style={{ color: theme.text.secondary }}>
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5" style={{ color: theme.text.tertiary }} />
                <span className="text-[15px] font-medium">自动切换</span>
              </div>
              <div className="w-12 h-7 rounded-full transition-all duration-300 relative p-0.5" style={{ background: autoTheme ? theme.accent.blue : theme.border.primary }}>
                <div className="w-6 h-6 rounded-full bg-white transition-transform duration-300" style={{ transform: autoTheme ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAIN COUNTER - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const ChainCounter = memo(({ current, longest, purity, totalFocus }) => {
  const { theme } = useTheme();
  const progress = longest > 0 ? Math.min(100, (current / longest) * 100) : 0;
  const toRecord = longest - current;
  const purityColor = purity > 70 ? theme.accent.green : purity > 40 ? theme.accent.orange : theme.accent.red;
  
  return (
    <AppleCard>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.blue }}>
            <Activity className="w-5 h-5" style={{ color: theme.accent.blue }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>专注链</h3>
            <p className="text-[12px]" style={{ color: theme.text.tertiary }}>Chain Status</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light tracking-tight tabular-nums" style={{ color: theme.accent.blue }}>{current}</div>
          <div className="text-[11px] font-medium" style={{ color: theme.text.tertiary }}>当前连击</div>
        </div>
      </div>
      
      <div className="mb-5">
        <div className="flex justify-between text-[12px] mb-2">
          <span style={{ color: theme.text.tertiary }}>距离打破记录</span>
          <span style={{ color: theme.accent.blue }}>{toRecord > 0 ? `还差 ${toRecord} 次` : '🏆 新纪录！'}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.border.secondary }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.accent.blue}, ${theme.accent.teal})` }} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '最长记录', value: longest, color: theme.text.primary },
          { label: '纯净度', value: `${purity}%`, color: purityColor },
          { label: '总专注', value: totalFocus, color: theme.text.primary },
        ].map(stat => (
          <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: theme.bg.tertiary }}>
            <div className="text-xl font-semibold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: theme.text.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM STATUS - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const SystemStatus = memo(({ time, runDays, todayCompleted, streak }) => {
  const { theme } = useTheme();
  
  return (
    <AppleCard>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.indigo }}>
          <Clock className="w-5 h-5" style={{ color: theme.accent.indigo }} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>系统状态</h3>
          <p className="text-[12px]" style={{ color: theme.text.tertiary }}>System Status</p>
        </div>
      </div>
      
      <div className="text-center mb-5 py-4">
        <div className="text-5xl font-extralight tracking-tight tabular-nums" style={{ color: theme.accent.blue }}>
          {time.toLocaleTimeString('zh-CN', { hour12: false })}
        </div>
        <div className="text-[13px] mt-2" style={{ color: theme.text.tertiary }}>
          {time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: '运行天数', value: runDays, color: theme.text.tertiary },
          { icon: Check, label: '今日完成', value: todayCompleted, color: theme.accent.green },
          { icon: Flame, label: '连续天数', value: streak, color: theme.accent.orange },
        ].map(stat => (
          <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: theme.bg.tertiary }}>
            <stat.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: stat.color }} />
            <div className="text-lg font-semibold tabular-nums" style={{ color: theme.text.primary }}>{stat.value}</div>
            <div className="text-[9px] font-medium uppercase tracking-wide" style={{ color: theme.text.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRECEDENT DATABASE - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const PrecedentDatabase = memo(({ exceptions, failures, purity }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const totalUsage = useMemo(() => exceptions.reduce((sum, ex) => sum + (ex.usageCount || 0), 0), [exceptions]);
  const purityColor = purity > 70 ? theme.accent.green : purity > 40 ? theme.accent.orange : theme.accent.red;
  
  return (
    <AppleCard padding="none">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.orange }}>
            <History className="w-5 h-5" style={{ color: theme.accent.orange }} />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>判例数据库</h3>
            <p className="text-[12px]" style={{ color: theme.text.tertiary }}>Precedent Database</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[14px] font-semibold" style={{ color: theme.accent.orange }}>{exceptions.length} 例外</div>
            <div className="text-[12px]" style={{ color: theme.text.muted }}>{failures.length} 失败</div>
          </div>
          <ChevronDown className={clsx('w-5 h-5 transition-transform duration-300', expanded && 'rotate-180')} style={{ color: theme.text.muted }} />
        </div>
      </button>
      
      {expanded && (
        <div className="px-6 pb-6 space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl" style={{ background: theme.bg.tertiary }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium" style={{ color: theme.text.secondary }}>系统纯净度</span>
              <span className="text-[15px] font-semibold" style={{ color: purityColor }}>{purity}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.border.secondary }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${purity}%`, background: purityColor }} />
            </div>
          </div>
          
          {exceptions.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>合法例外</h4>
              <div className="space-y-2">
                {exceptions.map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ background: theme.fill.orange }}>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" style={{ color: theme.accent.orange }} />
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: theme.text.primary }}>{ex.name}</div>
                        <div className="text-[11px]" style={{ color: theme.text.tertiary }}>创建于 #{ex.chainAtCreation} · 使用 {ex.usageCount || 0} 次</div>
                      </div>
                    </div>
                    <div className="text-[12px]" style={{ color: theme.text.muted }}>{formatDate(ex.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {failures.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: theme.text.muted }}>失败记录</h4>
              <div className="space-y-2">
                {failures.slice(-5).reverse().map((fail, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ background: theme.fill.red }}>
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4" style={{ color: theme.accent.red }} />
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: theme.text.primary }}>链条 #{fail.chainBroken} 断裂</div>
                        <div className="text-[11px]" style={{ color: theme.text.tertiary }}>{fail.reason}</div>
                      </div>
                    </div>
                    <div className="text-[12px]" style={{ color: theme.text.muted }}>{formatDate(fail.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: theme.border.secondary }}>
            {[
              { label: '例外总数', value: exceptions.length, color: theme.accent.orange },
              { label: '失败次数', value: failures.length, color: theme.accent.red },
              { label: '例外使用', value: totalUsage, color: theme.accent.blue },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-semibold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[10px] font-medium uppercase" style={{ color: theme.text.muted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS PANEL - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const AchievementBadge = memo(({ achievement, unlocked, unlockedAt }) => {
  const { theme } = useTheme();
  const config = ACHIEVEMENTS[achievement];
  if (!config) return null;
  const tierConfig = TIER_CONFIG[config.tier];
  const color = theme.accent[tierConfig.colorKey];
  const Icon = config.icon;
  
  return (
    <div className={clsx('relative p-4 rounded-xl transition-all duration-300', !unlocked && 'opacity-40')} style={{ background: unlocked ? theme.fill[tierConfig.colorKey] : theme.bg.tertiary, boxShadow: unlocked ? theme.shadow.sm : 'none' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: unlocked ? `${color}25` : theme.border.secondary }}>
          <Icon className="w-5 h-5" style={{ color: unlocked ? color : theme.text.muted }} />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold" style={{ color: unlocked ? theme.text.primary : theme.text.tertiary }}>{config.name}</div>
          <div className="text-[11px]" style={{ color: theme.text.muted }}>{config.desc}</div>
        </div>
        {unlocked && <CheckCircle2 className="w-5 h-5" style={{ color }} />}
      </div>
      {unlocked && unlockedAt && <div className="text-[10px] mt-2 ml-13" style={{ color: theme.text.muted }}>解锁于 {formatDate(unlockedAt)}</div>}
    </div>
  );
});

const AchievementsPanel = memo(({ unlockedAchievements }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;
  
  return (
    <AppleCard padding="none">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.purple }}>
            <Award className="w-5 h-5" style={{ color: theme.accent.purple }} />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>成就</h3>
            <p className="text-[12px]" style={{ color: theme.text.tertiary }}>Achievements</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[14px] font-semibold" style={{ color: theme.accent.purple }}>{unlockedCount}/{totalCount}</div>
          <ChevronDown className={clsx('w-5 h-5 transition-transform duration-300', expanded && 'rotate-180')} style={{ color: theme.text.muted }} />
        </div>
      </button>
      
      {expanded && (
        <div className="px-6 pb-6 space-y-2 animate-fadeIn">
          {Object.entries(ACHIEVEMENTS).map(([key]) => (
            <AchievementBadge key={key} achievement={key} unlocked={!!unlockedAchievements[key]} unlockedAt={unlockedAchievements[key]?.unlockedAt} />
          ))}
        </div>
      )}
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL - Apple Style (with Custom Time Settings)
// ═══════════════════════════════════════════════════════════════════════════════

const SettingsPanel = memo(({ audioEnabled, onAudioToggle, notificationPermission, onRequestNotification }) => {
  const { theme } = useTheme();
  const { config, updateConfig, resetConfig } = useConfig();
  const [expanded, setExpanded] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  
  return (
    <AppleCard padding="none">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: theme.text.muted }}>设置</span>
        </div>
        <ChevronDown className={clsx('w-4 h-4 transition-transform duration-300', expanded && 'rotate-180')} style={{ color: theme.text.muted }} />
      </button>
      
      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: theme.bg.tertiary }}>
            <div className="flex items-center gap-3">
              {audioEnabled ? <Volume2 className="w-5 h-5" style={{ color: theme.accent.blue }} /> : <VolumeX className="w-5 h-5" style={{ color: theme.text.muted }} />}
              <span className="text-[15px] font-medium" style={{ color: theme.text.secondary }}>音效</span>
            </div>
            <button onClick={onAudioToggle} className="w-12 h-7 rounded-full transition-all duration-300 relative p-0.5" style={{ background: audioEnabled ? theme.accent.blue : theme.border.primary }}>
              <div className="w-6 h-6 rounded-full bg-white transition-transform duration-300" style={{ transform: audioEnabled ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: theme.bg.tertiary }}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" style={{ color: notificationPermission === 'granted' ? theme.accent.blue : theme.text.muted }} />
              <span className="text-[15px] font-medium" style={{ color: theme.text.secondary }}>通知</span>
            </div>
            {notificationPermission === 'granted' ? (
              <span className="text-[13px] font-medium px-3 py-1 rounded-full" style={{ background: theme.fill.green, color: theme.accent.green }}>已启用</span>
            ) : (
              <button onClick={onRequestNotification} className="text-[13px] font-semibold px-3 py-1 rounded-full transition-all hover:scale-105" style={{ background: theme.fill.blue, color: theme.accent.blue }}>启用</button>
            )}
          </div>
          
          <button onClick={() => setShowTimeSettings(!showTimeSettings)} className="w-full flex items-center justify-between p-4 rounded-xl transition-all" style={{ background: theme.bg.tertiary }}>
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5" style={{ color: theme.accent.indigo }} />
              <span className="text-[15px] font-medium" style={{ color: theme.text.secondary }}>时间设置</span>
            </div>
            <ChevronRight className={clsx('w-5 h-5 transition-transform duration-200', showTimeSettings && 'rotate-90')} style={{ color: theme.text.muted }} />
          </button>
          
          {showTimeSettings && (
            <div className="p-4 rounded-xl space-y-5 animate-fadeIn" style={{ background: theme.fill.indigo }}>
              <TimePicker
                label="专注时长"
                value={config.FOCUS_TIME}
                onChange={(v) => updateConfig('FOCUS_TIME', v)}
                presets={TIME_PRESETS.focus}
                min={60}
                max={7200}
              />
              
              <div className="h-px" style={{ background: theme.border.secondary }} />
              
              <TimePicker
                label="休息时长"
                value={config.BREAK_TIME}
                onChange={(v) => updateConfig('BREAK_TIME', v)}
                presets={TIME_PRESETS.break}
                min={60}
                max={1800}
              />
              
              <div className="h-px" style={{ background: theme.border.secondary }} />
              
              <TimePicker
                label="预约启动时长"
                value={config.DELAY_PROTOCOL_TIME}
                onChange={(v) => updateConfig('DELAY_PROTOCOL_TIME', v)}
                presets={TIME_PRESETS.delay}
                min={60}
                max={3600}
              />
              
              <div className="h-px" style={{ background: theme.border.secondary }} />
              
              <button onClick={resetConfig} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: theme.bg.secondary, color: theme.text.tertiary }}>
                <RotateCcw className="w-4 h-4" />
                <span className="text-[13px] font-medium">恢复默认设置</span>
              </button>
            </div>
          )}
        </div>
      )}
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SACRED SWITCH (Main Focus Button) - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const SacredSwitch = memo(({ onActivate, disabled, currentChain, exceptions, focusTime }) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={onActivate}
        disabled={disabled}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        className={clsx('relative w-full py-8 px-6 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-xl', disabled ? 'cursor-not-allowed' : 'cursor-pointer', !disabled && !isPressed && 'hover:scale-[1.02]', isPressed && 'scale-[0.98]')}
        style={{
          background: disabled ? theme.bg.tertiary : `linear-gradient(135deg, ${theme.accent.blue}, ${theme.accent.indigo})`,
          boxShadow: disabled ? 'none' : theme.shadow.glow,
          color: disabled ? theme.text.muted : '#FFFFFF',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300" style={{ background: disabled ? theme.border.secondary : 'rgba(255,255,255,0.2)', transform: isPressed ? 'scale(0.95)' : 'scale(1)' }}>
            <Play className="w-8 h-8 ml-1" style={{ color: disabled ? theme.text.muted : '#FFFFFF' }} fill={disabled ? 'transparent' : 'currentColor'} />
          </div>
          
          <div className="text-center">
            <div className="text-xl tracking-wide mb-1">开始专注</div>
            <div className="text-[14px] opacity-80">
              第 {currentChain + 1} 次 · {formatTimeVerbose(focusTime)}
            </div>
          </div>
          
          {exceptions.length > 0 && !disabled && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {exceptions.slice(0, 3).map((ex, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>{ex.name}</span>
              ))}
              {exceptions.length > 3 && <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>+{exceptions.length - 3}</span>}
            </div>
          )}
        </div>
      </button>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELAY PROTOCOL - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const DelayProtocol = memo(({ onLaunch, onActivate, active, timeRemaining, disabled, delayTime }) => {
  const { theme } = useTheme();
  const { config } = useConfig();
  const urgency = timeRemaining < 180;
  const progress = ((config.DELAY_PROTOCOL_TIME - timeRemaining) / config.DELAY_PROTOCOL_TIME) * 100;
  const color = urgency ? theme.accent.red : theme.accent.orange;
  
  if (active) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl transition-all duration-300" style={{ background: urgency ? theme.fill.red : theme.fill.orange, boxShadow: theme.shadow.md }}>
        <div className="absolute inset-0 transition-all duration-1000" style={{ width: `${progress}%`, background: `${color}15` }} />
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: theme.text.secondary }}>预约启动中</span>
            </div>
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: `${color}20`, color }}>{urgency ? '紧急' : '倒计时'}</span>
          </div>
          
          <div className="text-center mb-5">
            <div className="text-5xl font-light tracking-tight tabular-nums" style={{ color }}>{formatTime(timeRemaining)}</div>
            <p className="text-[13px] mt-2" style={{ color: theme.text.tertiary }}>倒计时结束前必须启动</p>
          </div>
          
          <button onClick={onActivate} className="w-full py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" style={{ background: color, color: '#FFFFFF' }}>
            立即开始专注
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button onClick={onLaunch} disabled={disabled} className="w-full py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]" style={{ background: theme.bg.tertiary, color: disabled ? theme.text.muted : theme.text.secondary, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <div className="flex items-center justify-center gap-2">
        <Timer className="w-5 h-5" />
        <span className="text-[15px] font-medium">预约启动 ({formatTimeVerbose(delayTime)})</span>
      </div>
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRIBUNAL MODAL - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const TribunalModal = memo(({ isOpen, violation, currentChain, exceptions, purity, onAdmitDefeat, onModifyLaw, onClose }) => {
  const { theme, isDark } = useTheme();
  const { config } = useConfig();
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
      <div className="absolute inset-0 backdrop-blur-xl" style={{ background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div className="relative w-full max-w-md animate-scaleIn">
        <div className="rounded-3xl overflow-hidden backdrop-blur-xl" style={{ background: theme.bg.blur, boxShadow: theme.shadow.xl, border: `0.5px solid ${theme.border.primary}` }}>
          <div className="px-6 py-5 text-center" style={{ background: theme.fill.red }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${theme.accent.red}25` }}>
              <AlertTriangle className="w-7 h-7" style={{ color: theme.accent.red }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: theme.text.primary }}>专注中断</h2>
            <p className="text-[13px] mt-1" style={{ color: theme.text.tertiary }}>请选择如何处理此次中断</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl" style={{ background: theme.bg.tertiary }}>
              <div className="text-[12px] font-medium uppercase tracking-wide mb-1" style={{ color: theme.text.muted }}>中断原因</div>
              <div className="text-[15px] font-medium" style={{ color: theme.text.primary }}>{violation?.reason || '专注模式中断'}</div>
              {violation?.duration && <div className="text-[13px] mt-1" style={{ color: theme.text.tertiary }}>已专注: {formatTimeVerbose(violation.duration)}</div>}
            </div>
            
            <div className="space-y-3">
              <button onClick={onAdmitDefeat} className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]" style={{ background: theme.fill.red }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: `${theme.accent.red}20` }}>
                    <X className="w-5 h-5" style={{ color: theme.accent.red }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[16px] font-semibold" style={{ color: theme.accent.red }}>承认失败</div>
                    <div className="text-[13px]" style={{ color: theme.text.tertiary }}>链条归零，从头开始</div>
                  </div>
                </div>
              </button>
              
              <div className="p-4 rounded-xl" style={{ background: theme.fill.orange }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: `${theme.accent.orange}20` }}>
                    <AlertCircle className="w-5 h-5" style={{ color: theme.accent.orange }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[16px] font-semibold" style={{ color: theme.accent.orange }}>添加例外</div>
                    <div className="text-[13px]" style={{ color: theme.text.tertiary }}>纯净度: {purity}% → {Math.max(0, purity - DEFAULT_CONFIG.PURITY_REDUCTION_PER_EXCEPTION)}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {predefinedExceptions.map(ex => {
                    const Icon = ex.icon;
                    return (
                      <button key={ex.id} onClick={() => handleModifyLaw(ex.name)} className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ background: theme.bg.secondary, color: theme.text.secondary }}>
                        <Icon className="w-4 h-4" style={{ color: theme.accent.orange }} />
                        <span className="text-[14px] font-medium">{ex.name}</span>
                      </button>
                    );
                  })}
                </div>
                
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input type="text" value={customException} onChange={(e) => setCustomException(e.target.value)} placeholder="输入自定义例外..." className="flex-1 px-4 py-3 rounded-xl text-[14px] outline-none transition-all" style={{ background: theme.bg.secondary, border: `1px solid ${theme.border.focus}`, color: theme.text.primary }} autoFocus />
                    <button onClick={() => customException.trim() && handleModifyLaw(customException.trim())} disabled={!customException.trim()} className="px-5 py-3 rounded-xl font-semibold text-[14px] transition-all" style={{ background: theme.accent.orange, color: '#FFFFFF', opacity: customException.trim() ? 1 : 0.5 }}>确认</button>
                  </div>
                ) : (
                  <button onClick={() => setShowCustomInput(true)} className="w-full px-4 py-3 rounded-xl border-2 border-dashed text-[14px] font-medium transition-all" style={{ borderColor: theme.border.primary, color: theme.text.muted }}>+ 自定义例外</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS MODE OVERLAY - Apple Style  
// ═══════════════════════════════════════════════════════════════════════════════

const FocusModeOverlay = memo(({ active, chainNumber, taskName, timeRemaining, totalTime, isBreak, onInterrupt, onComplete, onToggleBreak }) => {
  const { theme, isDark } = useTheme();
  const [showInterruptWarning, setShowInterruptWarning] = useState(false);
  
  if (!active) return null;
  
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const color = isBreak ? theme.accent.teal : theme.accent.blue;
  
  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: theme.bg.primary }}>
      <div className="absolute inset-0 transition-opacity duration-1000" style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}12 0%, transparent 60%)` }} />
      
      <div className="relative flex items-center justify-between px-8 py-5" style={{ borderBottom: `0.5px solid ${theme.border.primary}` }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: color }} />
          <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: theme.text.tertiary }}>{isBreak ? '休息时间' : '专注模式'} · 第 {chainNumber} 次</span>
        </div>
        <button onClick={() => setShowInterruptWarning(true)} className="px-4 py-2 rounded-full text-[13px] font-medium transition-all hover:scale-105 active:scale-95" style={{ background: theme.fill.red, color: theme.accent.red }}>紧急中断</button>
      </div>
      
      <div className="relative flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative mb-8">
          <AppleRing progress={progress} size={280} strokeWidth={12} colorKey={isBreak ? 'teal' : 'blue'} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl font-extralight tracking-tight tabular-nums" style={{ color }}>{formatTime(timeRemaining)}</div>
          </div>
        </div>
        
        <div className="text-center mb-10">
          <div className="text-2xl font-semibold mb-2" style={{ color: theme.text.primary }}>{taskName || (isBreak ? '休息一下' : '保持专注')}</div>
          <div className="text-[15px]" style={{ color: theme.text.tertiary }}>{isBreak ? '放松身心，准备下一轮' : '全神贯注，完成目标'}</div>
        </div>
        
        <div className="flex gap-4">
          <button onClick={onToggleBreak} className="px-8 py-4 rounded-full font-semibold text-[15px] transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: theme.bg.tertiary, color: theme.text.secondary }}>{isBreak ? '跳过休息' : '需要休息'}</button>
          <button onClick={onComplete} className="px-8 py-4 rounded-full font-semibold text-[15px] transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: `linear-gradient(135deg, ${theme.accent.blue}, ${theme.accent.indigo})`, color: '#FFFFFF', boxShadow: theme.shadow.glow }}>完成任务</button>
        </div>
      </div>
      
      {showInterruptWarning && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-50" style={{ background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-sm w-full p-6 rounded-3xl animate-scaleIn" style={{ background: theme.bg.blur, boxShadow: theme.shadow.xl, border: `0.5px solid ${theme.border.primary}`, backdropFilter: 'blur(40px)' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: theme.fill.red }}>
                <AlertTriangle className="w-8 h-8" style={{ color: theme.accent.red }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>确认中断？</h3>
              <p className="text-[14px]" style={{ color: theme.text.tertiary }}>中断专注将触发审判流程</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInterruptWarning(false)} className="flex-1 py-3.5 rounded-xl font-semibold text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: theme.bg.tertiary, color: theme.text.secondary }}>继续专注</button>
              <button onClick={() => { setShowInterruptWarning(false); onInterrupt(); }} className="flex-1 py-3.5 rounded-xl font-semibold text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: theme.accent.red, color: '#FFFFFF' }}>确认中断</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION COMPONENTS - Apple Style
// ═══════════════════════════════════════════════════════════════════════════════

const MissionItem = memo(({ mission, isActive, onStart, onComplete, onDelete }) => {
  const { theme } = useTheme();
  const config = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG[PRIORITY.NORMAL];
  const color = theme.accent[config.colorKey] || theme.text.muted;
  
  return (
    <div className={clsx('group relative p-4 rounded-xl transition-all duration-300', isActive && 'scale-[1.02]')} style={{ background: isActive ? theme.fill.blue : theme.bg.tertiary, boxShadow: isActive ? theme.shadow.md : 'none' }}>
      <div className="flex items-start gap-4">
        <div className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide" style={{ background: theme.fill[config.colorKey], color }}>{config.label}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium" style={{ color: theme.text.primary }}>{mission.text}</div>
          {mission.estimatedTime && (
            <div className="flex items-center gap-1 text-[12px] mt-1" style={{ color: theme.text.muted }}>
              <Timer className="w-3 h-3" />
              <span>预计 {mission.estimatedTime} 分钟</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isActive && <button onClick={onStart} className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95" style={{ color: theme.accent.blue }}><Play className="w-4 h-4" fill="currentColor" /></button>}
          <button onClick={onComplete} className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95" style={{ color: theme.accent.green }}><Check className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95" style={{ color: theme.accent.red }}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ background: theme.accent.blue }} />}
    </div>
  );
});

const MissionQueue = memo(({ missions, activeMissionId, onStart, onComplete, onDelete }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: theme.text.muted }} />
          <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: theme.text.muted }}>任务队列</span>
        </div>
        <span className="text-[12px] font-medium" style={{ color: theme.text.muted }}>{missions.length} 个任务</span>
      </div>
      
      {missions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: theme.bg.tertiary }}>
            <Target className="w-8 h-8" style={{ color: theme.text.muted }} />
          </div>
          <p className="text-[15px] font-medium" style={{ color: theme.text.tertiary }}>暂无任务</p>
          <p className="text-[13px] mt-1" style={{ color: theme.text.muted }}>添加任务开始专注</p>
        </div>
      ) : (
        <div className="space-y-2">
          {missions.map(mission => (
            <MissionItem key={mission.id} mission={mission} isActive={mission.id === activeMissionId} onStart={() => onStart(mission.id)} onComplete={() => onComplete(mission.id)} onDelete={() => onDelete(mission.id)} />
          ))}
        </div>
      )}
    </div>
  );
});

const AddMissionForm = memo(({ onAdd }) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(PRIORITY.NORMAL);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ id: generateId(), text: text.trim(), priority, estimatedTime: estimatedTime ? parseInt(estimatedTime) : null, createdAt: new Date() });
    setText('');
    setEstimatedTime('');
    setExpanded(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onFocus={() => setExpanded(true)} placeholder="添加新任务..." className="flex-1 px-5 py-4 rounded-xl text-[15px] outline-none transition-all duration-300" style={{ background: theme.bg.tertiary, color: theme.text.primary, border: '1px solid transparent' }} />
        <button type="submit" disabled={!text.trim()} className="px-5 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: text.trim() ? `linear-gradient(135deg, ${theme.accent.blue}, ${theme.accent.indigo})` : theme.bg.tertiary, color: text.trim() ? '#FFFFFF' : theme.text.muted }}>
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {expanded && (
        <div className="flex flex-wrap gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: theme.text.muted }}>优先级:</span>
            <div className="flex gap-1">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                const color = theme.accent[cfg.colorKey] || theme.text.muted;
                return (
                  <button key={key} type="button" onClick={() => setPriority(key)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200" style={{ background: priority === key ? theme.fill[cfg.colorKey] : 'transparent', color: priority === key ? color : theme.text.muted }}>{cfg.label}</button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: theme.text.muted }}>预计:</span>
            <input type="number" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="分钟" className="w-20 px-3 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: theme.bg.tertiary, color: theme.text.secondary }} />
          </div>
        </div>
      )}
    </form>
  );
});

const CompletedMissions = memo(({ missions, onDelete }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  if (missions.length === 0) return null;
  
  return (
    <div className="pt-5 mt-5 border-t" style={{ borderColor: theme.border.secondary }}>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full transition-colors px-1" style={{ color: theme.text.muted }}>
        <ChevronRight className={clsx('w-4 h-4 transition-transform duration-200', expanded && 'rotate-90')} />
        <CheckCircle2 className="w-4 h-4" style={{ color: theme.accent.green }} />
        <span className="text-[12px] font-semibold uppercase tracking-wide">已完成</span>
        <span className="text-[12px]">({missions.length})</span>
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-2 animate-fadeIn">
          {missions.map(mission => (
            <div key={mission.id} className="group flex items-center gap-3 p-3 rounded-xl" style={{ background: theme.bg.tertiary }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent.green }} />
              <span className="flex-1 line-through text-[14px]" style={{ color: theme.text.muted }}>{mission.text}</span>
              <span className="text-[12px]" style={{ color: theme.text.muted }}>{formatDateTime(mission.completedAt)}</span>
              <button onClick={() => onDelete(mission.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all" style={{ color: theme.accent.red }}><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY TREE PANEL - Apple Style (Simplified)
// ═══════════════════════════════════════════════════════════════════════════════

const PolicyNodeIcon = memo(({ icon, className, style }) => {
  const icons = { hexagon: Hexagon, sun: Sun, coffee: Coffee, activity: Activity, brain: Brain, edit: Terminal, clipboard: Layers, target: Target, sparkles: Sparkles, heart: Activity, zap: Zap };
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
  
  const statusConfig = {
    active: { color: theme.accent.green, fill: theme.fill.green },
    unlocked: { color: theme.accent.blue, fill: theme.fill.blue },
    locked: { color: theme.text.muted, fill: theme.bg.tertiary },
    failed: { color: theme.accent.red, fill: theme.fill.red },
  };
  
  return (
    <AppleCard padding="none">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.indigo }}>
            <GitBranch className="w-5 h-5" style={{ color: theme.accent.indigo }} />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-semibold" style={{ color: theme.text.primary }}>习惯树</h3>
            <p className="text-[12px]" style={{ color: theme.text.tertiary }}>Policy Focus Tree</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[14px] font-semibold" style={{ color: theme.accent.indigo }}>{activeCount} 激活</div>
            <div className="text-[12px]" style={{ color: theme.text.muted }}>{unlockedCount}/{nodes.length}</div>
          </div>
          <ChevronDown className={clsx('w-5 h-5 transition-transform duration-300', expanded && 'rotate-180')} style={{ color: theme.text.muted }} />
        </div>
      </button>
      
      {expanded && (
        <div className="px-6 pb-6 animate-fadeIn">
          <div className="mb-5 p-4 rounded-xl" style={{ background: dailyUnlockUsed ? theme.fill.red : theme.fill.green }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dailyUnlockUsed ? <Lock className="w-4 h-4" style={{ color: theme.accent.red }} /> : <Unlock className="w-4 h-4" style={{ color: theme.accent.green }} />}
                <span className="text-[14px] font-medium" style={{ color: theme.text.secondary }}>{dailyUnlockUsed ? '今日配额已用' : '今日可解锁 1 个节点'}</span>
              </div>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: dailyUnlockUsed ? `${theme.accent.red}20` : `${theme.accent.green}20`, color: dailyUnlockUsed ? theme.accent.red : theme.accent.green }}>{dailyUnlockUsed ? '0/1' : '1/1'}</span>
            </div>
          </div>
          
          <div className="space-y-5">
            {Object.entries(nodesByTier).sort(([a], [b]) => a - b).map(([tier, tierNodes]) => (
              <div key={tier}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: theme.text.muted }}>第 {tier} 层</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tierNodes.map(node => {
                    const cfg = statusConfig[node.status];
                    const canUnlockThis = canUnlock(node);
                    return (
                      <button key={node.id} onClick={() => { if (canUnlockThis) onUnlockNode(node.id); else if (node.status === 'unlocked') onActivateNode(node.id); }} disabled={node.status === 'locked' && !canUnlockThis} className={clsx('p-4 rounded-xl text-left transition-all duration-300', node.status === 'locked' && !canUnlockThis && 'opacity-40 cursor-not-allowed', (canUnlockThis || node.status === 'unlocked') && 'hover:scale-[1.02] active:scale-[0.98]')} style={{ background: cfg.fill }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                            <PolicyNodeIcon icon={node.icon} className="w-5 h-5" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold truncate" style={{ color: cfg.color }}>{node.name}</div>
                            <div className="text-[11px] truncate" style={{ color: theme.text.muted }}>{node.description}</div>
                          </div>
                          {node.status === 'locked' && <Lock className="w-4 h-4 flex-shrink-0" style={{ color: theme.text.muted }} />}
                          {node.status === 'active' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />}
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
    </AppleCard>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - 核心修复：基于时间戳的计时器
// ═══════════════════════════════════════════════════════════════════════════════

const FocusProInner = () => {
  const { theme, isDark } = useTheme();
  const { notify } = useNotifications();
  const { config } = useConfig();
  
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
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(config.FOCUS_TIME);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(config.BREAK_TIME);
  const [isDelayActive, setIsDelayActive] = useState(false);
  const [delayTimeRemaining, setDelayTimeRemaining] = useState(config.DELAY_PROTOCOL_TIME);
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
  const { swReady, startFocusNotification, syncTime, updateState, stopFocusNotification, completeFocusNotification, startDelayNotification } = useServiceWorker();
  
  // ⭐ 核心修复：使用 ref 存储时间戳
  const focusStartTimeRef = useRef(null);
  const focusEndTimeRef = useRef(null);
  const delayStartTimeRef = useRef(null);
  const delayEndTimeRef = useRef(null);
  
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
      const saved = localStorage.getItem('focus_pro_data');
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
        
        // ⭐ 恢复进行中的计时器
        if (data.focusInProgress) {
          setIsFocusMode(true);
          setIsBreakMode(data.isBreakMode || false);
          focusStartTimeRef.current = data.focusStartTime;
          focusEndTimeRef.current = data.focusEndTime;
          setActiveMissionId(data.activeMissionId);
        }
        if (data.delayInProgress) {
          setIsDelayActive(true);
          delayStartTimeRef.current = data.delayStartTime;
          delayEndTimeRef.current = data.delayEndTime;
        }
      }
    } catch (e) { console.error('Load failed:', e); }
  }, []);
  
  // Save data
  useEffect(() => {
    try {
      const data = { 
        currentChain, longestChain, totalFocus, exceptions, failures, missions, completedMissions, policyNodes, achievements, runDays, streak, todayCompleted, dailyUnlockUsed, lastDate: new Date().toDateString(),
        // ⭐ 保存计时器状态
        focusInProgress: isFocusMode,
        isBreakMode,
        focusStartTime: focusStartTimeRef.current,
        focusEndTime: focusEndTimeRef.current,
        activeMissionId,
        delayInProgress: isDelayActive,
        delayStartTime: delayStartTimeRef.current,
        delayEndTime: delayEndTimeRef.current,
      };
      localStorage.setItem('focus_pro_data', JSON.stringify(data));
    } catch (e) { console.error('Save failed:', e); }
  }, [currentChain, longestChain, totalFocus, exceptions, failures, missions, completedMissions, policyNodes, achievements, runDays, streak, todayCompleted, dailyUnlockUsed, isFocusMode, isBreakMode, activeMissionId, isDelayActive]);
  
  // ⭐ 核心修复：页面可见性变化时重新计算剩余时间
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        
        // 重新计算专注计时器
        if (isFocusMode && focusEndTimeRef.current) {
          const remaining = Math.max(0, Math.floor((focusEndTimeRef.current - now) / 1000));
          if (isBreakMode) {
            setBreakTimeRemaining(remaining);
          } else {
            setFocusTimeRemaining(remaining);
          }
          
          // 如果时间已到，触发完成
          if (remaining === 0) {
            if (isBreakMode) {
              setIsBreakMode(false);
              setFocusTimeRemaining(config.FOCUS_TIME);
              focusEndTimeRef.current = Date.now() + config.FOCUS_TIME * 1000;
              playSound('activate');
              notify.info('休息结束', '准备开始新一轮专注！');
            } else {
              setIsBreakMode(true);
              setBreakTimeRemaining(config.BREAK_TIME);
              focusEndTimeRef.current = Date.now() + config.BREAK_TIME * 1000;
              playSound('success');
              notify.success('专注完成！', '休息一下吧');
            }
          }
        }
        
        // 重新计算延迟计时器
        if (isDelayActive && delayEndTimeRef.current) {
          const remaining = Math.max(0, Math.floor((delayEndTimeRef.current - now) / 1000));
          setDelayTimeRemaining(remaining);
          
          // 如果时间已到，触发超时
          if (remaining === 0) {
            setIsDelayActive(false);
            setCurrentViolation({ reason: '预约超时未启动', type: 'delay_timeout' });
            setTribunalOpen(true);
            playSound('failure');
            notify.error('预约超时！', '触发审判');
            stopFocusNotification();
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFocusMode, isBreakMode, isDelayActive, config, playSound, notify, stopFocusNotification]);
  
  // Service Worker event listeners
  useEffect(() => {
    const handleComplete = () => { if (isFocusMode) handleCompleteFocus(); };
    const handlePause = () => { if (isFocusMode) handleInterruptFocus(); };
    const handleStartNow = () => { if (isDelayActive) handleActivateFocus(); };
    const handleCancel = () => { 
      setIsDelayActive(false); 
      setDelayTimeRemaining(config.DELAY_PROTOCOL_TIME); 
      delayStartTimeRef.current = null;
      delayEndTimeRef.current = null;
      stopFocusNotification(); 
    };
    const handleTimeUp = (e) => {
      const { isDelay, isBreak: wasBreak } = e.detail || {};
      if (isDelay) {
        setIsDelayActive(false);
        delayStartTimeRef.current = null;
        delayEndTimeRef.current = null;
        setCurrentViolation({ reason: '预约超时未启动', type: 'delay_timeout' });
        setTribunalOpen(true);
        playSound('failure');
      }
    };
    
    window.addEventListener('sw-complete', handleComplete);
    window.addEventListener('sw-pause', handlePause);
    window.addEventListener('sw-start-now', handleStartNow);
    window.addEventListener('sw-cancel', handleCancel);
    window.addEventListener('sw-time-up', handleTimeUp);
    
    return () => {
      window.removeEventListener('sw-complete', handleComplete);
      window.removeEventListener('sw-pause', handlePause);
      window.removeEventListener('sw-start-now', handleStartNow);
      window.removeEventListener('sw-cancel', handleCancel);
      window.removeEventListener('sw-time-up', handleTimeUp);
    };
  }, [isFocusMode, isDelayActive, config.DELAY_PROTOCOL_TIME, stopFocusNotification, playSound]);
  
  // ⭐ 核心修复：基于时间戳的专注计时器
  useEffect(() => {
    if (!isFocusMode || !focusEndTimeRef.current) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((focusEndTimeRef.current - now) / 1000));
      
      if (isBreakMode) {
        setBreakTimeRemaining(remaining);
        if (swReady) syncTime(remaining, true);
        
        if (remaining === 0) {
          setIsBreakMode(false);
          setFocusTimeRemaining(config.FOCUS_TIME);
          focusEndTimeRef.current = now + config.FOCUS_TIME * 1000;
          playSound('activate');
          notify.info('休息结束', '准备开始新一轮专注！');
          if (swReady) updateState(config.FOCUS_TIME, false, activeMission?.text || '专注中...');
        } else if (remaining === 60) {
          playSound('warning');
          notify.warning('还剩1分钟', '休息即将结束');
        }
      } else {
        setFocusTimeRemaining(remaining);
        if (swReady) syncTime(remaining, false);
        
        if (remaining === 0) {
          setIsBreakMode(true);
          setBreakTimeRemaining(config.BREAK_TIME);
          focusEndTimeRef.current = now + config.BREAK_TIME * 1000;
          playSound('success');
          notify.success('专注完成！', '休息一下吧');
          if (swReady) updateState(config.BREAK_TIME, true, '休息时间');
        } else if (remaining === 60) {
          playSound('warning');
          notify.warning('还剩1分钟', '坚持住！');
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isFocusMode, isBreakMode, config, playSound, notify, swReady, syncTime, updateState, activeMission]);
  
  // ⭐ 核心修复：基于时间戳的延迟计时器
  useEffect(() => {
    if (!isDelayActive || !delayEndTimeRef.current) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((delayEndTimeRef.current - now) / 1000));
      
      setDelayTimeRemaining(remaining);
      if (swReady) syncTime(remaining, false);
      
      if (remaining === 0) {
        setIsDelayActive(false);
        delayStartTimeRef.current = null;
        delayEndTimeRef.current = null;
        setCurrentViolation({ reason: '预约超时未启动', type: 'delay_timeout' });
        setTribunalOpen(true);
        playSound('failure');
        notify.error('预约超时！', '触发审判');
        stopFocusNotification();
      } else if (remaining === 180) {
        playSound('warning');
        notify.warning('预约倒计时', '还剩3分钟！');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isDelayActive, config.DELAY_PROTOCOL_TIME, playSound, notify, swReady, syncTime, stopFocusNotification]);
  
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
          if (achievement) { playSound('unlock'); notify.achievement(`🏆 ${achievement.name}`, achievement.desc); }
        }
      });
      if (hasNew) setAchievements(newAchievements);
    };
    checkAchievements();
  }, [currentChain, totalFocus, streak, purity, policyNodes, exceptions, achievements, playSound, notify]);
  
  // ⭐ 核心修复：启动专注时设置结束时间戳
  const handleActivateFocus = useCallback(() => {
    const now = Date.now();
    const endTime = now + config.FOCUS_TIME * 1000;
    
    setIsFocusMode(true);
    setIsBreakMode(false);
    setFocusTimeRemaining(config.FOCUS_TIME);
    setIsDelayActive(false);
    setDelayTimeRemaining(config.DELAY_PROTOCOL_TIME);
    
    focusStartTimeRef.current = now;
    focusEndTimeRef.current = endTime;
    delayStartTimeRef.current = null;
    delayEndTimeRef.current = null;
    
    playSound('activate');
    notify.success('专注模式启动', `第 ${currentChain + 1} 次专注`);
    
    if (swReady && pwaPermission === 'granted') {
      startFocusNotification(config.FOCUS_TIME, false, currentChain + 1, activeMission?.text || '专注中...');
    }
  }, [config, playSound, notify, currentChain, swReady, pwaPermission, startFocusNotification, activeMission]);
  
  // ⭐ 核心修复：启动延迟时设置结束时间戳
  const handleLaunchDelay = useCallback(() => {
    const now = Date.now();
    const endTime = now + config.DELAY_PROTOCOL_TIME * 1000;
    
    setIsDelayActive(true);
    setDelayTimeRemaining(config.DELAY_PROTOCOL_TIME);
    
    delayStartTimeRef.current = now;
    delayEndTimeRef.current = endTime;
    
    playSound('warning');
    notify.info('预约已启动', `${formatTimeVerbose(config.DELAY_PROTOCOL_TIME)}内必须开始专注`);
    
    if (swReady && pwaPermission === 'granted') {
      startDelayNotification(config.DELAY_PROTOCOL_TIME, currentChain + 1);
    }
  }, [config.DELAY_PROTOCOL_TIME, playSound, notify, swReady, pwaPermission, startDelayNotification, currentChain]);
  
  const handleInterruptFocus = useCallback(() => {
    const elapsed = focusStartTimeRef.current ? Math.floor((Date.now() - focusStartTimeRef.current) / 1000) : 0;
    
    setIsFocusMode(false);
    setIsBreakMode(false);
    focusStartTimeRef.current = null;
    focusEndTimeRef.current = null;
    
    setCurrentViolation({ reason: '专注模式中断', type: 'focus_interrupt', duration: elapsed });
    setTribunalOpen(true);
    playSound('failure');
    notify.error('专注中断', '触发审判');
    
    if (swReady) stopFocusNotification();
  }, [playSound, notify, swReady, stopFocusNotification]);
  
  const handleCompleteFocus = useCallback(() => {
    setIsFocusMode(false);
    setIsBreakMode(false);
    focusStartTimeRef.current = null;
    focusEndTimeRef.current = null;
    
    const newChain = currentChain + 1;
    setCurrentChain(newChain);
    setTotalFocus(prev => prev + 1);
    setTodayCompleted(prev => prev + 1);
    
    if (newChain > longestChain) setLongestChain(newChain);
    
    if (activeMissionId) {
      const mission = missions.find(m => m.id === activeMissionId);
      if (mission) {
        setCompletedMissions(prev => [...prev, { ...mission, completedAt: new Date() }]);
        setMissions(prev => prev.filter(m => m.id !== activeMissionId));
      }
      setActiveMissionId(null);
    }
    
    playSound('success');
    notify.success('任务完成！', `第 ${newChain} 次专注`);
    
    if (swReady) completeFocusNotification(newChain);
  }, [currentChain, longestChain, activeMissionId, missions, playSound, notify, swReady, completeFocusNotification]);
  
  const handleToggleBreak = useCallback(() => {
    const now = Date.now();
    
    if (isBreakMode) {
      setIsBreakMode(false);
      setFocusTimeRemaining(config.FOCUS_TIME);
      focusEndTimeRef.current = now + config.FOCUS_TIME * 1000;
      
      if (swReady) updateState(config.FOCUS_TIME, false, activeMission?.text || '专注中...');
    } else {
      setIsBreakMode(true);
      setBreakTimeRemaining(config.BREAK_TIME);
      focusEndTimeRef.current = now + config.BREAK_TIME * 1000;
      
      if (swReady) updateState(config.BREAK_TIME, true, '休息时间');
    }
  }, [isBreakMode, config, swReady, updateState, activeMission]);
  
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
    notify.warning('例外已添加', `「${name}」现为合法例外`);
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
      
      if (id === activeMissionId) {
        handleCompleteFocus();
      }
    } 
  }, [missions, activeMissionId, handleCompleteFocus]);
  
  const handleDeleteMission = useCallback((id) => { 
    setMissions(prev => prev.filter(m => m.id !== id)); 
    if (id === activeMissionId) setActiveMissionId(null); 
  }, [activeMissionId]);
  
  const handleDeleteCompletedMission = useCallback((id) => setCompletedMissions(prev => prev.filter(m => m.id !== id)), []);
  
  const handleUnlockNode = useCallback((id) => { 
    setPolicyNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'unlocked' } : n)); 
    setDailyUnlockUsed(true); 
    playSound('unlock'); 
    notify.success('节点已解锁', '明天可以继续解锁'); 
  }, [playSound, notify]);
  
  const handleActivateNode = useCallback((id) => { 
    setPolicyNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'active' } : n)); 
    playSound('success'); 
    notify.success('习惯已激活', '开始执行！'); 
  }, [playSound, notify]);
  
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: theme.bg.primary, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
      <FocusModeOverlay 
        active={isFocusMode} 
        chainNumber={currentChain + 1} 
        taskName={activeMission?.text} 
        timeRemaining={isBreakMode ? breakTimeRemaining : focusTimeRemaining} 
        totalTime={isBreakMode ? config.BREAK_TIME : config.FOCUS_TIME} 
        isBreak={isBreakMode} 
        onInterrupt={handleInterruptFocus} 
        onComplete={handleCompleteFocus} 
        onToggleBreak={handleToggleBreak} 
      />
      
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
      
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accent.blue}, ${theme.accent.indigo})`, boxShadow: theme.shadow.glow }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight" style={{ color: theme.text.primary }}>Focus Pro</h1>
                <p className="text-[13px]" style={{ color: theme.text.tertiary }}>专注力管理系统</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold tabular-nums" style={{ color: theme.accent.blue }}>{currentChain}</div>
                  <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: theme.text.muted }}>连击</div>
                </div>
                <div className="w-px h-10" style={{ background: theme.border.primary }} />
                <div className="text-center">
                  <div className="text-2xl font-semibold tabular-nums" style={{ color: purity > 70 ? theme.accent.green : purity > 40 ? theme.accent.orange : theme.accent.red }}>{purity}%</div>
                  <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: theme.text.muted }}>纯净度</div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <ChainCounter current={currentChain} longest={longestChain} purity={purity} totalFocus={totalFocus} />
            <SystemStatus time={time} runDays={runDays} todayCompleted={todayCompleted} streak={streak} />
            <PrecedentDatabase exceptions={exceptions} failures={failures} purity={purity} />
            <AchievementsPanel unlockedAchievements={achievements} />
            <SettingsPanel 
              audioEnabled={audioEnabled} 
              onAudioToggle={() => setAudioEnabled(!audioEnabled)} 
              notificationPermission={pwaPermission} 
              onRequestNotification={requestPermission} 
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-5">
            <AppleCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: theme.fill.blue }}>
                  <Zap className="w-5 h-5" style={{ color: theme.accent.blue }} />
                </div>
                <div>
                  <h2 className="text-[17px] font-semibold" style={{ color: theme.text.primary }}>控制中心</h2>
                  <p className="text-[12px]" style={{ color: theme.text.tertiary }}>Control Panel</p>
                </div>
              </div>
              <div className="space-y-4">
                <SacredSwitch 
                  onActivate={handleActivateFocus} 
                  disabled={isFocusMode || isDelayActive} 
                  currentChain={currentChain} 
                  exceptions={exceptions} 
                  focusTime={config.FOCUS_TIME} 
                />
                <DelayProtocol 
                  onLaunch={handleLaunchDelay} 
                  onActivate={handleActivateFocus} 
                  active={isDelayActive} 
                  timeRemaining={delayTimeRemaining} 
                  disabled={isFocusMode} 
                  delayTime={config.DELAY_PROTOCOL_TIME} 
                />
              </div>
            </AppleCard>
            
            <AppleCard>
              <AddMissionForm onAdd={handleAddMission} />
              <div className="mt-6">
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
            </AppleCard>
            
            <PolicyTreePanel 
              nodes={policyNodes} 
              dailyUnlockUsed={dailyUnlockUsed} 
              onUnlockNode={handleUnlockNode} 
              onActivateNode={handleActivateNode} 
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-10 pt-5 border-t text-center" style={{ borderColor: theme.border.secondary }}>
          <p className="text-[12px]" style={{ color: theme.text.muted }}>
            Focus Pro · 连击 #{currentChain} · 纯净度 {purity}% · 第 {runDays} 天
          </p>
        </footer>
      </div>
      
      <NotificationContainer />
      
      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-slideIn { animation: slideIn 0.35s ease-out; }
        .animate-shrink { animation: shrink linear forwards; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.5); }
        *:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3); }
        ::selection { background: rgba(0, 122, 255, 0.2); }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const FocusPro = () => (
  <ConfigProvider>
    <ThemeProvider>
      <NotificationProvider>
        <FocusProInner />
      </NotificationProvider>
    </ThemeProvider>
  </ConfigProvider>
);

export default FocusPro;
