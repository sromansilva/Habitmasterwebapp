/**
 * Servicio para gestionar perfil de usuario con el backend Django
 */
import api from '../utils/api';

export interface UserProfile {
  username: string;
  email: string;
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  streak: number;
  last_completed: string | null;
}

export interface Achievement {
  code: string;
  name: string;
  earned_on: string;
}

class ProfileService {
  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/profile/');
    return response.data;
  }

  /**
   * Obtener logros del usuario
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get<Achievement[]>('/achievements/');
    return response.data;
  }
}

export default new ProfileService();

