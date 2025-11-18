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
import { Toaster } from './components/ui/sonner';
import authService from './services/authService';
import habitService, { Habit as HabitApi } from './services/habitService';
import profileService from './services/profileService';
import { toast } from 'sonner';

export type Screen = 'landing' | 'auth' | 'dashboard' | 'habits' | 'habit-form' | 'progress' | 'ranking' | 'profile' | 'achievements' | 'settings';

// Interfaz local para hábitos (compatible con backend)
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

// Helper para convertir HabitApi a Habit local
const apiHabitToLocal = (apiHabit: HabitApi): Habit => {
  // Mapear periodicity a frequency (1-7 días por semana)
  let frequency = 3; // Por defecto
  if (apiHabit.periodicity === 'daily') {
    frequency = 7;
  } else if (apiHabit.periodicity === 'weekly') {
    frequency = 1;
  }
  
  return {
    id: apiHabit.id.toString(),
    name: apiHabit.name,
    description: apiHabit.description || '',
    category: 'general', // Por defecto (no está en el backend)
    frequency,
    completedDates: [], // Se cargará desde logs
    streak: 0, // Se calculará
    lastCompleted: null,
    createdAt: apiHabit.created_at || new Date().toISOString(),
    points: apiHabit.points_value,
  };
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Usuario',
    email: '',
    bio: 'Construyendo mejores hábitos cada día 💪',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    maxStreak: 0,
    memberSince: new Date().toISOString(),
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');
        await loadUserData();
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Cargar datos del usuario desde el backend
  const loadUserData = async () => {
    try {
      // Cargar perfil del usuario
      try {
        const apiProfile = await profileService.getProfile();
        setUserProfile(prev => ({
          ...prev,
          name: apiProfile.username || prev.name,
          email: apiProfile.email || prev.email,
          totalPoints: apiProfile.total_points || 0,
          level: apiProfile.level || 1,
          currentStreak: apiProfile.streak || apiProfile.current_streak || 0,
          maxStreak: apiProfile.longest_streak || 0,
        }));
      } catch (profileError) {
        console.warn('No se pudo cargar el perfil:', profileError);
      }
      
      // Cargar hábitos
      const apiHabits = await habitService.getAll();
      const localHabits = apiHabits.map(apiHabitToLocal);
      
      // Cargar logs para cada hábito
      try {
        const logs = await habitService.getLogs();
        logs.forEach(log => {
          const habitIndex = localHabits.findIndex(h => h.id === log.habit.id.toString());
          if (habitIndex >= 0 && log.completed) {
            if (!localHabits[habitIndex].completedDates.includes(log.date)) {
              localHabits[habitIndex].completedDates.push(log.date);
            }
            // Actualizar lastCompleted si es más reciente
            if (!localHabits[habitIndex].lastCompleted || log.date > localHabits[habitIndex].lastCompleted!) {
              localHabits[habitIndex].lastCompleted = log.date;
            }
          }
        });
        
        // Calcular streaks basados en completedDates
        localHabits.forEach(habit => {
          if (habit.completedDates.length > 0) {
            const sortedDates = [...habit.completedDates].sort();
            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            let checkDate = today;
            
            // Contar días consecutivos desde hoy hacia atrás
            for (let i = sortedDates.length - 1; i >= 0; i--) {
              if (sortedDates[i] === checkDate) {
                streak++;
                const date = new Date(checkDate);
                date.setDate(date.getDate() - 1);
                checkDate = date.toISOString().split('T')[0];
              } else {
                break;
              }
            }
            
            habit.streak = streak;
          }
        });
      } catch (logError) {
        console.warn('No se pudieron cargar los logs:', logError);
      }
      
      setHabits(localHabits);
      
    } catch (error: any) {
      console.error('Error loading user data:', error);
      if (error.response?.status === 401) {
        // Token inválido, hacer logout
        authService.logout();
        setIsAuthenticated(false);
        setCurrentScreen('landing');
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    }
  };

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

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    await loadUserData();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentScreen('landing');
    setHabits([]);
    toast.success('Sesión cerrada');
  };

  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setCurrentScreen('habit-form');
  };

  const handleCreateHabit = () => {
    setEditingHabitId(null);
    setCurrentScreen('habit-form');
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'lastCompleted' | 'createdAt'>) => {
    try {
      // Mapear frequency a periodicity
      let periodicity: 'daily' | 'weekly' | 'custom' = 'custom';
      if (habitData.frequency === 7) {
        periodicity = 'daily';
      } else if (habitData.frequency === 1) {
        periodicity = 'weekly';
      }
      
      if (editingHabitId) {
        // Editar hábito existente
        const apiHabit = await habitService.update(
          parseInt(editingHabitId),
          {
            name: habitData.name,
            description: habitData.description,
            periodicity,
            points_value: habitData.points,
            difficulty: 'medium', // Por defecto
          }
        );
        
        const existingHabit = habits.find(h => h.id === editingHabitId);
        const updatedHabit = {
          ...apiHabitToLocal(apiHabit),
          category: habitData.category, // Mantener category del frontend
          completedDates: existingHabit?.completedDates || [],
          streak: existingHabit?.streak || 0,
          lastCompleted: existingHabit?.lastCompleted || null,
        };
        
        setHabits(prev => prev.map(habit => 
          habit.id === editingHabitId ? updatedHabit : habit
        ));
        toast.success('Hábito actualizado');
      } else {
        // Crear nuevo hábito
        const apiHabit = await habitService.create({
          name: habitData.name,
          description: habitData.description,
          periodicity,
          points_value: habitData.points,
          difficulty: 'medium', // Por defecto
        });
        
        const newHabit = {
          ...apiHabitToLocal(apiHabit),
          category: habitData.category, // Mantener category del frontend
        };
        setHabits(prev => [...prev, newHabit]);
        toast.success('Hábito creado');
      }
      
      // Recargar datos para asegurar sincronización
      await loadUserData();
      setCurrentScreen('habits');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Error al guardar el hábito';
      toast.error(errorMessage);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitService.delete(parseInt(habitId));
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
      toast.success('Hábito eliminado');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar el hábito';
      toast.error(errorMessage);
    }
  };

  const handleToggleHabitComplete = async (habitId: string) => {
    try {
      await habitService.complete(parseInt(habitId));
      
      // Recargar datos después de completar para obtener stats actualizadas
      await loadUserData();
      toast.success('¡Hábito completado! 🎉');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Error al completar el hábito';
      toast.error(errorMessage);
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);
    localStorage.setItem('habitmaster_profile', JSON.stringify(updatedProfile));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
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
    </>
  );
}
