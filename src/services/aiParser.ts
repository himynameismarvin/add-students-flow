import OpenAI from 'openai';
import { Student, ParsedStudentData } from '../types/Student';
import { generatePassword, generateUniqueId } from '../utils/passwordGenerator';

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
  }>;
  errors?: string[];
}

export const parseStudentDataWithAI = async (input: string): Promise<ParsedStudentData> => {
  // Debug logging
  console.log('🔍 AI Parser Debug Info:');
  console.log('- Token loaded:', process.env.REACT_APP_GITHUB_TOKEN ? 'YES' : 'NO');
  console.log('- Token preview:', process.env.REACT_APP_GITHUB_TOKEN?.substring(0, 10) + '...');
  console.log('- Base URL:', openai.baseURL);
  console.log('- Input text:', input);

  try {
    const prompt = `
You are an AI assistant that extracts student names from various text formats. 
Parse the following text and extract all student names. Be very flexible - the input could be:
- A simple list of names
- Names in a table or structured format
- Names mixed with other text
- Different name formats (First Last, Last First, etc.)
- Names with titles, grades, or other information

Input text:
"""
${input}
"""

Return ONLY a valid JSON object in this exact format:
{
  "students": [
    {"firstName": "John", "lastName": "Smith"},
    {"firstName": "Jane", "lastName": "Doe"}
  ],
  "errors": []
}

Rules:
- Extract only actual student names, ignore titles, grades, or other text
- If you can't determine a last name, use an empty string
- If a name is unclear or might not be a student name, include it in errors array
- Be liberal in interpretation - when in doubt, include the name
- Handle various formats: "John Smith", "Smith, John", "John", etc.
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

    // Convert AI response to our format
    const students: Student[] = aiResponse.students.map(student => ({
      id: generateUniqueId(),
      firstName: student.firstName.trim(),
      lastInitial: student.lastName.trim().charAt(0).toUpperCase(),
      password: generatePassword()
    }));

    return {
      students,
      errors: aiResponse.errors || []
    };

  } catch (error) {
    console.error('❌ AI parsing error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status,
      statusText: (error as any)?.statusText,
      response: (error as any)?.response?.data,
      stack: error instanceof Error ? error.stack : undefined
    });
    
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
      students.push({
        id: generateUniqueId(),
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
        lastInitial: lastName.charAt(0).toUpperCase(),
        password: generatePassword()
      });
    }
  });

  return { students, errors };
};