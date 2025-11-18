import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ArrowLeft, Info, Save } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import type { Habit } from '../App';

interface HabitFormProps {
  habitId: string | null; // null = crear, string = editar
  existingHabit?: Habit;
  onSave: (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'lastCompleted' | 'createdAt'>) => void;
  onBack: () => void;
}

/**
 * DJANGO BACKEND NOTES:
 * - POST /api/habits/ - Crear nuevo hábito
 * - PUT /api/habits/{id}/ - Actualizar hábito existente
 * - GET /api/habits/{id}/ - Obtener datos del hábito (si editing)
 * 
 * Campos del modelo Habit:
 * - nombre (CharField, max_length=200)
 * - descripcion (TextField, opcional)
 * - frecuencia_semanal (IntegerField, 1-7)
 * - user (ForeignKey a User)
 * - activo (BooleanField, default=True)
 * - fecha_creacion (DateTimeField, auto_now_add)
 * 
 * Validaciones:
 * - nombre no vacío
 * - frecuencia entre 1 y 7
 * - usuario debe estar autenticado
 */

const categories = [
  'Salud',
  'Educación',
  'Bienestar',
  'Productividad',
  'Finanzas',
  'Relaciones',
  'Creatividad',
];

const frequencyOptions = [
  { value: 1, label: '1 vez por semana', description: 'Un compromiso ligero' },
  { value: 2, label: '2 veces por semana', description: 'Ritmo moderado' },
  { value: 3, label: '3 veces por semana', description: 'Constancia media' },
  { value: 4, label: '4 veces por semana', description: 'Compromiso fuerte' },
  { value: 5, label: '5 veces por semana', description: 'Entre semana' },
  { value: 6, label: '6 veces por semana', description: 'Casi diario' },
  { value: 7, label: 'Todos los días', description: 'Máximo compromiso' },
];

export function HabitForm({ habitId, existingHabit, onSave, onBack }: HabitFormProps) {
  const isEditing = habitId !== null;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    frequency: 3,
    points: 10, // puntos base por completar
  });

  // Cargar datos del hábito existente si estamos editando
  useEffect(() => {
    if (isEditing && existingHabit) {
      setFormData({
        name: existingHabit.name,
        description: existingHabit.description,
        category: existingHabit.category,
        frequency: existingHabit.frequency,
        points: existingHabit.points,
      });
    }
  }, [isEditing, existingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend: POST /api/habits/ o PUT /api/habits/{habitId}/
    onSave(formData);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-neutral-900 mb-2">
            {isEditing ? 'Editar hábito' : 'Crear nuevo hábito'}
          </h1>
          <p className="text-neutral-600">
            {isEditing
              ? 'Actualiza la información de tu hábito'
              : 'Define tu nuevo hábito y establece tu frecuencia objetivo'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 form-habit">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Dale un nombre y descripción a tu hábito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Nombre del hábito *</Label>
                <Input
                  id="habit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Meditar 10 minutos"
                  required
                  className="input-habit-name"
                />
                <p className="text-neutral-500 text-sm">
                  Sé específico sobre qué quieres lograr
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="habit-description">Descripción (opcional)</Label>
                <Textarea
                  id="habit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Meditación diaria para reducir estrés y mejorar concentración"
                  rows={3}
                  className="input-habit-description resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={formData.category === category ? 'default' : 'outline'}
                      className="cursor-pointer badge-category-select text-xs sm:text-sm"
                      onClick={() => setFormData({ ...formData, category })}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>Frecuencia objetivo</CardTitle>
              <CardDescription>
                ¿Cuántas veces por semana quieres realizar este hábito?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:gap-3">
                {frequencyOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, frequency: option.value })}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all frequency-option ${
                      formData.frequency === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-900 mb-1 text-sm sm:text-base">
                          {option.label}
                        </p>
                        <p className="text-neutral-600 text-xs sm:text-sm">
                          {option.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.frequency === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-neutral-300'
                        }`}
                      >
                        {formData.frequency === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="alert-info bg-blue-50 border-blue-200">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Cómo funciona:</strong> Cada vez que completes este hábito ganarás puntos. 
                  Cumplir con tu frecuencia semanal te dará bonificaciones extras y mantendrá tu racha activa.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Visual Example */}
          <Card className="card-frequency-example bg-gradient-to-br from-blue-50 to-green-50 border-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-neutral-900 mb-4 text-sm sm:text-base">Tu semana se verá así:</h3>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm ${
                      index < formData.frequency
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border-2 border-neutral-200 text-neutral-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 text-xs sm:text-sm mt-4 text-center">
                Necesitarás completar este hábito en {formData.frequency} {formData.frequency === 1 ? 'día' : 'días'} de la semana
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" onClick={onBack} variant="outline" className="flex-1 btn-cancel">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 btn-save gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'Guardar cambios' : 'Crear hábito'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}