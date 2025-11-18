import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Target, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';
import { toast } from 'sonner';

interface AuthScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AuthScreen({ onLogin, onBack }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    registerName: '',
    registerEmail: '',
    registerPassword: '',
    registerConfirm: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar username o email para login (Django acepta ambos)
      const username = formData.loginEmail.includes('@') 
        ? formData.loginEmail 
        : formData.loginEmail;

      await authService.login({
        username: username,
        password: formData.loginPassword,
      });

      toast.success('¡Bienvenido!');
      onLogin();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.error 
        || error.message 
        || 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.registerPassword !== formData.registerConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.registerPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        username: formData.registerName || formData.registerEmail.split('@')[0],
        email: formData.registerEmail,
        password: formData.registerPassword,
        password_confirm: formData.registerConfirm,
      });

      toast.success('¡Cuenta creada exitosamente!');
      onLogin();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.detail 
        || error.message 
        || 'Error al crear la cuenta';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Button onClick={onBack} variant="ghost" className="gap-2 dark:text-neutral-300">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </header>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-neutral-900 dark:text-white mb-2 text-2xl font-bold">HabitMaster</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Tu compañero para construir mejores hábitos
            </p>
          </motion.div>

          {/* Auth Form */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Login Tab */}
              {activeTab === 'login' && (
                <TabsContent value="login" asChild>
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Bienvenido de nuevo</CardTitle>
                        <CardDescription>
                          Ingresa tus credenciales para continuar
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4 form-auth">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Usuario o Correo electrónico</Label>
                            <Input
                              id="login-email"
                              type="text"
                              placeholder="usuario o tu@email.com"
                              required
                              value={formData.loginEmail}
                              onChange={(e) => handleInputChange('loginEmail', e.target.value)}
                              disabled={loading}
                              className="input-email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="login-password">Contraseña</Label>
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              required
                              value={formData.loginPassword}
                              onChange={(e) => handleInputChange('loginPassword', e.target.value)}
                              disabled={loading}
                              className="input-password"
                            />
                          </div>

                          <Button type="submit" className="w-full btn-primary" disabled={loading}>
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando sesión...
                              </>
                            ) : (
                              'Iniciar sesión'
                            )}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white dark:bg-slate-900 px-2 text-neutral-500">
                                O continuar con
                              </span>
                            </div>
                          </div>

                          {/* Google Auth - Preparado para futura integración */}
                          <Button type="button" variant="outline" className="w-full btn-google gap-2" disabled>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            Continuar con Google
                          </Button>

                          <p className="text-center text-sm text-neutral-500">
                            ¿Olvidaste tu contraseña?{' '}
                            <button type="button" className="text-blue-600 hover:underline">
                              Recuperar
                            </button>
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}

              {/* Register Tab */}
              {activeTab === 'register' && (
                <TabsContent value="register" asChild>
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Crear cuenta</CardTitle>
                        <CardDescription>
                          Comienza tu viaje hacia mejores hábitos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4 form-auth">
                          <div className="space-y-2">
                            <Label htmlFor="register-name">Nombre de usuario</Label>
                            <Input
                              id="register-name"
                              type="text"
                              placeholder="juanperez"
                              required
                              value={formData.registerName}
                              onChange={(e) => handleInputChange('registerName', e.target.value)}
                              disabled={loading}
                              className="input-name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-email">Correo electrónico</Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="tu@email.com"
                              required
                              value={formData.registerEmail}
                              onChange={(e) => handleInputChange('registerEmail', e.target.value)}
                              disabled={loading}
                              className="input-email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-password">Contraseña</Label>
                            <Input
                              id="register-password"
                              type="password"
                              placeholder="••••••••"
                              required
                              value={formData.registerPassword}
                              onChange={(e) => handleInputChange('registerPassword', e.target.value)}
                              disabled={loading}
                              minLength={8}
                              className="input-password"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-confirm">Confirmar contraseña</Label>
                            <Input
                              id="register-confirm"
                              type="password"
                              placeholder="••••••••"
                              required
                              value={formData.registerConfirm}
                              onChange={(e) => handleInputChange('registerConfirm', e.target.value)}
                              disabled={loading}
                              className="input-password-confirm"
                            />
                          </div>

                          <Button type="submit" className="w-full btn-primary" disabled={loading}>
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando cuenta...
                              </>
                            ) : (
                              'Crear cuenta'
                            )}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-neutral-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white dark:bg-slate-900 px-2 text-neutral-500">
                                O continuar con
                              </span>
                            </div>
                          </div>

                          {/* Google Auth - Preparado para futura integración */}
                          <Button type="button" variant="outline" className="w-full btn-google gap-2" disabled>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            Registrarse con Google
                          </Button>

                          <p className="text-center text-sm text-neutral-500">
                            Al crear una cuenta, aceptas nuestros{' '}
                            <button type="button" className="text-blue-600 hover:underline">
                              Términos y Condiciones
                            </button>
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
