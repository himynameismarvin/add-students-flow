import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
// import { parseStudentText, parseCSV } from '../utils/studentParser';
import { parseStudentDataWithAI } from '../services/aiParser';
import { Student } from '../types/Student';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CloudUpload, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StudentInputStepProps {
  onNext: (data: { students: Student[] }) => void;
  onBack: () => void;
  onClose: () => void;
  onInputChange?: (hasInput: boolean) => void;
  onFileUpload?: (hasFile: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface StudentInputStepRef {
  handleTextParse: () => void;
  isLoading: boolean;
}

const StudentInputStep = forwardRef<StudentInputStepRef, StudentInputStepProps>(({ onNext, onBack, onClose, onInputChange, onFileUpload, onLoadingChange }, ref) => {
  const [inputText, setInputText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [validationWarning, setValidationWarning] = useState<{
    students: Student[];
    warnings: string[];
    contentType?: string;
    confidence?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  const handleInputTextChange = (value: string) => {
    setInputText(value);
    setValidationWarning(null); // Clear validation warning when user changes input
    setParseErrors([]); // Clear text input errors when typing
    onInputChange?.(value.trim().length > 0);
  };

  const handleProceedWithWarning = () => {
    if (validationWarning) {
      onNext({ students: validationWarning.students });
      setValidationWarning(null);
    }
  };

  const handleTryAgain = () => {
    setValidationWarning(null);
    setParseErrors([]);
    setFileErrors([]);
  };

  const getContentTypeMessage = (contentType?: string) => {
    switch (contentType) {
      case 'unlikely_student_content':
        return 'This doesn\'t appear to be a student list. The content seems to be from a document, article, or technical file.';
      case 'mixed_content':
        return 'This appears to contain some names mixed with other content. We extracted what we could find.';
      default:
        return 'We found some potential student names, but we\'re not completely confident about the results.';
    }
  };

  const handleTextParse = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    onLoadingChange?.(true);
    setParseErrors([]);
    
    try {
      const result = await parseStudentDataWithAI(inputText);
      setParseErrors(result.errors);
      
      if (result.needsValidation && result.students.length > 0) {
        // Show validation warning instead of proceeding
        setValidationWarning({
          students: result.students,
          warnings: result.warnings || [],
          contentType: result.contentType,
          confidence: result.confidence
        });
      } else if (result.students.length > 0) {
        onNext({ students: result.students });
      } else {
        setParseErrors(prev => [...prev, 'No student names found in the input text']);
      }
    } catch (error) {
      console.error('Parsing failed:', error);
      setParseErrors(['AI parsing failed. Please check your API key or try again.']);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [inputText, onNext, onLoadingChange]);


  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFileErrors([`File is too large (${Math.round(file.size / 1024 / 1024)}MB). Please use a file smaller than 5MB.`]);
      return;
    }
    
    onFileUpload?.(true);
    setIsLoading(true);
    setIsFileProcessing(true);
    onLoadingChange?.(true);
    setParseErrors([]);
    setFileErrors([]);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        // Use AI parsing for all file types now
        const result = await parseStudentDataWithAI(content);
        setParseErrors(result.errors);
        
        if (result.needsValidation && result.students.length > 0) {
          // Show validation warning instead of proceeding
          setValidationWarning({
            students: result.students,
            warnings: result.warnings || [],
            contentType: result.contentType,
            confidence: result.confidence
          });
        } else if (result.students.length > 0) {
          onNext({ students: result.students });
        } else {
          setFileErrors(['No student names found in the uploaded file']);
        }
      } catch (error) {
        console.error('File parsing failed:', error);
        setFileErrors(['AI parsing failed. Please check your API key or try again.']);
      } finally {
        setIsLoading(false);
        setIsFileProcessing(false);
        onLoadingChange?.(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setFileErrors([]); // Clear file errors when dragging
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Expose methods to parent using useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleTextParse,
    isLoading
  }), [handleTextParse, isLoading]);

  return (
    <div className="flex flex-col h-full space-y-6 py-4 relative">
      {/* Processing Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-blue-700">
              {isFileProcessing ? 'Processing uploaded file...' : 'Analyzing text input...'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This may take a few seconds
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mt-2">
         Paste or type student names in any format. You'll be able to review and edit what we come up with.
          </p>
        </div>
        
        <div className="space-y-3">
          {/* Text Input Section */}
          <div className="space-y-2">
            <Label htmlFor="student-text" className="text-sm font-medium">
              Student names
            </Label>
            <Textarea
              id="student-text"
              value={inputText}
              onChange={(e) => handleInputTextChange(e.target.value)}
              placeholder="Examples:
• John Smith, Jane Doe, Alex Johnson
• From class roster tables
• Email lists with names
• Mixed text with student names
• Any format you have!"
              className="min-h-[220px] resize-none"
            />
            
            {parseErrors.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium text-destructive mb-2">Parsing issues:</h4>
                  <ul className="text-sm text-destructive space-y-1">
                    {parseErrors.map((error, index) => (
                      <li key={index} className="list-disc list-inside">{error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {validationWarning && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-amber-800 text-base">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Please review these results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-amber-700">
                    <p className="mb-2">{getContentTypeMessage(validationWarning.contentType)}</p>
                    {validationWarning.confidence && (
                      <p className="mb-3">
                        Confidence: {Math.round(validationWarning.confidence * 100)}%
                      </p>
                    )}
                  </div>

                  {validationWarning.warnings.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-amber-800 mb-1">Issues found:</h5>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {validationWarning.warnings.map((warning, index) => (
                          <li key={index} className="list-disc list-inside">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-amber-800 mb-2">
                      We found {validationWarning.students.length} potential names:
                    </h5>
                    <div className="max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-1 text-sm text-amber-700">
                        {validationWarning.students.slice(0, 10).map((student, index) => (
                          <div key={index} className="truncate">
                            {student.firstName} {student.lastInitial}
                          </div>
                        ))}
                        {validationWarning.students.length > 10 && (
                          <div className="col-span-2 text-amber-600 italic">
                            ... and {validationWarning.students.length - 10} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleProceedWithWarning}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      These look correct
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTryAgain}
                      className="border-amber-600 text-amber-700 hover:bg-amber-100"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Try different file
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-300 my-2"></div>
            <span className="absolute bg-white px-3 text-sm text-gray-500 font-medium">OR</span>
          </div>

          {/* Drag and Drop File Upload Zone */}
          <div 
            className={`relative w-full border-2 border-dashed rounded-lg px-4 py-4 text-center transition-colors cursor-pointer min-h-[120px] bg-gray-50 hover:bg-[#E5EBEB]/30 flex items-center justify-center`}
            style={{
              borderColor: isFileProcessing ? '#3b82f6' : '#7C9898',
              backgroundColor: isDragActive ? '#E5EBEB' : isFileProcessing ? '#eff6ff' : undefined
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isFileProcessing ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="flex-shrink-0">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700 truncate">
                    Processing file...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Analyzing content with AI
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <div className="flex-shrink-0">
                  <CloudUpload className="h-12 w-12 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    Drag and drop your files here or{' '}
                    <span className="text-blue-600 hover:text-blue-700 underline">
                      browse files
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    .pdf, .csv, .docx, .txt 
                  </p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              accept=".csv,.pdf,.txt,.docx,text/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isFileProcessing}
            />
            
            {/* File size hint */}
            {!isFileProcessing && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                Max 5MB
              </div>
            )}
          </div>
          
          {/* File-specific errors - positioned near the file drop zone */}
          {fileErrors.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5 mt-3">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-destructive mb-2">File upload issues:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {fileErrors.map((error, index) => (
                    <li key={index} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
});

StudentInputStep.displayName = 'StudentInputStep';

export default StudentInputStep;