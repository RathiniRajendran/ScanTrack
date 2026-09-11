export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: string[];
}
