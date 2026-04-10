/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from './components/ThemeProvider';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { ReminderSystem } from './components/ReminderSystem';
import { SettingsModal } from './components/SettingsModal';
import { AuthProvider } from './components/AuthProvider';
import { DataProvider } from './components/DataProvider';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ThemeProvider>
          <ReminderSystem />
          <SplashScreen />
          <SettingsModal />
          <Layout>
            <TaskList />
          </Layout>
        </ThemeProvider>
      </DataProvider>
    </AuthProvider>
  );
}


