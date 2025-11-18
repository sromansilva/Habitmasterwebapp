import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trophy, Lock, CheckCircle, Loader2 } from 'lucide-react';
import profileService from '../services/profileService';
import { toast } from 'sonner';

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/achievements/ - Lista de todos los logros posibles
 * - GET /api/achievements/user/ - Logros desbloqueados del usuario
 * - Modelo Achievement:
 *   - id, nombre, descripcion, icono, tipo
 *   - requisito (ej: "racha_7", "racha_30", "racha_100")
 *   - puntos_bonus
 * - Modelo UserAchievement:
 *   - id, user_id, achievement_id, fecha_desbloqueo
 * 
 * Lógica de backend:
 * - Al completar hábitos, verificar si se cumplen requisitos de logros
 * - Crear UserAchievement cuando se desbloquea
 * - Sumar puntos bonus al Profile del usuario
 * - Notificar al usuario cuando desbloquea un logro
 */

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedDate?: string;
  pointsBonus: number;
}

const achievements: Achievement[] = [
  // Streak Achievements
  {
    id: '1',
    name: 'Primera Semana',
    description: 'Mantén una racha de 7 días consecutivos',
    icon: '🔥',
    category: 'Racha',
    requirement: 'racha_7',
    progress: 7,
    maxProgress: 7,
    unlocked: true,
    unlockedDate: '2025-10-15',
    pointsBonus: 50,
  },
  {
    id: '2',
    name: 'Mes Imparable',
    description: 'Mantén una racha de 30 días consecutivos',
    icon: '⚡',
    category: 'Racha',
    requirement: 'racha_30',
    progress: 23,
    maxProgress: 30,
    unlocked: false,
    pointsBonus: 200,
  },
  {
    id: '3',
    name: 'Leyenda',
    description: 'Mantén una racha de 100 días consecutivos',
    icon: '👑',
    category: 'Racha',
    requirement: 'racha_100',
    progress: 23,
    maxProgress: 100,
    unlocked: false,
    pointsBonus: 1000,
  },
  
  // Habit Achievements
  {
    id: '4',
    name: 'Coleccionista',
    description: 'Crea 5 hábitos diferentes',
    icon: '📝',
    category: 'Hábitos',
    requirement: 'habits_5',
    progress: 5,
    maxProgress: 5,
    unlocked: true,
    unlockedDate: '2025-09-20',
    pointsBonus: 100,
  },
  {
    id: '5',
    name: 'Maestro de Hábitos',
    description: 'Crea 10 hábitos diferentes',
    icon: '🎯',
    category: 'Hábitos',
    requirement: 'habits_10',
    progress: 8,
    maxProgress: 10,
    unlocked: false,
    pointsBonus: 250,
  },
  
  // Completion Achievements
  {
    id: '6',
    name: 'Primeros Pasos',
    description: 'Completa 10 hábitos en total',
    icon: '✅',
    category: 'Completados',
    requirement: 'completed_10',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    unlockedDate: '2025-08-10',
    pointsBonus: 30,
  },
  {
    id: '7',
    name: 'Consistencia',
    description: 'Completa 50 hábitos en total',
    icon: '💪',
    category: 'Completados',
    requirement: 'completed_50',
    progress: 50,
    maxProgress: 50,
    unlocked: true,
    unlockedDate: '2025-10-01',
    pointsBonus: 150,
  },
  {
    id: '8',
    name: 'Imparable',
    description: 'Completa 100 hábitos en total',
    icon: '🚀',
    category: 'Completados',
    requirement: 'completed_100',
    progress: 100,
    maxProgress: 100,
    unlocked: true,
    unlockedDate: '2025-11-05',
    pointsBonus: 300,
  },
  {
    id: '9',
    name: 'Campeón',
    description: 'Completa 500 hábitos en total',
    icon: '🏆',
    category: 'Completados',
    requirement: 'completed_500',
    progress: 156,
    maxProgress: 500,
    unlocked: false,
    pointsBonus: 1500,
  },
  
  // Points Achievements
  {
    id: '10',
    name: 'Novato',
    description: 'Alcanza 100 puntos totales',
    icon: '⭐',
    category: 'Puntos',
    requirement: 'points_100',
    progress: 100,
    maxProgress: 100,
    unlocked: true,
    unlockedDate: '2025-07-20',
    pointsBonus: 20,
  },
  {
    id: '11',
    name: 'Competidor',
    description: 'Alcanza 1000 puntos totales',
    icon: '💎',
    category: 'Puntos',
    requirement: 'points_1000',
    progress: 1000,
    maxProgress: 1000,
    unlocked: true,
    unlockedDate: '2025-11-10',
    pointsBonus: 200,
  },
  {
    id: '12',
    name: 'Maestro',
    description: 'Alcanza 5000 puntos totales',
    icon: '🌟',
    category: 'Puntos',
    requirement: 'points_5000',
    progress: 1247,
    maxProgress: 5000,
    unlocked: false,
    pointsBonus: 1000,
  },
  
  // Special Achievements
  {
    id: '13',
    name: 'Madrugador',
    description: 'Completa 10 hábitos antes de las 8 AM',
    icon: '🌅',
    category: 'Especial',
    requirement: 'early_bird_10',
    progress: 3,
    maxProgress: 10,
    unlocked: false,
    pointsBonus: 150,
  },
  {
    id: '14',
    name: 'Fin de Semana Activo',
    description: 'Completa todos tus hábitos un sábado y domingo',
    icon: '🎉',
    category: 'Especial',
    requirement: 'weekend_warrior',
    progress: 1,
    maxProgress: 1,
    unlocked: false,
    pointsBonus: 100,
  },
  {
    id: '15',
    name: 'Perfección',
    description: 'Completa todos tus hábitos del día por 7 días seguidos',
    icon: '✨',
    category: 'Especial',
    requirement: 'perfect_week',
    progress: 0,
    maxProgress: 7,
    unlocked: false,
    pointsBonus: 500,
  },
];

