export const generateUsername = (firstName: string, lastInitial: string): string => {
  if (!firstName.trim() || !lastInitial.trim()) {
    return '';
  }
  
  // Capitalize first letter of first name
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  
  // Ensure last initial is capitalized
  const capitalizedLastInitial = lastInitial.toUpperCase();
  
  // Generate random 2-3 digit number
  const randomDigits = Math.floor(Math.random() * 900) + 100; // 100-999
  
  return `${capitalizedFirstName}${capitalizedLastInitial}${randomDigits}`;
};

export const capitalizeFirstName = (name: string): string => {
  if (!name.trim()) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};