export interface User {
  id: string;
  username: string;
  email: string;
  points?: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  points?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  points?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateScoreData {
  score: number;
}