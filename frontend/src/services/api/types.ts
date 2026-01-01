export interface User {
    id: number;
    username: string;
    full_name: string;
}

export interface Campus {
    id: number;
    name: string;
    location: string;
    code: string;
}

export interface Student {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    dob: string;
    current_grade: string;
    campus: Campus;
    campus_id?: number; // For creation/update
}

export interface Payment {
    id: number;
    student: number; // Student ID
    amount: string; // Decimal field from backend usually comes as string, or number if casted
    payment_method: string;
    receipt_number: string;
    status: 'pending' | 'posted' | 'voided' | 'failed';
    date: string;
    cashier_name: string;
    cashier_id?: number;
    term?: string;
    academic_year?: number;
    reference_details?: string;
    reference_number?: string;
    transfer_date?: string;
    bank_name?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
}

export interface ReportSummary {
    student: {
        id: number;
        student_number: string;
        first_name: string;
        last_name: string;
        campus: string;
        current_grade: string;
    };
    payments: Payment[];
    total_paid: number;
}
