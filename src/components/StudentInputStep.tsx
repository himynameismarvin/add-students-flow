import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
// import { parseStudentText, parseCSV } from '../utils/studentParser';
import { parseStudentDataWithAI } from '../services/aiParser';
import { Student } from '../types/Student';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleInputTextChange = (value: string) => {
    setInputText(value);
    onInputChange?.(value.trim().length > 0);
  };

  const handleTextParse = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    onLoadingChange?.(true);
    setParseErrors([]);
    
    try {
      const result = await parseStudentDataWithAI(inputText);
      setParseErrors(result.errors);
      
      if (result.students.length > 0) {
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
    
    onFileUpload?.(true);
    setIsLoading(true);
    onLoadingChange?.(true);
    setParseErrors([]);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        // Use AI parsing for all file types now
        const result = await parseStudentDataWithAI(content);
        setParseErrors(result.errors);
        
        if (result.students.length > 0) {
          onNext({ students: result.students });
        } else {
          setParseErrors(prev => [...prev, 'No student names found in the uploaded file']);
        }
      } catch (error) {
        console.error('File parsing failed:', error);
        setParseErrors(['AI parsing failed. Please check your API key or try again.']);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
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
    <div className="flex flex-col h-full space-y-6 py-4">
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
              borderColor: '#7C9898',
              backgroundColor: isDragActive ? '#E5EBEB' : undefined
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="flex-shrink-0">
                <div className="relative">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                  <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                    <Upload className="h-3 w-3 text-white" />
                  </div>
                </div>
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
            
            <input
              type="file"
              accept=".csv,.pdf,.txt,.docx,text/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  );
});

StudentInputStep.displayName = 'StudentInputStep';

export default StudentInputStep;