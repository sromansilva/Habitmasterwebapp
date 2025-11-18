import React from "react";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Flame, 
  Star,
  Edit2,
  Check,
  X 
} from 'lucide-react';
import type { Habit, UserProfile as UserProfileType } from '../App';
import { calculateTotalCompletions, calculateLevelProgress } from '../utils/habitCalculations';

interface UserProfileProps {
  userProfile: UserProfileType;
  habits: Habit[];
  onUpdateProfile: (updates: Partial<UserProfileType>) => void;
}

export function UserProfile({ userProfile, habits, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    bio: userProfile.bio,
  });

  // Calcular datos derivados
  const habitsCreated = habits.length;
  const habitsCompleted = calculateTotalCompletions(habits);
  const levelProgress = calculateLevelProgress(userProfile.totalPoints);

  const handleSave = () => {
    // Backend: PUT /api/profile/
    console.log('Save profile:', formData);
    onUpdateProfile({ name: formData.name, email: formData.email, bio: formData.bio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile.name,
      email: userProfile.email,
      bio: userProfile.bio,
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-neutral-900 mb-2">Mi Perfil</h1>
        <p className="text-neutral-600">
          Gestiona tu información personal y revisa tus estadísticas
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-profile-main">
            <CardContent className="p-6 text-center space-y-4">
              {/* Avatar */}
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={userProfile.avatar} alt={formData.name} />
                  <AvatarFallback className="text-2xl">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Name & Bio */}
              {!isEditing ? (
                <>
                  <div>
                    <h2 className="text-neutral-900 mb-1">{formData.name}</h2>
                    <p className="text-neutral-600 text-sm">{formData.email}</p>
                  </div>
                  <p className="text-neutral-600 text-sm italic">{formData.bio}</p>
                </>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="profile-name" className="text-sm">Nombre</Label>
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-profile-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profile-email" className="text-sm">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-profile-email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profile-bio" className="text-sm">Bio</Label>
                    <Input
                      id="profile-bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-profile-bio"
                    />
                  </div>
                </div>
              )}

              {/* Level Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                <Star className="w-4 h-4" />
                <span>Nivel {userProfile.level}</span>
              </div>

              {/* Edit Buttons */}
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full btn-edit-profile gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 btn-cancel gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 btn-save gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card className="card-member-info">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Miembro desde</p>
                <p className="text-neutral-900">
                  {new Date(userProfile.memberSince).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Level Progress */}
          <Card className="card-level-detail">
            <CardHeader>
              <CardTitle>Progreso de nivel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
                    {userProfile.level}
                  </div>
                  <div>
                    <p className="text-neutral-900">Nivel {userProfile.level}</p>
                    <p className="text-neutral-600 text-sm">
                      {userProfile.totalPoints} puntos totales
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="badge-next-level">
                  Nivel {userProfile.level + 1} próximo
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={levelProgress} className="h-3" />
                <p className="text-neutral-600 text-sm">
                  {100 - (userProfile.totalPoints % 100)} puntos para el siguiente nivel
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="card-stat bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-orange-900">Racha actual</p>
                  <p className="text-orange-600 text-sm">{userProfile.currentStreak} días consecutivos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-purple-900">Racha máxima</p>
                  <p className="text-purple-600 text-sm">{userProfile.maxStreak} días alcanzados</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-900">Hábitos creados</p>
                  <p className="text-blue-600 text-sm">{habitsCreated} hábitos activos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-stat bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-green-900">Completados</p>
                  <p className="text-green-600 text-sm">{habitsCompleted} hábitos totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Summary */}
          <Card className="card-achievements-summary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logros desbloqueados</CardTitle>
                <Badge variant="secondary" className="badge-achievement-count">
                  0/15
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="text-4xl">🏆</div>
                <div className="flex-1">
                  <p className="text-neutral-900 mb-1">
                    Has desbloqueado 0 logros
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Sigue completando hábitos para desbloquear más medallas
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="card-activity-summary bg-gradient-to-br from-blue-50 to-green-50 border-0">
            <CardHeader>
              <CardTitle>Resumen de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-neutral-900 mb-1">{userProfile.totalPoints}</p>
                  <p className="text-neutral-600 text-sm">Puntos totales</p>
                </div>
                <div>
                  <p className="text-neutral-900 mb-1">{habitsCompleted}</p>
                  <p className="text-neutral-600 text-sm">Hábitos completados</p>
                </div>
                <div>
                  <p className="text-neutral-900 mb-1">{userProfile.currentStreak}</p>
                  <p className="text-neutral-600 text-sm">Días de racha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}