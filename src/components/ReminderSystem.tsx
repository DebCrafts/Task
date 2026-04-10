import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { isPast, isFuture, differenceInSeconds } from 'date-fns';

export function ReminderSystem() {
  const { tasks } = useStore();
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.reminder && !notifiedTasks.current.has(task.id)) {
          const reminderDate = new Date(task.reminder);
          
          // If reminder is in the past (within last minute) or exactly now
          if (isPast(reminderDate) && differenceInSeconds(now, reminderDate) < 60) {
            triggerNotification(task);
            notifiedTasks.current.add(task.id);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (task: any) => {
    // Play sound
    try {
      // Use a simple beep sound using Web Audio API to avoid needing external assets
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Task Reminder', {
        body: task.title,
        icon: '/favicon.ico' // Assuming there's a default favicon
      });
    } else {
      // Fallback to alert if notifications aren't allowed (though alert blocks thread, maybe just console log)
      console.log(`Reminder: ${task.title}`);
    }
  };

  return null;
}
