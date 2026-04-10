export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  ownerId: string;
  sharedWith: Record<string, 'edit' | 'view'>; // userId -> role
  sharedWithIds: string[];
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // ISO string
  priority: Priority;
  categoryId?: string;
  subtasks: Subtask[];
  reminder?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt?: string;
  updatedBy?: string;
  order?: number;
}

export interface Category {
  id: string;
  ownerId: string;
  sharedWith: Record<string, 'edit' | 'view'>;
  sharedWithIds: string[];
  name: string;
  color: string;
  priority?: Priority;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export interface Activity {
  id: string;
  taskId: string;
  userId: string;
  userDisplayName: string;
  action: string;
  timestamp: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'rose';

export interface AppState {
  tasks: Task[];
  categories: Category[];
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  splashScreenShown: boolean;
  activeTab: string;
  isSettingsOpen: boolean;
  historyRetentionDays: number;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: Category[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'ownerId' | 'sharedWith' | 'sharedWithIds'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  duplicateTask: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'ownerId' | 'sharedWith' | 'sharedWithIds' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setSplashScreenShown: (shown: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setHistoryRetentionDays: (days: number) => void;
  clearHistory: () => void;
  autoClearHistory: () => void;
  clearCompletedTasks: () => void;
  reorderTasks: (reorderedTasks: Task[]) => void;
}
