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
}

export type ModalStep = 'accountType' | 'input' | 'review' | 'creation' | 'linkExisting';