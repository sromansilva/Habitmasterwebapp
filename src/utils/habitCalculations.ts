import type { Habit, UserProfile as UserProfileType } from '../App';

/**
 * Calcula la racha actual de un hábito basado en sus fechas de completado
 */
export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date();

  // Verificar si completó hoy
  if (sortedDates[0] === today) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Si no completó hoy, verificar si completó ayer (la racha sigue activa)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (sortedDates[0] === yesterdayStr) {
      streak = 1;
      currentDate = yesterday;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // La racha se rompió
      return 0;
    }
  }

  // Contar días consecutivos hacia atrás
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcula la racha máxima que ha tenido el usuario
 */
export function calculateMaxStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Calcula los puntos totales del usuario
 */
export function calculateTotalPoints(habits: Habit[]): number {
  let total = 0;
  
  habits.forEach(habit => {
    // Puntos base por cada vez que completó el hábito
    total += habit.completedDates.length * habit.points;
    
    // Bonus por racha (10% extra por cada 7 días de racha)
    const streakBonus = Math.floor(habit.streak / 7) * habit.points * 0.1;
    total += streakBonus;
  });

  return Math.floor(total);
}

/**
 * Calcula el nivel del usuario basado en sus puntos
 * Fórmula: nivel = floor(puntos / 100) + 1
 */
export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 100) + 1;
}

/**
 * Calcula el progreso hacia el siguiente nivel (0-100%)
 */
export function calculateLevelProgress(totalPoints: number): number {
  return (totalPoints % 100);
}

/**
 * Calcula la racha global del usuario (días consecutivos completando al menos un hábito)
 */
export function calculateGlobalStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  // Obtener todas las fechas únicas donde se completó al menos un hábito
  const allDates = new Set<string>();
  habits.forEach(habit => {
    habit.completedDates.forEach(date => allDates.add(date));
  });

  const sortedUniqueDates = Array.from(allDates).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  if (sortedUniqueDates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();

  // Verificar si completó algo hoy
  if (sortedUniqueDates[0] === today) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Si no completó hoy, verificar si completó ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (sortedUniqueDates[0] === yesterdayStr) {
      streak = 1;
      currentDate = yesterday;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      return 0;
    }
  }

  // Contar días consecutivos
  for (let i = 1; i < sortedUniqueDates.length; i++) {
    const expectedDate = currentDate.toISOString().split('T')[0];
    
    if (sortedUniqueDates[i] === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calcula la racha máxima global
 */
export function calculateGlobalMaxStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  // Obtener todas las fechas únicas
  const allDates = new Set<string>();
  habits.forEach(habit => {
    habit.completedDates.forEach(date => allDates.add(date));
  });

  const sortedUniqueDates = Array.from(allDates).sort();
  
  if (sortedUniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedUniqueDates.length; i++) {
    const prevDate = new Date(sortedUniqueDates[i - 1]);
    const currDate = new Date(sortedUniqueDates[i]);
    
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Cuenta el total de hábitos completados (suma de todos los completedDates)
 */
export function calculateTotalCompletions(habits: Habit[]): number {
  return habits.reduce((total, habit) => total + habit.completedDates.length, 0);
}

/**
 * Actualiza las rachas de todos los hábitos
 */
export function updateHabitStreaks(habits: Habit[]): Habit[] {
  return habits.map(habit => ({
    ...habit,
    streak: calculateStreak(habit.completedDates),
  }));
}
