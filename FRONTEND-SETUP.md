# 🎨 Configuração do Frontend - MangoBeat AI

## 📦 Setup Rápido

### 1. Criar arquivo `.env` no frontend

```env
# Backend API URL
VITE_API_URL=https://mangobeat-backend.onrender.com/api/v1

# Ou se ainda estiver testando localmente:
# VITE_API_URL=http://localhost:3001/api/v1
```

---

## 🔌 Configurar API Client

### Arquivo: `src/config/api.ts`

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies/sessions
};
```

---

### Arquivo: `src/services/api.ts`

```typescript
import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Criar instância do axios
export const api = axios.create(API_CONFIG);

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // CORS ou network error
    if (!error.response) {
      console.error('Network error - verifique se o backend está online');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🔐 Serviço de Autenticação

### Arquivo: `src/services/auth.service.ts`

```typescript
import { api } from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

class AuthService {
  async register(data: RegisterData) {
    const response = await api.post<AuthResponse['user']>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginData) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Salvar token
    localStorage.setItem('authToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
```

---

## 🎵 Serviço de Tracks

### Arquivo: `src/services/track.service.ts`

```typescript
import { api } from './api';

export interface GenerateTrackData {
  title: string;
  description?: string;
  genre: string;
  tags: string[];
  audioPrompt: string;
  imagePrompt: string;
}

export interface Track {
  id: string;
  title: string;
  description?: string;
  audioUrl?: string;
  imageUrl?: string;
  genre: string;
  tags: string[];
  duration?: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  metadata?: any;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateTrackResponse {
  message: string;
  trackId: string;
  jobId?: string;
  estimatedTime: string;
}

class TrackService {
  async generateTrack(data: GenerateTrackData) {
    const response = await api.post<GenerateTrackResponse>('/tracks/generate', data);
    return response.data;
  }

  async getTrack(id: string) {
    const response = await api.get<Track>(`/tracks/${id}`);
    return response.data;
  }

  async listTracks() {
    const response = await api.get<Track[]>('/tracks');
    return response.data;
  }

  async getTracksByGenre(genre: string) {
    const response = await api.get<Track[]>(`/tracks/genre/${genre}`);
    return response.data;
  }

  async updateTrack(id: string, data: Partial<Track>) {
    const response = await api.put<Track>(`/tracks/${id}`, data);
    return response.data;
  }

  async deleteTrack(id: string) {
    await api.delete(`/tracks/${id}`);
  }
}

export const trackService = new TrackService();
```

---

## 📊 Serviço de Trends

### Arquivo: `src/services/trend.service.ts`

```typescript
import { api } from './api';

export interface Trend {
  id: string;
  hashtag: string;
  title: string;
  description?: string;
  videoCount: number;
  viewCount: string;
  category?: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

class TrendService {
  async getPopular(limit: number = 20) {
    const response = await api.get<Trend[]>(`/trends/popular`, {
      params: { limit }
    });
    return response.data;
  }

  async getTrending(limit: number = 10) {
    const response = await api.get<Trend[]>(`/trends/trending`, {
      params: { limit }
    });
    return response.data;
  }

  async getTrendByHashtag(hashtag: string) {
    const response = await api.get<Trend>(`/trends/hashtag/${hashtag}`);
    return response.data;
  }
}

export const trendService = new TrendService();
```

---

## 🎯 Exemplo de Uso em Componente React

### Login Component

```typescript
import { useState } from 'react';
import { authService } from '../services/auth.service';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### Generate Track Component

```typescript
import { useState } from 'react';
import { trackService } from '../services/track.service';

export function GenerateTrackPage() {
  const [formData, setFormData] = useState({
    title: '',
    genre: 'phonk',
    tags: ['phonk'],
    audioPrompt: '',
    imagePrompt: '',
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await trackService.generateTrack(formData);
      setResult(response);
      
      // Polling para verificar quando track estiver pronta
      pollTrackStatus(response.trackId);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao gerar track');
    } finally {
      setGenerating(false);
    }
  };

  const pollTrackStatus = async (trackId: string) => {
    const interval = setInterval(async () => {
      try {
        const track = await trackService.getTrack(trackId);
        
        if (track.status === 'COMPLETED') {
          clearInterval(interval);
          alert('Track pronta!');
          // Redirecionar ou atualizar UI
        } else if (track.status === 'FAILED') {
          clearInterval(interval);
          alert('Falha ao gerar track');
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 5000); // Verificar a cada 5 segundos
  };

  return (
    <div>
      <input
        placeholder="Título da track"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        placeholder="Descreva o som que deseja (ex: Heavy phonk with 808 bass)"
        value={formData.audioPrompt}
        onChange={(e) => setFormData({ ...formData, audioPrompt: e.target.value })}
      />
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Gerando...' : 'Gerar Track'}
      </button>
      
      {result && (
        <div>
          <p>Track ID: {result.trackId}</p>
          <p>Tempo estimado: {result.estimatedTime}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testar Conexão

### Arquivo: `src/utils/testConnection.ts`

```typescript
import { api } from '../services/api';

export async function testBackendConnection() {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend conectado:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar backend:', error);
    return false;
  }
}

// Chamar ao iniciar app
testBackendConnection();
```

---

## 📦 Instalar Dependências

```bash
npm install axios
```

---

## ✅ Checklist de Integração

- [ ] Arquivo `.env` criado com `VITE_API_URL`
- [ ] `api.ts` configurado com axios
- [ ] Interceptors de request/response implementados
- [ ] Services criados (auth, track, trend)
- [ ] Token salvo no localStorage após login
- [ ] Token enviado em todas requisições
- [ ] Tratamento de erros 401 (redirect para login)
- [ ] Testado health endpoint
- [ ] Testado login/register
- [ ] Testado geração de track

---

## 🎯 URLs Importantes

### Desenvolvimento:
```
http://localhost:3001/api/v1
```

### Produção (Render):
```
https://mangobeat-backend.onrender.com/api/v1
```

---

## 🐛 Troubleshooting

### CORS Error?
- Verifique se URL do frontend está em `CORS_ORIGINS` no backend
- Confirme que está usando `https://` (não `http://`)
- Adicione no Render: Environment → CORS_ORIGINS

### 401 Unauthorized?
- Token expirou (15 min)
- Faça login novamente
- Verifique se token está sendo enviado no header

### Network Error?
- Backend está online? Teste: `https://seu-backend.com/api/v1/health`
- URL está correta no `.env`?
- CORS está configurado?

---

**Frontend pronto para conectar! 🎨🔌**
