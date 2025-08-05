import React, { useState } from 'react';
import { Student } from '../types/Student';
import StudentCard from './StudentCard';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import { Users } from 'lucide-react';
import { generatePassword } from '../utils/passwordGenerator';

interface StudentReviewStepProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const StudentReviewStep: React.FC<StudentReviewStepProps> = ({
  students,
  onStudentsChange,
  onNext,
  onBack
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const handleStudentUpdate = (index: number, updatedStudent: Student) => {
    const newStudents = [...students];
    newStudents[index] = updatedStudent;
    onStudentsChange(newStudents);
  };

  const handleStudentRemove = (index: number) => {
    const newStudents = students.filter((_, i) => i !== index);
    onStudentsChange(newStudents);
    
    // If no students left, go back to input step
    if (newStudents.length === 0) {
      onBack();
    }
  };


  // Validation logic
  const validateStudent = (student: Student) => ({
    firstName: !student.firstName.trim() ? 'required' : (!/^[A-Za-z0-9-]+$/.test(student.firstName) ? 'invalid' : null),
    lastInitial: !student.lastInitial ? 'required' : (!/^[A-Za-z]$/.test(student.lastInitial) ? 'invalid' : null),
    password: !student.password.trim() ? 'required' : (!/^[A-Za-z0-9]+$/.test(student.password) ? 'invalid' : null)
  });

  const validationErrors = students.map(validateStudent);
  const hasErrors = validationErrors.some(errors => errors.firstName || errors.lastInitial || errors.password);
  const canProceed = students.length > 0 && !hasErrors;

  const handleNext = () => {
    if (hasErrors) {
      setShowValidation(true);
    } else {
      onNext();
    }
  };

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: Date.now().toString(),
      firstName: '',
      lastInitial: '',
      password: generatePassword()
    };
    onStudentsChange([...students, newStudent]);
    // Reset validation when adding a new student
    setShowValidation(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Review <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''} and make any necessary changes.
        </p>
        {showValidation && hasErrors && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {validationErrors.some(e => e.firstName === 'required') && <li>First name is required</li>}
              {validationErrors.some(e => e.firstName === 'invalid') && <li>First names must only contain letters, numbers, and hyphens</li>}
              {validationErrors.some(e => e.lastInitial === 'required') && <li>Last initial is required</li>}
              {validationErrors.some(e => e.lastInitial === 'invalid') && <li>Last initial must be a letter</li>}
              {validationErrors.some(e => e.password === 'required') && <li>Password is required</li>}
              {validationErrors.some(e => e.password === 'invalid') && <li>Passwords must only contain letters and numbers</li>}
            </ul>
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No students to review</h4>
            <p className="text-sm text-muted-foreground">Go back to add some students to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/3">First name</TableHead>
                  <TableHead className="w-28 text-center">Last initial</TableHead>
                  <TableHead className="w-1/3">Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onUpdate={(updatedStudent) => handleStudentUpdate(index, updatedStudent)}
                    onRemove={() => handleStudentRemove(index)}
                    showValidation={showValidation}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {students.length > 0 && (
        <div className="text-left -mt-2">
          <button
            onClick={handleAddStudent}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            + Add another student
          </button>
        </div>
      )}

      <div className="-mx-6 border-t">
        <div className="flex justify-between pt-4 px-6">
          <Button variant="outline" onClick={onBack}>
            ← Back to input
          </Button>
          <Button
            onClick={handleNext}
            disabled={students.length === 0}
          >
            Create account{students.length !== 1 ? 's' : ''} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentReviewStep;