/**
 * Servicio de autenticación para comunicarse con el backend Django
 */
import api from '../utils/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
}

class AuthService {
  /**
   * Login del usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Usar /auth/login/ que mapea a /api/auth/login/ o directamente
    const response = await api.post<AuthResponse>('/auth/login/', {
      username: credentials.username,
      password: credentials.password,
    });
    
    // Guardar tokens en localStorage
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    return response.data;
  }

  /**
   * Registro de nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', {
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm || data.password,
    });
    
    // Guardar tokens en localStorage
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    
    return response.data;
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('habitmaster_profile');
    localStorage.removeItem('habitmaster_habits');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Obtener token de acceso actual
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();

