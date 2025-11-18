import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { MyHabits } from './components/MyHabits';
import { HabitForm } from './components/HabitForm';
import { ProgressTracker } from './components/ProgressTracker';
import { Ranking } from './components/Ranking';
import { UserProfile as UserProfileComponent } from './components/UserProfile';
import { Achievements } from './components/Achievements';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import { 
  calculateTotalPoints, 
  calculateLevel, 
  calculateGlobalStreak, 
  calculateGlobalMaxStreak,
  calculateStreak,
  calculateTotalCompletions,
  updateHabitStreaks
} from './utils/habitCalculations';

export type Screen = 'landing' | 'auth' | 'dashboard' | 'habits' | 'habit-form' | 'progress' | 'ranking' | 'profile' | 'achievements' | 'settings';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: number; // veces por semana
  completedDates: string[]; // array de fechas en formato ISO
  streak: number;
  lastCompleted: string | null;
  createdAt: string;
  points: number; // puntos base por completar
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  totalPoints: number;
  level: number;
  currentStreak: number;
  maxStreak: number;
  memberSince: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    bio: 'Construyendo mejores hábitos cada día 💪',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    memberSince: new Date().toISOString(),
  });

  // Cargar perfil del localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('habitmaster_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Guardar perfil en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('habitmaster_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Cargar dark mode del localStorage al iniciar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('habitmaster_darkmode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Aplicar dark mode al DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('habitmaster_darkmode', darkMode.toString());
  }, [darkMode]);

  // Cargar hábitos del localStorage al iniciar
  useEffect(() => {
    const savedHabits = localStorage.getItem('habitmaster_habits');
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    }
  }, []);

  // Guardar hábitos en localStorage cuando cambien
  useEffect(() => {
    if (habits.length > 0 || localStorage.getItem('habitmaster_habits')) {
      localStorage.setItem('habitmaster_habits', JSON.stringify(habits));
    }
  }, [habits]);

  // Actualizar estadísticas del perfil cuando cambien los hábitos
  useEffect(() => {
    if (habits.length > 0) {
      const totalPoints = calculateTotalPoints(habits);
      const level = calculateLevel(totalPoints);
      const currentStreak = calculateGlobalStreak(habits);
      const maxStreak = Math.max(
        calculateGlobalMaxStreak(habits),
        userProfile.maxStreak
      );

      setUserProfile(prev => ({
        ...prev,
        totalPoints,
        level,
        currentStreak,
        maxStreak,
      }));
    }
  }, [habits]);

  // Actualizar rachas de los hábitos diariamente
  useEffect(() => {
    const updatedHabits = updateHabitStreaks(habits);
    const hasChanges = updatedHabits.some((habit, index) => 
      habit.streak !== habits[index]?.streak
    );
    
    if (hasChanges) {
      setHabits(updatedHabits);
    }
  }, [habits.map(h => h.completedDates.join(',')).join('|')]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setCurrentScreen('habit-form');
  };

  const handleCreateHabit = () => {
    setEditingHabitId(null);
    setCurrentScreen('habit-form');
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'lastCompleted' | 'createdAt'>) => {
    if (editingHabitId) {
      // Editar hábito existente
      setHabits(prev => prev.map(habit => 
        habit.id === editingHabitId
          ? { ...habit, ...habitData }
          : habit
      ));
    } else {
      // Crear nuevo hábito
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        completedDates: [],
        streak: 0,
        lastCompleted: null,
        createdAt: new Date().toISOString(),
      };
      setHabits(prev => [...prev, newHabit]);
    }
    setCurrentScreen('habits');
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const handleToggleHabitComplete = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(prev => prev.map(habit => {
      if (habit.id !== habitId) return habit;

      const isCompletedToday = habit.completedDates.includes(today);
      
      if (isCompletedToday) {
        // Desmarcar como completado
        return {
          ...habit,
          completedDates: habit.completedDates.filter(date => date !== today),
        };
      } else {
        // Marcar como completado
        const newCompletedDates = [...habit.completedDates, today].sort();
        
        // Calcular nueva racha usando la función mejorada
        const newStreak = calculateStreak(newCompletedDates);
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
          lastCompleted: today,
        };
      }
    }));
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      {!isAuthenticated ? (
        <>
          {currentScreen === 'landing' && (
            <LandingPage onNavigateToAuth={() => setCurrentScreen('auth')} />
          )}
          {currentScreen === 'auth' && (
            <AuthScreen onLogin={handleLogin} onBack={() => setCurrentScreen('landing')} />
          )}
        </>
      ) : (
        <div className="flex min-h-screen">
          <Navigation currentScreen={currentScreen} onNavigate={navigateTo} />
          <main className="flex-1 w-full md:ml-64 pb-20 md:pb-0">
            {currentScreen === 'dashboard' && <Dashboard habits={habits} userProfile={userProfile} onNavigate={navigateTo} />}
            {currentScreen === 'habits' && (
              <MyHabits 
                habits={habits}
                onCreateHabit={handleCreateHabit} 
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            )}
            {currentScreen === 'habit-form' && (
              <HabitForm 
                habitId={editingHabitId}
                existingHabit={habits.find(h => h.id === editingHabitId)}
                onSave={handleSaveHabit}
                onBack={() => setCurrentScreen('habits')} 
              />
            )}
            {currentScreen === 'progress' && (
              <ProgressTracker 
                habits={habits}
                onToggleComplete={handleToggleHabitComplete}
              />
            )}
            {currentScreen === 'ranking' && <Ranking />}
            {currentScreen === 'profile' && (
              <UserProfileComponent 
                userProfile={userProfile}
                habits={habits}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {currentScreen === 'achievements' && <Achievements />}
            {currentScreen === 'settings' && <Settings darkMode={darkMode} onDarkModeChange={setDarkMode} onLogout={handleLogout} />}
          </main>
        </div>
      )}
    </div>
  );
}