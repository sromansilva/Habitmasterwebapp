import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Medal, TrendingUp, Target, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

/**
 * DJANGO BACKEND NOTES:
 * - GET /api/ranking/weekly/ - Ranking de la semana actual
 * - Modelo RankingEntry:
 *   - id, user_id, semana_inicio, semana_fin
 *   - puntos_semana, posicion
 * 
 * Lógica de backend:
 * - Calcular puntos semanales desde HabitLog
 * - Ordenar usuarios por puntos descendente
 * - Asignar posiciones (1, 2, 3, ...)
 * - Actualizar cada lunes al iniciar nueva semana
 * - Identificar al usuario actual en el ranking
 * 
 * Query sugerido:
 * - Filtrar HabitLog por semana actual
 * - GROUP BY user_id
 * - SUM(puntos_ganados)
 * - Ordenar y limitar top 50
 */

// Mock data para el ranking
const rankingData = [
  {
    id: '1',
    position: 1,
    name: 'María García',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    points: 485,
    habitsCompleted: 32,
    streak: 45,
  },
  {
    id: '2',
    position: 2,
    name: 'Carlos Rodríguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    points: 467,
    habitsCompleted: 31,
    streak: 28,
  },
  {
    id: '3',
    position: 3,
    name: 'Ana Martínez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    points: 452,
    habitsCompleted: 29,
    streak: 38,
  },
  {
    id: '4',
    position: 4,
    name: 'Luis Hernández',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
    points: 398,
    habitsCompleted: 27,
    streak: 15,
  },
  {
    id: '5',
    position: 5,
    name: 'Juan Pérez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    points: 365,
    habitsCompleted: 24,
    streak: 23,
    isCurrentUser: true,
  },
  {
    id: '6',
    position: 6,
    name: 'Sofia López',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    points: 342,
    habitsCompleted: 23,
    streak: 12,
  },
  {
    id: '7',
    position: 7,
    name: 'Diego Sánchez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    points: 318,
    habitsCompleted: 21,
    streak: 9,
  },
  {
    id: '8',
    position: 8,
    name: 'Laura Ramírez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    points: 295,
    habitsCompleted: 20,
    streak: 18,
  },
];

interface RankingUser {
  username: string;
  total_points: number;
  current_streak: number;
}

interface RankingData {
  ranking: Array<[string, number]>; // [username, total_points]
}

export function Ranking() {
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        // Obtener perfil para saber el username actual
        const profileResponse = await api.get('/profile/');
        const profile = profileResponse.data;
        setCurrentUsername(profile.username || '');

        // Obtener ranking
        const rankingResponse = await api.get<RankingData>('/ranking/');
        const ranking = rankingResponse.data.ranking || [];
        
        // Convertir ranking a formato local
        const formattedRanking: RankingUser[] = ranking.map(([username, points], index) => ({
          username,
          total_points: points,
          current_streak: 0, // Se puede obtener del perfil si es necesario
        }));

        setRankingData(formattedRanking);
      } catch (error: any) {
        console.error('Error loading ranking:', error);
        toast.error('Error al cargar el ranking');
        // Usar datos mock como fallback
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentUser = rankingData.find(u => u.username === currentUsername);
  const topThree = rankingData.slice(0, 3);
  const restOfRanking = rankingData.slice(3);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 mb-2">Ranking Semanal</h1>
          <p className="text-neutral-600">
            Compite con otros usuarios y alcanza el top 3
          </p>
        </div>

        {/* Current User Position */}
        {currentUser && (
          <Card className="card-user-position mb-6 bg-gradient-to-br from-blue-500 to-purple-500 border-0 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm sm:text-base">
                      #{rankingData.findIndex(u => u.username === currentUsername) + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-1">Tu posición actual</p>
                    <p className="text-white truncate">{currentUser.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs sm:text-sm mb-1">Puntos totales</p>
                  <p className="text-white">{currentUser.total_points} pts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-2 text-neutral-600 text-sm sm:text-base">
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">
              Semana del {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <Badge variant="secondary" className="badge-week text-xs">
            Actualizado en vivo
          </Badge>
        </div>

        {/* Top 3 Podium */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {topThree.map((user, index) => {
            const position = index + 1;
            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
            return (
              <Card
                key={user.username}
                className={`card-podium ${
                  position === 1
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                    : position === 2
                    ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300'
                    : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300'
                }`}
              >
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarUrl} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="text-2xl sm:text-3xl">{getMedalIcon(position)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-neutral-900 mb-1 truncate">{user.username}</p>
                    <p className="text-neutral-600 text-xs sm:text-sm">Posición {position}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-yellow-700 text-sm sm:text-base">{user.total_points} puntos</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-600">
                      <TrendingUp className="w-4 h-4 flex-shrink-0" />
                      <span>{user.current_streak} días de racha</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Rest of Ranking */}
        <Card className="card-ranking-list">
          <CardHeader>
            <CardTitle>Ranking completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {restOfRanking.map((user, index) => {
                const position = index + 4;
                const isCurrentUser = user.username === currentUsername;
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                return (
                  <div
                    key={user.username}
                    className={`ranking-item flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                  >
                    {/* Position */}
                    <div className="w-8 sm:w-12 text-center flex-shrink-0">
                      <span className={`text-sm sm:text-base ${isCurrentUser ? 'text-blue-600' : 'text-neutral-600'}`}>
                        #{position}
                      </span>
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${isCurrentUser ? 'border-2 border-blue-500' : ''}`}>
                        <AvatarImage src={avatarUrl} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-neutral-900 truncate text-sm sm:text-base">
                          {user.username}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="ml-2 badge-you text-xs">
                              Tú
                            </Badge>
                          )}
                        </p>
                        <p className="text-neutral-600 text-xs sm:text-sm truncate">
                          Racha: {user.current_streak} días
                        </p>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="hidden sm:flex items-center gap-2 text-orange-600 flex-shrink-0">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{user.current_streak} días</span>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm sm:text-base ${isCurrentUser ? 'text-blue-600' : 'text-neutral-900'}`}>
                        {user.total_points}
                      </p>
                      <p className="text-neutral-500 text-xs sm:text-sm">puntos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="card-ranking-info mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-0">
          <CardContent className="p-4 sm:p-6 text-center space-y-3">
            <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto" />
            <h3 className="text-neutral-900">Cómo funciona el ranking</h3>
            <p className="text-neutral-600 text-sm max-w-2xl mx-auto">
              El ranking se actualiza en tiempo real basado en los puntos que ganas al completar tus hábitos. 
              Cada lunes comienza una nueva semana de competencia. ¡Los top 3 reciben medallas especiales!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}