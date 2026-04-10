import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Task, Category } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      themeMode: 'system',
      colorTheme: 'blue',
      splashScreenShown: false,
      activeTab: 'inbox',
      isSettingsOpen: false,
      historyRetentionDays: 30,

      setTasks: (tasks: Task[]) => set({ tasks }),
      setCategories: (categories: Category[]) => set({ categories }),

      reorderTasks: (reorderedTasks: Task[]) => {
        set((state) => {
          const newTasks = [...state.tasks];
          reorderedTasks.forEach((task, index) => {
            const existingIndex = newTasks.findIndex(t => t.id === task.id);
            if (existingIndex !== -1) {
              newTasks[existingIndex] = { ...newTasks[existingIndex], order: index };
            }
          });
          return { tasks: newTasks };
        });

        const user = auth.currentUser;
        if (user) {
          reorderedTasks.forEach(async (task, index) => {
            try {
              await updateDoc(doc(db, 'tasks', task.id), { order: index });
            } catch (error) {
              console.error("Error updating task order:", error);
            }
          });
        }
      },

      addTask: async (taskData) => {
        const user = auth.currentUser;
        
        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          ownerId: user ? user.uid : 'local',
          sharedWith: {},
          sharedWithIds: [],
          createdAt: new Date().toISOString(),
        };
        
        // Optimistic update
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        
        if (user) {
          try {
            await setDoc(doc(db, 'tasks', newTask.id), newTask);
          } catch (error) {
            console.error("Error adding task", error);
          }
        }
      },

      updateTask: async (id, updates) => {
        const user = auth.currentUser;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString(), updatedBy: user?.uid || 'local' } : task
          ),
        }));

        if (user) {
          try {
            await updateDoc(doc(db, 'tasks', id), {
              ...updates,
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid
            });
          } catch (error) {
            console.error("Error updating task", error);
          }
        }
      },

      deleteTask: async (id) => {
        const user = auth.currentUser;
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        if (user) {
          try {
            await deleteDoc(doc(db, 'tasks', id));
          } catch (error) {
            console.error("Error deleting task", error);
          }
        }
      },

      toggleTaskCompletion: async (id) => {
        const state = get();
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          get().updateTask(id, { completed: !task.completed });
        }
      },

      duplicateTask: async (id) => {
        const state = get();
        const taskToDuplicate = state.tasks.find((t) => t.id === id);
        const user = auth.currentUser;
        
        if (taskToDuplicate) {
          const duplicatedTask: Task = {
            ...taskToDuplicate,
            id: uuidv4(),
            title: `${taskToDuplicate.title} (Copy)`,
            createdAt: new Date().toISOString(),
            completed: false,
            subtasks: taskToDuplicate.subtasks.map(st => ({ ...st, id: uuidv4(), completed: false })),
            ownerId: user ? user.uid : 'local',
            sharedWith: {},
            sharedWithIds: []
          };
          
          set({ tasks: [...state.tasks, duplicatedTask] });
          
          if (user) {
            try {
              await setDoc(doc(db, 'tasks', duplicatedTask.id), duplicatedTask);
            } catch (error) {
              console.error("Error duplicating task", error);
            }
          }
        }
      },

      addCategory: async (categoryData) => {
        const user = auth.currentUser;

        const newCategory: Category = {
          ...categoryData,
          id: uuidv4(),
          ownerId: user ? user.uid : 'local',
          sharedWith: {},
          sharedWithIds: [],
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({ categories: [...state.categories, newCategory] }));
        
        if (user) {
          try {
            await setDoc(doc(db, 'categories', newCategory.id), newCategory);
          } catch (error) {
            console.error("Error adding category", error);
          }
        }
      },

      updateCategory: async (id, updates) => {
        const user = auth.currentUser;
        
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }));

        if (user) {
          try {
            await updateDoc(doc(db, 'categories', id), updates);
          } catch (error) {
            console.error("Error updating category", error);
          }
        }
      },

      deleteCategory: async (id) => {
        const user = auth.currentUser;
        
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          tasks: state.tasks.map((task) => 
            task.categoryId === id ? { ...task, categoryId: undefined } : task
          )
        }));

        if (user) {
          try {
            await deleteDoc(doc(db, 'categories', id));
          } catch (error) {
            console.error("Error deleting category", error);
          }
        }
      },

      setThemeMode: (mode) => set({ themeMode: mode }),
      setColorTheme: (theme) => set({ colorTheme: theme }),
      setSplashScreenShown: (shown) => set({ splashScreenShown: shown }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setHistoryRetentionDays: (days) => set({ historyRetentionDays: days }),
      
      clearHistory: async () => {
        const state = get();
        const user = auth.currentUser;
        
        const tasksToDelete = state.tasks.filter(t => {
          return t.completed || (t.dueDate && new Date(t.dueDate) < new Date());
        });

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(t => !tasksToDelete.find(td => td.id === t.id)),
        }));

        if (user) {
          try {
            for (const task of tasksToDelete) {
              await deleteDoc(doc(db, 'tasks', task.id));
            }
          } catch (error) {
            console.error("Error clearing history", error);
          }
        }
      },

      autoClearHistory: async () => {
        const state = get();
        const user = auth.currentUser;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - state.historyRetentionDays);
        
        const tasksToDelete = state.tasks.filter(t => {
          if (!t.completed && !t.dueDate) return false;
          const dateToCheck = t.completed ? new Date(t.updatedAt || t.createdAt) : new Date(t.dueDate!);
          return dateToCheck < cutoffDate;
        });

        if (tasksToDelete.length === 0) return;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(t => !tasksToDelete.find(td => td.id === t.id)),
        }));

        if (user) {
          try {
            for (const task of tasksToDelete) {
              await deleteDoc(doc(db, 'tasks', task.id));
            }
          } catch (error) {
            console.error("Error auto-clearing history", error);
          }
        }
      },

      clearCompletedTasks: async () => {
        const state = get();
        const user = auth.currentUser;
        const tasksToDelete = state.tasks.filter(t => t.completed);

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(t => !t.completed),
        }));

        if (user) {
          try {
            for (const task of tasksToDelete) {
              await deleteDoc(doc(db, 'tasks', task.id));
            }
          } catch (error) {
            console.error("Error clearing completed tasks", error);
          }
        }
      },
    }),
    {
      name: 'todo-app-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        categories: state.categories,
        themeMode: state.themeMode,
        colorTheme: state.colorTheme,
        activeTab: state.activeTab,
        historyRetentionDays: state.historyRetentionDays,
      }),
    }
  )
);
