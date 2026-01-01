import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Campus, Notification, Payment, ReportSummary, Student, User } from './types';

// --- Base Axios Setup ---
export const createAxiosInstance = (): AxiosInstance => {
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
    }

    const instance = axios.create({
        baseURL: 'http://localhost:8000/api/v1/',
        headers: {
            ...(token ? { Authorization: `Token ${token}` } : {}),
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            // Auto-logout on 401
            if (error.response && error.response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    // Optional: redirect to login
                    // window.location.href = '/auth/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Helper for cleaner calls
const get = <T>(url: string) => createAxiosInstance().get<T>(url);
const post = <T>(url: string, data: any) => createAxiosInstance().post<T>(url, data);
const put = <T>(url: string, data: any) => createAxiosInstance().put<T>(url, data);
const patch = <T>(url: string, data: any) => createAxiosInstance().patch<T>(url, data);
const del = <T>(url: string) => createAxiosInstance().delete<T>(url);

// --- API Client Namespaces ---

export const apiClient = {
    auth: {
        login: (data: { username: string; password: string }) => post<{ token: string }>('auth/login/', data),
        me: () => get<User>('auth/me/'),
    },

    students: {
        list: () => get<Student[]>('students/'),
        get: (id: number) => get<Student>(`students/${id}/`),
        create: (data: Partial<Student>) => post<Student>('students/', data),
        update: (id: number, data: Partial<Student>) => patch<Student>(`students/${id}/`, data),
        delete: (id: number) => del(`students/${id}/`),

        // Campus Sub-namespace
        campuses: {
            list: () => get<Campus[]>('students/campuses/'),
            get: (id: number) => get<Campus>(`students/campuses/${id}/`),
            create: (data: Partial<Campus>) => post<Campus>('students/campuses/', data),
            update: (id: number, data: Partial<Campus>) => patch<Campus>(`students/campuses/${id}/`, data),
            delete: (id: number) => del(`students/campuses/${id}/`),
        },
    },

    payments: {
        list: () => get<Payment[]>('payments/'),
        create: (data: Partial<Payment>) => post<Payment>('payments/', data),
        update: (id: number, data: Partial<Payment>) => patch<Payment>(`payments/${id}/`, data),
        // Note: Delete is restricted for posted payments
        delete: (id: number) => del(`payments/${id}/`),
    },

    reports: {
        summary: (studentId: number) => get<ReportSummary>(`reports/${studentId}/`),
        termSummary: (params?: { term?: string; year?: number; campus?: string }) => {
            const query = new URLSearchParams();
            if (params?.term) query.append('term', params.term);
            if (params?.year) query.append('year', params.year.toString());
            if (params?.campus) query.append('campus', params.campus);
            return get(`reports/term-summary/?${query.toString()}`);
        },
        cashierDaily: (params?: { date?: string; cashier_id?: number }) => {
            const query = new URLSearchParams();
            if (params?.date) query.append('date', params.date);
            if (params?.cashier_id) query.append('cashier_id', params.cashier_id.toString());
            return get(`reports/cashier-daily/?${query.toString()}`);
        },
        studentBalance: () => get('reports/student-balance/'),
    },

    notifications: {
        list: () => get<Notification[]>('notifications/'),
    },
};
