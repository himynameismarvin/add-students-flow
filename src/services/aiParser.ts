import OpenAI from 'openai';
import { Student, ParsedStudentData } from '../types/Student';
import { generatePassword, generateUniqueId } from '../utils/passwordGenerator';
import { generateUsername } from '../utils/usernameGenerator';

// Initialize OpenAI client with GitHub Models API
const githubToken = process.env.REACT_APP_GITHUB_TOKEN;
console.log('🔑 GitHub token loaded:', githubToken ? `${githubToken.substring(0, 8)}...` : 'MISSING');

const openai = new OpenAI({
  apiKey: githubToken || 'demo-key',
  baseURL: 'https://models.github.ai/inference',
  dangerouslyAllowBrowser: true // Only for demo purposes
});

interface AIParsingResponse {
  students: Array<{
    firstName: string;
    lastName: string;
    confidence?: number;
  }>;
  errors?: string[];
  contentType?: 'student_list' | 'mixed_content' | 'unlikely_student_content';
  confidence?: number;
  warnings?: string[];
}

// Validation helper function
const validateExtractedData = (aiResponse: AIParsingResponse): { needsValidation: boolean } => {
  const { students, contentType, confidence } = aiResponse;
  
  // Check if validation is needed based on multiple factors
  const needsValidation = 
    contentType === 'unlikely_student_content' ||
    contentType === 'mixed_content' ||
    (confidence && confidence < 0.7) ||
    students.length === 0 ||
    students.some(student => (student.confidence || 0) < 0.6) ||
    students.length > 50; // Suspiciously high number might indicate bad parsing
    
  return { needsValidation };
};

export const parseStudentDataWithAI = async (input: string): Promise<ParsedStudentData> => {
  // Truncate input if it's too large for API (GitHub Models has token limits)
  const maxLength = 8000; // Conservative limit to avoid 413 errors
  const truncatedInput = input.length > maxLength 
    ? input.substring(0, maxLength) + '\n\n[Content truncated due to length...]'
    : input;
    
  // Debug logging
  console.log('🔍 AI Parser Debug Info:');
  console.log('- Token loaded:', process.env.REACT_APP_GITHUB_TOKEN ? 'YES' : 'NO');
  console.log('- Token preview:', process.env.REACT_APP_GITHUB_TOKEN?.substring(0, 10) + '...');
  console.log('- Base URL:', openai.baseURL);
  console.log('- Input length:', input.length, 'characters');
  console.log('- Truncated:', input.length > maxLength);
  console.log('- Processing length:', truncatedInput.length, 'characters');

  try {
    const prompt = `
You are an AI assistant that extracts and validates student names from text. 

FIRST, analyze if this content likely contains student names:
- Student rosters, class lists, enrollment data = "student_list" 
- Mixed content with some names = "mixed_content"
- Technical docs, articles, random text = "unlikely_student_content"

THEN, if names are found, validate each one:
- Real names (John, Maria, Chen) = high confidence (0.8-1.0)
- Questionable but possible names = medium confidence (0.4-0.7)  
- Gibberish, random words, technical terms = low confidence (0.0-0.3)

Input text:
"""
${truncatedInput}
"""

Return ONLY a valid JSON object in this exact format:
{
  "contentType": "student_list|mixed_content|unlikely_student_content",
  "confidence": 0.85,
  "students": [
    {"firstName": "John", "lastName": "Smith", "confidence": 0.9},
    {"firstName": "Jane", "lastName": "Doe", "confidence": 0.8}
  ],
  "warnings": ["Found technical terms that might not be names"],
  "errors": []
}

STRICT VALIDATION RULES:
- Only extract text that looks like actual human names
- Reject technical terms, random words, gibberish  
- Names must be 2-15 characters, mostly letters
- If overall content seems unrelated to students, set contentType accordingly
- Be conservative - when in doubt, mark as low confidence or exclude
- Provide specific warnings about questionable content
`;

    console.log('🚀 Making API request to GitHub Models...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts student names from text. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    console.log('✅ AI Response received:', response);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response
    let aiResponse: AIParsingResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Validate the AI response and add quality checks
    const validationResult = validateExtractedData(aiResponse);
    
    // Convert AI response to our format, filtering out low-confidence names
    const students: Student[] = aiResponse.students
      .filter(student => (student.confidence || 0.5) >= 0.4) // Only include medium+ confidence
      .map(student => {
        const firstName = student.firstName.trim();
        const lastInitial = student.lastName.trim().charAt(0).toUpperCase();
        return {
          id: generateUniqueId(),
          firstName,
          lastInitial,
          password: generatePassword(),
          username: generateUsername(firstName, lastInitial)
        };
      });

    return {
      students,
      errors: aiResponse.errors || [],
      warnings: aiResponse.warnings || [],
      contentType: aiResponse.contentType,
      confidence: aiResponse.confidence,
      needsValidation: validationResult.needsValidation
    };

  } catch (error) {
    console.error('❌ AI parsing error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status,
      statusText: (error as any)?.statusText,
      response: (error as any)?.response?.data,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check if it's a 413 error (request too large) and provide specific message
    if ((error as any)?.status === 413) {
      return {
        students: [],
        errors: ['File content is too large for AI processing. Please try a smaller file or one with less content.'],
        warnings: ['Large files may contain too much text for accurate name extraction.'],
        contentType: 'unlikely_student_content',
        confidence: 0,
        needsValidation: true
      };
    }
    
    // For other API errors, provide more helpful messages
    if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
      return {
        students: [],
        errors: ['Unable to process with AI. Please check your file format and try again.'],
        warnings: ['AI processing is temporarily unavailable.'],
        contentType: 'unlikely_student_content',
        confidence: 0,
        needsValidation: true
      };
    }
    
    // Fallback to basic parsing if AI fails
    return fallbackParsing(input);
  }
};

// Fallback parsing function (your original logic as backup)
const fallbackParsing = (text: string): ParsedStudentData => {
  const lines = text.split('\n').filter(line => line.trim());
  const students: Student[] = [];
  const errors: string[] = ['AI parsing unavailable, using basic parsing'];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let firstName = '';
    let lastName = '';

    // Pattern 1: "First Last"
    const nameMatch = trimmedLine.match(/^([A-Za-z]+)\s+([A-Za-z]+)$/);
    if (nameMatch) {
      firstName = nameMatch[1];
      lastName = nameMatch[2];
    } else {
      // Pattern 2: "Last, First"
      const lastFirstMatch = trimmedLine.match(/^([A-Za-z]+),\s*([A-Za-z]+)$/);
      if (lastFirstMatch) {
        firstName = lastFirstMatch[2];
        lastName = lastFirstMatch[1];
      } else {
        // Pattern 3: Single word (assume first name)
        const singleNameMatch = trimmedLine.match(/^([A-Za-z]+)$/);
        if (singleNameMatch) {
          firstName = singleNameMatch[1];
          lastName = '';
        } else {
          errors.push(`Line ${index + 1}: Could not parse "${trimmedLine}"`);
          return;
        }
      }
    }

    if (firstName) {
      const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const formattedLastInitial = lastName.charAt(0).toUpperCase();
      students.push({
        id: generateUniqueId(),
        firstName: formattedFirstName,
        lastInitial: formattedLastInitial,
        password: generatePassword(),
        username: generateUsername(formattedFirstName, formattedLastInitial)
      });
    }
  });

  return { students, errors };
};