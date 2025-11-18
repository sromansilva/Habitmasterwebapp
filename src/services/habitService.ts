/**
 * Servicio para gestionar hábitos con el backend Django
 */
import api from '../utils/api';

export interface Habit {
  id: number;
  name: string;
  description: string;
  periodicity: 'daily' | 'weekly' | 'custom';
  points_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface HabitCreate {
  name: string;
  description?: string;
  periodicity: 'daily' | 'weekly' | 'custom';
  points_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HabitLog {
  id: number;
  habit: Habit;
  date: string;
  completed: boolean;
  points_awarded: number;
  note?: string;
}

class HabitService {
  /**
   * Obtener todos los hábitos del usuario
   */
  async getAll(): Promise<Habit[]> {
    const response = await api.get<Habit[]>('/habits/');
    return response.data;
  }

  /**
   * Obtener un hábito por ID
   */
  async getById(id: number): Promise<Habit> {
    const response = await api.get<Habit>(`/habits/${id}/`);
    return response.data;
  }

  /**
   * Crear un nuevo hábito
   */
  async create(habit: HabitCreate): Promise<Habit> {
    const response = await api.post<Habit>('/habits/', habit);
    return response.data;
  }

  /**
   * Actualizar un hábito existente
   */
  async update(id: number, habit: Partial<HabitCreate>): Promise<Habit> {
    const response = await api.patch<Habit>(`/habits/${id}/`, habit);
    return response.data;
  }

  /**
   * Eliminar un hábito
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/habits/${id}/`);
  }

  /**
   * Completar un hábito
   */
  async complete(id: number): Promise<any> {
    const response = await api.post(`/habits/${id}/complete/`);
    return response.data;
  }

  /**
   * Obtener logs de hábitos
   */
  async getLogs(): Promise<HabitLog[]> {
    const response = await api.get<HabitLog[]>('/logs/');
    return response.data;
  }
}

export default new HabitService();

