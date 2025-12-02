const SW_CODE = `
// Focus Pro Service Worker - 实时更新版本

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

let focusState = {
  active: false,
  timeRemaining: 0,
  isBreak: false,
  chainNumber: 0,
  taskName: '',
  intervalId: null,
  startTime: null,
  totalDuration: 0
};

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// 实时倒计时
function startCountdown() {
  if (focusState.intervalId) {
    clearInterval(focusState.intervalId);
  }
  
  focusState.startTime = Date.now();
  
  focusState.intervalId = setInterval(() => {
    if (!focusState.active) {
      clearInterval(focusState.intervalId);
      return;
    }
    
    const elapsed = Math.floor((Date.now() - focusState.startTime) / 1000);
    focusState.timeRemaining = Math.max(0, focusState.totalDuration - elapsed);
    
    updateNotification();
    
    // 时间到了
    if (focusState.timeRemaining <= 0) {
      clearInterval(focusState.intervalId);
      notifyTimeUp();
    }
  }, 1000);
}

function stopCountdown() {
  if (focusState.intervalId) {
    clearInterval(focusState.intervalId);
    focusState.intervalId = null;
  }
}

// 监听消息
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_FOCUS':
      focusState = {
        active: true,
        timeRemaining: data.timeRemaining,
        totalDuration: data.timeRemaining,
        isBreak: data.isBreak || false,
        chainNumber: data.chainNumber,
        taskName: data.taskName || '专注中...',
        intervalId: null,
        startTime: null
      };
      startCountdown();
      break;
      
    case 'SYNC_TIME':
      // 从主应用同步时间（保持精确）
      focusState.timeRemaining = data.timeRemaining;
      focusState.totalDuration = data.timeRemaining;
      focusState.isBreak = data.isBreak;
      focusState.startTime = Date.now();
      if (!focusState.intervalId && focusState.active) {
        startCountdown();
      }
      break;
      
    case 'UPDATE_STATE':
      focusState.isBreak = data.isBreak;
      focusState.taskName = data.taskName || focusState.taskName;
      focusState.timeRemaining = data.timeRemaining;
      focusState.totalDuration = data.timeRemaining;
      focusState.startTime = Date.now();
      updateNotification();
      break;
      
    case 'STOP_FOCUS':
      focusState.active = false;
      stopCountdown();
      closeNotifications();
      break;
      
    case 'COMPLETE_FOCUS':
      focusState.active = false;
      stopCountdown();
      showCompletionNotification(data);
      break;
      
    case 'DELAY_START':
      focusState = {
        active: true,
        timeRemaining: data.timeRemaining,
        totalDuration: data.timeRemaining,
        isBreak: false,
        chainNumber: data.chainNumber,
        taskName: '预约启动中',
        isDelay: true,
        intervalId: null,
        startTime: null
      };
      startCountdown();
      break;
  }
});

async function updateNotification() {
  if (!focusState.active) return;
  
  const isDelay = focusState.isDelay;
  const isBreak = focusState.isBreak;
  
  let title, icon;
  if (isDelay) {
    title = '⏰ 预约启动';
    icon = '/icon-delay.png';
  } else if (isBreak) {
    title = '☕ 休息时间';
    icon = '/icon-break.png';
  } else {
    title = '🎯 专注中';
    icon = '/icon-focus.png';
  }
  
  const timeStr = formatTime(focusState.timeRemaining);
  const body = isDelay 
    ? '剩余 ' + timeStr + ' 必须开始'
    : focusState.taskName + ' · 剩余 ' + timeStr;
  
  const progress = Math.round(((focusState.totalDuration - focusState.timeRemaining) / focusState.totalDuration) * 100);
  
  try {
    await self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'focus-timer',
      renotify: false,
      silent: true,
      requireInteraction: true,
      data: {
        timeRemaining: focusState.timeRemaining,
        isBreak: focusState.isBreak,
        isDelay: focusState.isDelay,
        progress: progress
      },
      actions: isDelay ? [
        { action: 'start-now', title: '▶ 立即开始' },
        { action: 'cancel', title: '✕ 取消' }
      ] : [
        { action: 'complete', title: '✓ 完成' },
        { action: 'pause', title: '⏸ 中断' }
      ]
    });
  } catch (error) {
    console.error('通知更新失败:', error);
  }
}

async function closeNotifications() {
  const notifications = await self.registration.getNotifications({ tag: 'focus-timer' });
  notifications.forEach(n => n.close());
}

async function notifyTimeUp() {
  await closeNotifications();
  
  const title = focusState.isDelay ? '⚠️ 预约超时！' : (focusState.isBreak ? '☕ 休息结束' : '🎉 专注完成！');
  const body = focusState.isDelay 
    ? '请立即开始专注或触发审判'
    : (focusState.isBreak ? '准备开始新一轮专注' : '第 ' + focusState.chainNumber + ' 次专注已完成');
  
  await self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'focus-complete',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    data: { type: 'time-up', isDelay: focusState.isDelay, isBreak: focusState.isBreak }
  });
  
  // 通知主应用
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ 
      type: 'TIME_UP', 
      data: { isDelay: focusState.isDelay, isBreak: focusState.isBreak } 
    });
  });
}

async function showCompletionNotification(data) {
  await closeNotifications();
  
  await self.registration.showNotification('🎉 专注完成！', {
    body: '第 ' + data.chainNumber + ' 次专注已完成，太棒了！',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'focus-complete',
    vibrate: [200, 100, 200],
    requireInteraction: false
  });
}

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  
  notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          
          switch (action) {
            case 'complete':
              client.postMessage({ type: 'ACTION_COMPLETE' });
              break;
            case 'pause':
              client.postMessage({ type: 'ACTION_PAUSE' });
              break;
            case 'start-now':
              client.postMessage({ type: 'ACTION_START_NOW' });
              break;
            case 'cancel':
              client.postMessage({ type: 'ACTION_CANCEL' });
              break;
          }
          return;
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
`;