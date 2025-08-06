import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Student } from '../types/Student';
import StudentCard from './StudentCard';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table';
import { Users } from 'lucide-react';
import { generatePassword } from '../utils/passwordGenerator';
import { capitalizeFirstName } from '../utils/usernameGenerator';

interface StudentReviewStepProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface StudentReviewStepRef {
  handleContinue: () => void;
}

const StudentReviewStep = forwardRef<StudentReviewStepRef, StudentReviewStepProps>(({
  students,
  onStudentsChange,
  onNext,
  onBack
}, ref) => {
  const [showValidation, setShowValidation] = useState(false);
  
  // No username generation needed anymore
  
  const handleStudentUpdate = (index: number, updatedStudent: Student) => {
    const newStudents = [...students];
    // Capitalize first name
    const capitalizedStudent = {
      ...updatedStudent,
      firstName: capitalizeFirstName(updatedStudent.firstName)
    };
    newStudents[index] = capitalizedStudent;
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


  const handleContinue = () => {
    setShowValidation(true);
    
    if (!hasErrors) {
      onNext();
    }
    // If there are errors, validation will show and user needs to fix them
  };

  // Expose handleContinue to parent using useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleContinue
  }), [handleContinue]);

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
    <div className="space-y-4 py-4">
      {/* Header section */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Review <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''} and make any necessary changes.
        </p>
        {showValidation && hasErrors && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3" style={{ borderColor: '#EBEAE8' }}>
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

      {/* Main content area */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No students to review</h4>
            <p className="text-sm text-muted-foreground">Go back to add some students to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-80">First name</TableHead>
                    <TableHead className="w-28 text-center">Last initial</TableHead>
                    <TableHead className="w-80">Password</TableHead>
                    <TableHead className="w-12"></TableHead>
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

          <div className="text-left py-4">
            <button
              onClick={handleAddStudent}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              + Add another student
            </button>
          </div>
        </>
      )}
    </div>
  );
});

StudentReviewStep.displayName = 'StudentReviewStep';

export default StudentReviewStep;