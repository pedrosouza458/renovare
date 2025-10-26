export interface User {
  id: string;
  username: string;
  email: string;
  cpf: string;
  points?: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  cpf: string;
  password: string;
  points?: number;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  cpf?: string;
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