export interface Student {
  id: string;
  firstName: string;
  lastInitial: string;
  password: string;
  username?: string;
  isExisting?: boolean;
}

export interface StudentFormData {
  firstName: string;
  lastInitial: string;
  password: string;
}

export interface ParsedStudentData {
  students: Student[];
  errors: string[];
  warnings?: string[];
  contentType?: 'student_list' | 'mixed_content' | 'unlikely_student_content';
  confidence?: number;
  needsValidation?: boolean;
}

export type ModalStep = 'accountType' | 'input' | 'review' | 'creation' | 'linkExisting';