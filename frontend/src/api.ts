import axios from "axios";
import type { Group, User, Exercise, Shooting } from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

console.log("API_URL =", import.meta.env.VITE_API_URL);

// автоматически добавляем токен
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;

// аутентификация
export const login = (form: FormData) => api.post<{ access_token: string }>("/auth/token", form);
export const getMe = () => api.get<User>("/auth/me");

// группы
export const getGroups = () => api.get<Group[]>("/groups");
export const createGroup = (name: string) => api.post<Group>("/groups", { name });

// студенты
export const getStudents = () => api.get<User[]>("/students");
export const createStudent = (payload: { username: string; password: string; group_id?: number }) =>
  api.post<User>("/students/create", payload);

// упражнения
export const getExercises = () => api.get<Exercise[]>("/exercises");
export const getAvailableExercises = () => api.get<Exercise[]>("/exercises/available");
export const getTeacherExercises = () => api.get<Exercise[]>("/exercises/my-teacher");
export const createExercise = (form: FormData) => api.post<Exercise>("/exercises", form);

// стрельбы
export const getResults = (params?: {
  student_id?: number;
  group_id?: number;
  exercise_id?: number;
  hits_from?: number;
  hits_to?: number;
  time_from?: number;
  time_to?: number;
}) => api.get<Shooting[]>("/shootings", { params });

export const addShooting = (form: FormData) => api.post<Shooting>("/shootings", form);