export const generatePassword = (): string => {
  const adjectives = ['happy', 'sunny', 'bright', 'smart', 'kind', 'brave', 'cool', 'nice'];
  const animals = ['cat', 'dog', 'bird', 'fish', 'bear', 'lion', 'fox', 'owl'];
  const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  
  return `${adjective}${animal}${numbers}`;
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};