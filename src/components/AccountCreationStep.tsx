import React, { useState, useEffect, useCallback } from 'react';
import { Student } from '../types/Student';
import { generateAndDownloadStudentPDF, generateAndDownloadAllStudentsPDF } from '../utils/pdfGenerator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Loader2, Download, RotateCcw } from 'lucide-react';

interface AccountCreationStepProps {
  students: Student[];
  onBack: () => void;
  onClose: () => void;
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
  onClose
}) => {
  const [creationStatuses, setCreationStatuses] = useState<StudentCreationStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<CreationStatus>('pending');
  const [showPDFOptions, setShowPDFOptions] = useState(false);

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
      
      try {
        await simulateAccountCreation(student);
        
        // Update status to completed
        setCreationStatuses(prev => 
          prev.map((status, index) => 
            index === i 
              ? { ...status, status: 'completed' as CreationStatus }
              : status
          )
        );
      } catch (error) {
        // Update status to error
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
    }
    
    setOverallStatus('completed');
    setShowPDFOptions(true);
  }, [students, overallStatus]);

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

  return (
    <div className="flex flex-col h-full space-y-6 py-4">
      <div className="space-y-2">
        {overallStatus === 'creating' && (
          <p className="text-sm text-muted-foreground">Creating accounts for {students.length} students... Please wait.</p>
        )}
        {overallStatus === 'completed' && (
          <p className="text-sm text-muted-foreground">
            {completedCount} student accounts created
          </p>
        )}
      </div>


      {(overallStatus === 'creating' || overallStatus === 'completed') && (
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="space-y-4">
              {creationStatuses.map((statusItem, index) => (
                <div key={statusItem.student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {statusItem.status === 'pending' && <span className="text-lg">⏳</span>}
                    {statusItem.status === 'creating' && <Loader2 className="h-5 w-5 animate-spin" />}
                    {statusItem.status === 'completed' && <CheckCircle className="h-5 w-5 text-success" />}
                    {statusItem.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {statusItem.student.firstName} {statusItem.student.lastInitial}.
                      </span>
                      <span className="text-sm text-muted-foreground">{getStatusText(statusItem.status)}</span>
                      {statusItem.error && (
                        <span className="text-sm text-red-600">{statusItem.error}</span>
                      )}
                    </div>
                  </div>
                  
                  {statusItem.status === 'completed' && showPDFOptions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadIndividualPDF(statusItem.student)}
                      title="Download PDF credentials"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {statusItem.status === 'error' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryIndividualAccount(index)}
                      title="Retry account creation"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showPDFOptions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Download printable credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download PDF files with login credentials. You can print these and give them to your students.
            </p>
            
            <Button
              onClick={handleDownloadAllPDFs}
              disabled={completedCount === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download all credentials ({completedCount} students)
            </Button>

          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AccountCreationStep;