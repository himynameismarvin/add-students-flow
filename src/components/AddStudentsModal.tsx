import React, { useState, useRef } from 'react';
import { Student, ModalStep } from '../types/Student';
import AccountTypeSelection from './AccountTypeSelection';
import StudentInputStep, { StudentInputStepRef } from './StudentInputStep';
import StudentReviewStep, { StudentReviewStepRef } from './StudentReviewStep';
import AccountCreationStep from './AccountCreationStep';
import LinkExistingAccounts from './LinkExistingAccounts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStudentsModal: React.FC<AddStudentsModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('accountType');
  const [students, setStudents] = useState<Student[]>([]);
  const [hasInputText, setHasInputText] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inputStepLoading, setInputStepLoading] = useState(false);
  const inputStepRef = useRef<StudentInputStepRef>(null);
  const reviewStepRef = useRef<StudentReviewStepRef>(null);

  const handleNext = (stepData?: any) => {
    switch (currentStep) {
      case 'input':
        if (stepData?.students) {
          setStudents(stepData.students);
        }
        setCurrentStep('review');
        break;
      case 'review':
        setCurrentStep('creation');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'input':
        setCurrentStep('accountType');
        break;
      case 'review':
        setCurrentStep('input');
        break;
      case 'creation':
        setCurrentStep('review');
        break;
      case 'linkExisting':
        setCurrentStep('accountType');
        break;
    }
  };

  const handleSelectCreateNew = () => {
    setCurrentStep('input');
  };

  const handleSelectLinkExisting = () => {
    setCurrentStep('linkExisting');
  };

  const shouldShowConfirmation = () => {
    if (currentStep === 'linkExisting') {
      return false;
    }
    
    if (currentStep === 'accountType') {
      return false;
    }
    
    return hasInputText || hasUploadedFile || currentStep === 'review' || currentStep === 'creation';
  };

  const handleCloseAttempt = () => {
    if (shouldShowConfirmation()) {
      setShowConfirmation(true);
    } else {
      handleForceClose();
    }
  };

  const handleForceClose = () => {
    setCurrentStep('accountType');
    setStudents([]);
    setHasInputText(false);
    setHasUploadedFile(false);
    setShowConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 'accountType':
        return (
          <AccountTypeSelection
            onSelectCreateNew={handleSelectCreateNew}
            onSelectLinkExisting={handleSelectLinkExisting}
          />
        );
      case 'input':
        return <StudentInputStep ref={inputStepRef} onNext={handleNext} onBack={handleBack} onClose={handleCloseAttempt} onInputChange={setHasInputText} onFileUpload={setHasUploadedFile} onLoadingChange={setInputStepLoading} />;
      case 'review':
        return (
          <StudentReviewStep
            ref={reviewStepRef}
            students={students}
            onStudentsChange={setStudents}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'creation':
        return (
          <AccountCreationStep
            students={students}
            onBack={handleBack}
            onClose={handleForceClose}
          />
        );
      case 'linkExisting':
        return (
          <LinkExistingAccounts
            onBack={handleBack}
            onClose={handleForceClose}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'accountType':
        return 'Add students';
      case 'input':
        return 'Add students';
      case 'review':
        return 'Review student information';
      case 'creation':
        return 'Create accounts';
      case 'linkExisting':
        return 'Link existing accounts';
      default:
        return '';
    }
  };

  const renderStepFooter = () => {
    switch (currentStep) {
      case 'accountType':
        return null; // No footer for account type selection
      case 'input':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <Button
              onClick={() => {
                inputStepRef.current?.handleTextParse();
              }}
              disabled={(!hasInputText && !hasUploadedFile) || inputStepLoading}
            >
              {inputStepLoading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        );
      case 'review':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              ← Back to input
            </Button>
            <Button
              onClick={() => {
                reviewStepRef.current?.handleContinue();
              }}
              disabled={students.length === 0}
            >
              Create account{students.length !== 1 ? 's' : ''} →
            </Button>
          </div>
        );
      case 'creation':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <Button onClick={handleForceClose}>
              Done
            </Button>
          </div>
        );
      case 'linkExisting':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
            <Button onClick={handleForceClose}>
              Done
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseAttempt()}>
      <DialogContent className="w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{getStepTitle()}</DialogTitle>
          </DialogHeader>
          
          {/* Progress Steps - only show for create new accounts flow */}
          {(currentStep === 'input' || currentStep === 'review' || currentStep === 'creation') && (
            <div className="flex justify-center items-center space-x-8 py-4 border-t border-b" style={{backgroundColor: '#FBFBFB', borderColor: '#EBEAE8'}}>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'input' ? 'bg-primary text-primary-foreground' : 
                  (currentStep === 'review' || currentStep === 'creation') ? 'bg-success text-success-foreground' : 
                  'text-muted-foreground'
                )} style={currentStep !== 'input' && currentStep !== 'review' && currentStep !== 'creation' ? {backgroundColor: '#EBEAE8'} : {}}>
                  {(currentStep === 'review' || currentStep === 'creation') ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    '1'
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'input' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  Input
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'review' ? 'bg-primary text-primary-foreground' :
                  currentStep === 'creation' ? 'bg-success text-success-foreground' :
                  'text-muted-foreground'
                )} style={currentStep !== 'review' && currentStep !== 'creation' ? {backgroundColor: '#EBEAE8'} : {}}>
                  {currentStep === 'creation' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    '2'
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'review' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  Review
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'creation' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )} style={currentStep !== 'creation' ? {backgroundColor: '#EBEAE8'} : {}}>
                  3
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  currentStep === 'creation' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  Create
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto px-6">
          {renderStepContent()}
        </div>

        {/* Fixed Footer - only show when there's content */}
        {renderStepFooter() && (
          <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: '#EBEAE8' }}>
            {renderStepFooter()}
          </div>
        )}
      </DialogContent>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Close and lose progress?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have unsaved progress that will be lost if you close this window.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelClose}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleForceClose}>
                Close and lose progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AddStudentsModal;