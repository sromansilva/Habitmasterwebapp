import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import type { Habit } from '../App';

interface ProgressTrackerProps {
  habits: Habit[];
  onToggleComplete: (habitId: string) => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/habits/today/ - Lista de hábitos para hoy
 * - POST /api/habit-logs/ - Registrar completado de hábito
 * - Modelo HabitLog:
 *   - id, habit_id, user_id, fecha, completado (Boolean)
 *   - puntos_ganados (IntegerField)
 * 
 * Lógica de backend:
 * - Al marcar como completado:
 *   1. Crear HabitLog con fecha de hoy
 *   2. Sumar puntos al Profile del usuario
 *   3. Actualizar racha si corresponde
 *   4. Verificar si se desbloquean logros
 * - No permitir duplicados (un HabitLog por hábito por día)
 * - Calcular progreso diario: completados / total del día
 */

export function ProgressTracker({ habits, onToggleComplete }: ProgressTrackerProps) {
  const today = new Date().toISOString().split('T')[0];
  
  // Verificar si cada hábito está completado hoy
  const habitsWithStatus = habits.map(habit => ({
    ...habit,
    completedToday: habit.completedDates.includes(today)
  }));

  const totalCount = habitsWithStatus.length;
  const completedCount = habitsWithStatus.filter(h => h.completedToday).length;
  const totalPointsToday = habitsWithStatus
    .filter(h => h.completedToday)
    .reduce((acc, h) => acc + h.points, 0);
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleHabit = (habitId: string) => {
    // Backend: POST /api/habit-logs/ o DELETE
    onToggleComplete(habitId);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 mb-2">Registrar Progreso</h1>
          <p className="text-neutral-600">
            Marca los hábitos que has completado hoy
          </p>
        </div>

        {/* Daily Progress Summary */}
        <Card className="card-daily-summary mb-6 bg-gradient-to-br from-blue-50 to-green-50 border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <p className="text-neutral-600 text-sm mb-1">Progreso del día</p>
                <p className="text-neutral-900">
                  {completedCount} de {totalCount} hábitos
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-600 text-sm mb-1">Puntos ganados hoy</p>
                <p className="text-blue-600">+{totalPointsToday} pts</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            {progressPercentage === 100 && (
              <Alert className="alert-success mt-4 bg-green-50 border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <AlertDescription className="text-green-800 text-sm">
                  ¡Felicidades! Has completado todos tus hábitos del día 🎉
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Date Display */}
        <div className="flex items-center gap-2 mb-6 text-neutral-600 text-sm sm:text-base">
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habitsWithStatus.map((habit) => (
            <Card
              key={habit.id}
              className={`habit-item-tracker transition-all ${
                habit.completedToday
                  ? 'bg-green-50 border-green-200'
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Toggle Switch */}
                  <div className="flex-shrink-0">
                    <Switch
                      checked={habit.completedToday}
                      onCheckedChange={() => handleToggleHabit(habit.id)}
                      className="switch-habit"
                    />
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3
                        className={`text-neutral-900 truncate ${
                          habit.completedToday ? 'line-through text-neutral-500' : ''
                        }`}
                      >
                        {habit.name}
                      </h3>
                      <Badge variant="secondary" className="badge-category text-xs flex-shrink-0">
                        {habit.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <span>{habit.streak} días de racha</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="flex-shrink-0">
                    <Badge
                      variant={habit.completedToday ? "default" : "outline"}
                      className={`badge-points text-xs ${
                        habit.completedToday
                          ? 'bg-green-600'
                          : 'border-blue-500 text-blue-600'
                      }`}
                    >
                      +{habit.points} pts
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button (Optional - puede ser auto-save) */}
        <Card className="card-motivation mt-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-4 sm:p-6 text-center space-y-3">
            <div className="text-3xl sm:text-4xl">💪</div>
            <h3 className="text-neutral-900">¡Sigue así!</h3>
            <p className="text-neutral-600 text-sm">
              {completedCount === 0
                ? 'Completa tu primer hábito del día para comenzar'
                : completedCount === totalCount
                ? '¡Día perfecto! Todos los hábitos completados'
                : `Te faltan ${totalCount - completedCount} hábitos para completar el día`}
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Alert className="alert-info mt-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Consejo:</strong> Los cambios se guardan automáticamente. Puedes volver más tarde y seguir marcando hábitos completados.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}