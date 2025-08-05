import { Student, ParsedStudentData } from '../types/Student';
import { generatePassword, generateUniqueId } from './passwordGenerator';

export const parseStudentText = (text: string): ParsedStudentData => {
  const lines = text.split('\n').filter(line => line.trim());
  const students: Student[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Try different parsing patterns
    let firstName = '';
    let lastName = '';

    // Pattern 1: "First Last"
    const nameMatch = trimmedLine.match(/^([A-Za-z]+)\s+([A-Za-z]+)$/);
    if (nameMatch) {
      firstName = nameMatch[1];
      lastName = nameMatch[2];
    } else {
      // Pattern 2: "Last, First Middle" (like "Allen, Roan C.")
      const lastFirstMiddleMatch = trimmedLine.match(/^([A-Za-z]+),\s*([A-Za-z]+)\s*([A-Za-z]\.?)?/);
      if (lastFirstMiddleMatch) {
        firstName = lastFirstMiddleMatch[2];
        lastName = lastFirstMiddleMatch[1];
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

export const parseCSV = (csvText: string): ParsedStudentData => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const students: Student[] = [];
  const errors: string[] = [];

  // Skip header if it exists
  const startIndex = lines[0] && (lines[0].toLowerCase().includes('first') || lines[0].toLowerCase().includes('name')) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
    
    if (columns.length >= 2) {
      const firstName = columns[0];
      const lastName = columns[1];
      
      if (firstName && lastName) {
        students.push({
          id: generateUniqueId(),
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
          lastInitial: lastName.charAt(0).toUpperCase(),
          password: generatePassword()
        });
      }
    } else if (columns.length === 1 && columns[0]) {
      // Single column, assume it's full name
      const result = parseStudentText(columns[0]);
      students.push(...result.students);
      errors.push(...result.errors);
    } else {
      errors.push(`Line ${i + 1}: Invalid CSV format`);
    }
  }

  return { students, errors };
};