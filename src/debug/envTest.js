// Quick environment variable test
console.log('🔍 Environment Variable Test:');
console.log('REACT_APP_GITHUB_TOKEN:', process.env.REACT_APP_GITHUB_TOKEN ? 'LOADED' : 'NOT LOADED');
console.log('Token preview:', process.env.REACT_APP_GITHUB_TOKEN?.substring(0, 15) + '...');
console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));