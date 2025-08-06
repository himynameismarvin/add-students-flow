import React from 'react';
import { Student } from '../types/Student';
import { generatePassword } from '../utils/passwordGenerator';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { TableRow, TableCell } from './ui/table';
import { Dices, Trash2 } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
  onRemove: () => void;
  showValidation?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onUpdate, onRemove, showValidation = false }) => {
  const handleFirstNameChange = (value: string) => {
    // Only allow letters, numbers, and hyphens
    const filteredValue = value.replace(/[^A-Za-z0-9-]/g, '');
    onUpdate({
      ...student,
      firstName: filteredValue
    });
  };

  const handleLastInitialChange = (value: string) => {
    // Only allow single character and convert to uppercase
    const initial = value.charAt(0).toUpperCase();
    onUpdate({
      ...student,
      lastInitial: initial
    });
  };

  const handlePasswordChange = (value: string) => {
    // Only allow letters and numbers
    const filteredValue = value.replace(/[^A-Za-z0-9]/g, '');
    onUpdate({
      ...student,
      password: filteredValue
    });
  };

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    onUpdate({
      ...student,
      password: newPassword
    });
  };

  // Validation logic
  const isFirstNameInvalid = showValidation && (!student.firstName.trim() || !/^[A-Za-z0-9-]+$/.test(student.firstName));
  const isLastInitialInvalid = showValidation && (!student.lastInitial || !/^[A-Za-z]$/.test(student.lastInitial));
  const isPasswordInvalid = showValidation && (!student.password.trim() || !/^[A-Za-z0-9]+$/.test(student.password));

  return (
    <TableRow>
      <TableCell>
        <Input
          type="text"
          value={student.firstName}
          onChange={(e) => handleFirstNameChange(e.target.value)}
          className={`border p-2 focus:ring-1 focus:ring-ring ${
            isFirstNameInvalid ? 'border-red-500' : ''
          }`}
          style={{ borderColor: isFirstNameInvalid ? '#ef4444' : '#959594' }}
        />
      </TableCell>
      
      <TableCell className="text-center">
        <Input
          type="text"
          value={student.lastInitial}
          onChange={(e) => handleLastInitialChange(e.target.value)}
          className={`border p-2 focus:ring-1 focus:ring-ring text-center w-12 mx-auto ${
            isLastInitialInvalid ? 'border-red-500' : ''
          }`}
          style={{ borderColor: isLastInitialInvalid ? '#ef4444' : '#959594' }}
          maxLength={1}
        />
      </TableCell>
      
      <TableCell>
        <div className="relative">
          <Input
            type="text"
            value={student.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={`border p-2 pr-10 focus:ring-1 focus:ring-ring ${
              isPasswordInvalid ? 'border-red-500' : ''
            }`}
            style={{ borderColor: isPasswordInvalid ? '#ef4444' : '#959594' }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRegeneratePassword}
            title="Generate new password"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <Dices className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default StudentCard;