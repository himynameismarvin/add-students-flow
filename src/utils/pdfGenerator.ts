import jsPDF from 'jspdf';
import { Student } from '../types/Student';

export const generateStudentCredentialPDF = (student: Student): jsPDF => {
  const doc = new jsPDF();
  
  // Set up the document
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Account Information', 20, 30);
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Student information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Name:', 20, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.firstName} ${student.lastInitial}.`, 20, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Username:', 20, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.firstName.toLowerCase()}${student.lastInitial.toLowerCase()}`, 20, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Password:', 20, 115);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(student.password, 20, 125);
  
  // Instructions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Instructions:', 20, 150);
  doc.setFontSize(10);
  doc.text('1. Keep this information safe and secure', 25, 160);
  doc.text('2. Use the username and password to log into the classroom', 25, 170);
  doc.text('3. Change password after first login if desired', 25, 180);
  
  // Footer
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);
  
  return doc;
};

export const generateAllStudentsPDF = (students: Student[]): jsPDF => {
  const doc = new jsPDF();
  
  // Title page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Account Information', 20, 30);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${students.length} Student Accounts Created`, 20, 50);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 65);
  
  // Table header
  let yPosition = 90;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Name', 20, yPosition);
  doc.text('Username', 80, yPosition);
  doc.text('Password', 140, yPosition);
  
  // Line under header
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  
  // Student data
  doc.setFont('helvetica', 'normal');
  students.forEach((student, index) => {
    yPosition += 15;
    
    // Check if we need a new page
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 30;
      
      // Repeat header on new page
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 20, yPosition);
      doc.text('Username', 80, yPosition);
      doc.text('Password', 140, yPosition);
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 15;
      doc.setFont('helvetica', 'normal');
    }
    
    const username = `${student.firstName.toLowerCase()}${student.lastInitial.toLowerCase()}`;
    
    doc.text(`${student.firstName} ${student.lastInitial}.`, 20, yPosition);
    doc.text(username, 80, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(student.password, 140, yPosition);
    doc.setFont('helvetica', 'normal');
  });
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};

export const generateAndDownloadStudentPDF = (student: Student) => {
  const pdf = generateStudentCredentialPDF(student);
  const filename = `${student.firstName}_${student.lastInitial}_credentials.pdf`;
  downloadPDF(pdf, filename);
};

export const generateAndDownloadAllStudentsPDF = (students: Student[]) => {
  const pdf = generateAllStudentsPDF(students);
  const filename = `class_credentials_${new Date().toISOString().split('T')[0]}.pdf`;
  downloadPDF(pdf, filename);
};