export function Achievements() {
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        const achievementsData = await profileService.getAchievements();
        setUserAchievements(achievementsData);
      } catch (error: any) {
        console.error('Error loading achievements:', error);
        toast.error('Error al cargar los logros');
        setUserAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  // Mapear achievements del backend a formato local
  const userAchievementCodes = new Set(userAchievements.map(a => a.code));
  
  const achievementsWithStatus = achievements.map(achievement => ({
    ...achievement,
    unlocked: userAchievementCodes.has(achievement.requirement),
    unlockedDate: userAchievements.find(a => a.code === achievement.requirement)?.earned_on,
  }));

  const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const categories = Array.from(new Set(achievements.map(a => a.category)));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-neutral-900 mb-2">Logros y Medallas</h1>
        <p className="text-neutral-600">
          Desbloquea medallas especiales completando desafíos
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="card-achievements-progress mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-neutral-900 mb-2">
                Progreso general de logros
              </p>
              <div className="flex items-center gap-4">
                <Progress value={(unlockedCount / totalCount) * 100} className="h-3 flex-1" />
                <span className="text-neutral-900">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
            </div>
          </div>
          <p className="text-neutral-600 text-sm">
            Has desbloqueado {unlockedCount} de {totalCount} logros disponibles. ¡Sigue así para completar la colección!
          </p>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {categories.map((category) => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => 
          achievementsWithStatus.find(aws => aws.id === a.id)?.unlocked
        ).length;

        return (
          <div key={category} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-neutral-900">{category}</h2>
              <Badge variant="secondary" className="badge-category-progress">
                {categoryUnlocked}/{categoryAchievements.length}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => {
                const achievementWithStatus = achievementsWithStatus.find(a => a.id === achievement.id);
                const isUnlocked = achievementWithStatus?.unlocked || false;
                return (
                <Card
                  key={achievement.id}
                  className={`card-achievement ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                          isUnlocked
                            ? 'bg-white shadow-sm'
                            : 'bg-neutral-200 grayscale opacity-50'
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      {isUnlocked ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Lock className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3
                        className={
                          isUnlocked
                            ? 'text-neutral-900 mb-1'
                            : 'text-neutral-600 mb-1'
                        }
                      >
                        {achievement.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          isUnlocked ? 'text-neutral-600' : 'text-neutral-500'
                        }`}
                      >
                        {achievement.description}
                      </p>
                    </div>

                    {/* Progress or Unlocked Date */}
                    {isUnlocked ? (
                      <div className="flex items-center justify-between pt-2 border-t border-green-200">
                        <span className="text-green-700 text-sm">
                          Desbloqueado {achievementWithStatus?.unlockedDate ? `el ${new Date(achievementWithStatus.unlockedDate).toLocaleDateString('es-ES')}` : ''}
                        </span>
                        <Badge variant="secondary" className="badge-points bg-green-600 text-white">
                          +{achievement.pointsBonus} pts
                        </Badge>
                      </div>
                    ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Progreso</span>
                          <span className="text-neutral-900">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 text-xs">
                            {achievement.maxProgress - achievement.progress} restantes
                          </span>
                          <Badge variant="outline" className="badge-bonus text-xs">
                            +{achievement.pointsBonus} pts
                          </Badge>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </div>
        );
      })}

      {/* Motivational Card */}
      <Card className="card-achievement-motivation bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl">🎯</div>
          <h3 className="text-neutral-900">¡Sigue desbloqueando logros!</h3>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Cada logro desbloqueado te otorga puntos bonus y te acerca a convertirte en un maestro de los hábitos. 
            Mantén tu racha activa y completa tus hábitos diarios para desbloquear medallas especiales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
