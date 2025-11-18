import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Target, TrendingUp, Flame, Star, CheckCircle2, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Screen, Habit } from '../App';

interface DashboardProps {
  habits: Habit[];
  onNavigate: (screen: Screen) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/dashboard/ - Obtiene datos del usuario actual
 * - Datos requeridos:
 *   - Profile: puntos_totales, racha_actual, nivel, progreso_nivel
 *   - HabitLog: registros últimos 7 días (para gráfico)
 *   - Habit: lista de hábitos activos del usuario
 *   - Achievement: logros desbloqueados
 * - Cálculos:
 *   - Nivel basado en puntos (ej: nivel = puntos // 100)
 *   - Progreso = (puntos % 100) para barra de nivel
 *   - Racha se calcula verificando HabitLog consecutivos
 */

// Mock data para el gráfico semanal
const weeklyData = [
  { day: 'Lun', completed: 5 },
  { day: 'Mar', completed: 7 },
  { day: 'Mié', completed: 6 },
  { day: 'Jue', completed: 8 },
  { day: 'Vie', completed: 4 },
  { day: 'Sáb', completed: 6 },
  { day: 'Dom', completed: 5 },
];

export function Dashboard({ habits, onNavigate }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Calcular datos del usuario
  const currentLevel = 12;
  const currentPoints = 1247;
  const pointsForNextLevel = 1300;
  const levelProgress = ((currentPoints % 100) / 100) * 100;
  const currentStreak = Math.max(...habits.map(h => h.streak), 0);
  
  // Hábitos completados hoy
  const habitsWithTodayStatus = habits.map(habit => ({
    ...habit,
    completedToday: habit.completedDates.includes(today)
  }));
  
  const completedToday = habitsWithTodayStatus.filter(h => h.completedToday).length;
  const totalToday = habits.length;

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 dark:text-white mb-2">
            ¡Bienvenido de vuelta, Juan! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Aquí está tu progreso de hoy. ¡Sigue así!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Points Card */}
          <Card className="card-stat bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Total
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm">Puntos totales</p>
                <p className="text-white truncate">{currentPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Streak Card */}
          <Card className="card-stat bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  🔥 Activa
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-orange-100 text-sm">Racha actual</p>
                <p className="text-white truncate">{currentStreak} días</p>
              </div>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card className="card-stat bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Nivel
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-green-100 text-sm">Nivel actual</p>
                <p className="text-white truncate">{currentLevel}</p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress Card */}
          <Card className="card-stat bg-gradient-to-br from-purple-500 to-indigo-600 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  Hoy
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm">Hábitos completados</p>
                <p className="text-white truncate">{completedToday}/{totalToday}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card className="card-level-progress">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Progreso de nivel</CardTitle>
                  <span className="text-neutral-600 text-sm">
                    {currentPoints} / {pointsForNextLevel} pts
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={levelProgress} className="h-3" />
                  <p className="text-neutral-600 text-sm">
                    {pointsForNextLevel - currentPoints} puntos para nivel {currentLevel + 1}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity Chart */}
            <Card className="card-weekly-chart">
              <CardHeader>
                <CardTitle>Actividad semanal</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[300px]">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar 
                        dataKey="completed" 
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        name="Hábitos completados"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Today's Habits */}
            <Card className="card-habits-list">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hábitos del día</CardTitle>
                  <Button onClick={() => onNavigate('progress')} variant="ghost" size="sm">
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habitsWithTodayStatus.map((habit) => (
                    <div
                      key={habit.id}
                      className="habit-item-today flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {habit.completedToday ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                        )}
                        <span className={`truncate ${habit.completedToday ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
                          {habit.name}
                        </span>
                      </div>
                      <Badge variant={habit.completedToday ? "secondary" : "default"} className="badge-points flex-shrink-0 text-xs">
                        +{habit.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card className="card-quick-actions bg-gradient-to-br from-blue-50 to-green-50 border-0">
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => onNavigate('progress')} className="w-full btn-primary justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Registrar progreso</span>
                </Button>
                <Button onClick={() => onNavigate('habits')} variant="outline" className="w-full btn-secondary justify-start gap-2">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Mis hábitos</span>
                </Button>
                <Button onClick={() => onNavigate('ranking')} variant="outline" className="w-full btn-secondary justify-start gap-2">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Ver ranking</span>
                </Button>
                <Button onClick={() => onNavigate('achievements')} variant="outline" className="w-full btn-secondary justify-start gap-2">
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Mis logros</span>
                </Button>
              </CardContent>
            </Card>

            {/* Motivational Card */}
            <Card className="card-motivation border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl">🎯</div>
                <h3 className="text-neutral-900">¡Casi llegas!</h3>
                <p className="text-neutral-600 text-sm">
                  Completa 2 hábitos más para alcanzar tu meta diaria
                </p>
              </CardContent>
            </Card>

            {/* Next Achievement */}
            <Card className="card-next-achievement">
              <CardHeader>
                <CardTitle className="text-base">Próximo logro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <p className="text-neutral-900 mb-1">Racha de 30 días</p>
                    <p className="text-neutral-600 text-sm">7 días restantes</p>
                  </div>
                  <Progress value={76.6} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}