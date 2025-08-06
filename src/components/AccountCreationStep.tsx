import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Student } from '../types/Student';
import { generateAndDownloadStudentPDF, generateAndDownloadAllStudentsPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Loader2, Download, RotateCcw } from 'lucide-react';

interface AccountCreationStepProps {
  students: Student[];
  onBack: () => void;
  onClose: () => void;
  onStatusChange?: (isCompleted: boolean) => void;
}

type CreationStatus = 'pending' | 'creating' | 'completed' | 'error';

interface StudentCreationStatus {
  student: Student;
  status: CreationStatus;
  error?: string;
}

const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  students,
  onBack,
  onClose,
  onStatusChange
}) => {
  const [creationStatuses, setCreationStatuses] = useState<StudentCreationStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<CreationStatus>('pending');
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const downloadSectionRef = useRef<HTMLDivElement>(null);

  const simulateAccountCreation = async (student: Student): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Account creation failed');
    }
  };


  const createAccounts = useCallback(async () => {
    if (overallStatus !== 'pending') return; // Prevent multiple runs
    
    setOverallStatus('creating');
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Update status to creating
      setCreationStatuses(prev => 
        prev.map((status, index) => 
          index === i 
            ? { ...status, status: 'creating' as CreationStatus }
            : status
        )
      );
      
      let attemptCount = 0;
      let success = false;
      
      while (attemptCount < 2 && !success) {
        try {
          await simulateAccountCreation(student);
          success = true;
          
          // Update status to completed
          setCreationStatuses(prev => 
            prev.map((status, index) => 
              index === i 
                ? { ...status, status: 'completed' as CreationStatus }
                : status
            )
          );
        } catch (error) {
          attemptCount++;
          
          if (attemptCount >= 2) {
            // Final failure after retry
            setCreationStatuses(prev => 
              prev.map((status, index) => 
                index === i 
                  ? { 
                      ...status, 
                      status: 'error' as CreationStatus,
                      error: error instanceof Error ? error.message : 'Unknown error'
                    }
                  : status
              )
            );
          }
          // If first attempt failed, continue to retry automatically
        }
      }
    }
    
    setOverallStatus('completed');
    setShowPDFOptions(true);
    onStatusChange?.(true);
  }, [students, overallStatus, onStatusChange]);

  useEffect(() => {
    // Initialize statuses
    const initialStatuses = students.map(student => ({
      student,
      status: 'pending' as CreationStatus
    }));
    setCreationStatuses(initialStatuses);
    
    // Automatically start account creation (only once)
    if (overallStatus === 'pending') {
      createAccounts();
    }
  }, [students]); // Remove createAccounts from dependencies

  const retryIndividualAccount = async (index: number) => {
    const student = students[index];
    
    setCreationStatuses(prev => 
      prev.map((status, i) => 
        i === index 
          ? { ...status, status: 'creating' as CreationStatus, error: undefined }
          : status
      )
    );
    
    try {
      await simulateAccountCreation(student);
      setCreationStatuses(prev => 
        prev.map((status, i) => 
          i === index 
            ? { ...status, status: 'completed' as CreationStatus }
            : status
        )
      );
    } catch (error) {
      setCreationStatuses(prev => 
        prev.map((status, i) => 
          i === index 
            ? { 
                ...status, 
                status: 'error' as CreationStatus,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : status
        )
      );
    }
  };

  const retryFailedAccounts = async () => {
    const failedIndexes = creationStatuses
      .map((status, index) => status.status === 'error' ? index : -1)
      .filter(index => index !== -1);
    
    for (const index of failedIndexes) {
      await retryIndividualAccount(index);
    }
  };

  const handleDownloadIndividualPDF = (student: Student) => {
    generateAndDownloadStudentPDF(student);
  };

  const handleDownloadAllPDFs = () => {
    const successfulStudents = creationStatuses
      .filter(status => status.status === 'completed')
      .map(status => status.student);
    
    generateAndDownloadAllStudentsPDF(successfulStudents);
  };


  const getStatusText = (status: CreationStatus) => {
    switch (status) {
      case 'pending':
        return 'Waiting...';
      case 'creating':
        return 'Creating account...';
      case 'completed':
        return 'Account created!';
      case 'error':
        return 'Failed to create';
      default:
        return 'Waiting...';
    }
  };

  const completedCount = creationStatuses.filter(s => s.status === 'completed').length;
  const errorCount = creationStatuses.filter(s => s.status === 'error').length;
  const hasErrors = errorCount > 0;

  const progressPercentage = students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full space-y-6 py-4">
      {/* Progress Summary */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            {overallStatus === 'creating' && `Creating ${students.length} student accounts...`}
            {overallStatus === 'completed' && `${completedCount} student accounts created successfully`}
            {overallStatus === 'pending' && `Ready to create ${students.length} student accounts`}
          </h3>
          {overallStatus === 'creating' && (
            <p className="text-sm text-muted-foreground">
              {completedCount} of {students.length} accounts created
            </p>
          )}
        </div>
        
        {/* Progress Bar */}
        {(overallStatus === 'creating' || overallStatus === 'completed') && (
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-success h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
        
        {/* Retry Button for Failed Accounts */}
        {hasErrors && overallStatus === 'completed' && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={retryFailedAccounts}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry failed accounts ({errorCount})
            </Button>
          </div>
        )}
      </div>

      {/* Download Section - Always visible but button disabled until complete */}
      <Card ref={downloadSectionRef}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Download printable login credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Print and place in student agendas so they can play at home too!
          </p>
          
          <Button
            onClick={handleDownloadAllPDFs}
            disabled={overallStatus !== 'completed' || completedCount === 0}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {overallStatus === 'completed' 
              ? `Download all credentials (${completedCount} students)`
              : 'Download will be available soon'
            }
          </Button>

          {hasErrors && overallStatus === 'completed' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {errorCount} account{errorCount !== 1 ? 's' : ''} failed to create. 
                Only {completedCount} credential{completedCount !== 1 ? 's' : ''} will be downloaded.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default AccountCreationStep;