import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthProvider';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { Task, Category } from '../types';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { tasks, setTasks, setCategories, autoClearHistory } = useStore();
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Run auto-cleanup on load
    autoClearHistory();
    
    if (!user) {
      return;
    }

    // Listen to Tasks
    const tasksRef = collection(db, 'tasks');
    const qTasks = query(tasksRef, or(
      where('ownerId', '==', user.uid),
      where('sharedWithIds', 'array-contains', user.uid)
    ));

    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const fetchedTasks: Task[] = [];
      snapshot.forEach(doc => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(fetchedTasks);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.error("Firestore Security Rules are blocking the tasks query.");
      }
    });

    // Listen to Categories
    const catRef = collection(db, 'categories');
    const qCat = query(catRef, or(
      where('ownerId', '==', user.uid),
      where('sharedWithIds', 'array-contains', user.uid)
    ));

    const unsubCat = onSnapshot(qCat, (snapshot) => {
      const fetchedCat: Category[] = [];
      snapshot.forEach(doc => {
        fetchedCat.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(fetchedCat);
    }, (error) => {
      console.error("Error fetching categories:", error);
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.error("Firestore Security Rules are blocking the categories query.");
      }
    });

    return () => {
      unsubTasks();
      unsubCat();
    };
  }, [user, setTasks, setCategories, autoClearHistory]);

  // Reminder check effect
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (!task.completed && task.reminder && !notifiedTasks.current.has(task.id)) {
          const reminderTime = new Date(task.reminder);
          
          // If reminder time is reached (within the last minute to avoid missing it)
          if (reminderTime <= now && now.getTime() - reminderTime.getTime() < 60000) {
            playReminderSound();
            notifiedTasks.current.add(task.id);
            
            // Optional: Show browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification('Task Reminder', {
                body: task.title,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tasks]);

  const playReminderSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // Drop to A4
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Failed to play reminder sound", e);
    }
  };

  return <>{children}</>;
}
