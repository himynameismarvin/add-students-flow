import React, { useState } from 'react';
// import { parseStudentText, parseCSV } from '../utils/studentParser';
import { parseStudentDataWithAI } from '../services/aiParser';
import { Student } from '../types/Student';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';

interface StudentInputStepProps {
  onNext: (data: { students: Student[] }) => void;
  onClose: () => void;
  onInputChange?: (hasInput: boolean) => void;
}

const StudentInputStep: React.FC<StudentInputStepProps> = ({ onNext, onClose, onInputChange }) => {
  const [inputText, setInputText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleInputTextChange = (value: string) => {
    setInputText(value);
    onInputChange?.(value.trim().length > 0);
  };

  const handleTextParse = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
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
    }
  };


  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsLoading(true);
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


  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mt-2">
         Our AI can parse student names from ANY format - class rosters, email lists, tables, or mixed text. Just paste it in!
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
              placeholder="Paste your student list in any format - our AI will figure it out!

Examples:
• John Smith, Jane Doe, Alex Johnson
• From class roster tables
• Email lists with names
• Mixed text with student names
• Any format you have!"
              className="min-h-[300px] resize-none"
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

          {/* Drag and Drop File Upload Zone */}
          <div 
            className={`relative w-full border-2 border-dashed rounded-lg px-4 py-3 text-center transition-colors cursor-pointer max-h-[100px] ${
              isDragActive 
                ? 'border-[#245353] bg-[#E5EBEB]/50' 
                : 'border-gray-300 bg-gray-50 hover:border-[#245353] hover:bg-[#E5EBEB]/30'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                  <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                    <Upload className="h-2 w-2 text-white" />
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
                  .pdf, .csv, .docx, .txt, 
                </p>
              </div>
            </div>
            
            <input
              type="file"
              accept=".csv,.pdf,.txt,.docx,.xlsx,text/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="-mx-6 border-t">
        <div className="flex justify-between pt-4 px-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleTextParse}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentInputStep;