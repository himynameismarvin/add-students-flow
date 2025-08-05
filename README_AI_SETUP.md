# AI-Powered Student Name Parsing Setup

## Overview
Your student addition flow now uses **GitHub Models API** to parse student names from any text format! No more rigid formatting requirements.

## Setup Instructions

### 1. Get a GitHub Token
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Student Parser"
4. No special permissions needed - basic token is fine
5. Copy your token (starts with `ghp_...`)

### 2. Configure the Token
1. Open the `.env` file in your project root
2. Replace `your_github_token_here` with your actual token:
   ```
   REACT_APP_GITHUB_TOKEN=ghp_your-actual-token-here
   ```
3. Save the file

### 3. Restart the Development Server
```bash
npm start
```

## What Changed

### ✅ Now Handles ANY Format:
- **Mixed text**: "Students in my class: John Smith, Jane Doe, and Alex Johnson"
- **Tables**: Copied from spreadsheets or PDFs
- **Email lists**: "john.smith@school.edu (John Smith)"
- **Roster formats**: "1. Smith, John - Grade 5"
- **Messy lists**: "John (absent), Jane Doe present, Alex - new student"

### ✅ Smart Recognition:
- Ignores non-names (grades, emails, dates)
- Handles different name orders (First Last, Last First)
- Extracts names from sentences and paragraphs
- Works with international names and formats

### ✅ Error Handling:
- Falls back to basic parsing if AI is unavailable
- Clear error messages for troubleshooting
- Graceful degradation

## Testing Examples

Try pasting these different formats to see the AI in action:

```
Example 1 - Mixed format:
Students in my 3rd grade class: John Smith, Jane Doe (new), Alex Johnson - transferred from Lincoln School, Sarah Wilson

Example 2 - Table format:
Name            Grade   Status
Smith, John     3rd     Active
Doe, Jane       3rd     New
Johnson, Alex   3rd     Transfer

Example 3 - Email list:
john.smith@school.edu - John Smith
jane.doe@school.edu - Jane Doe  
alex.johnson@school.edu - Alex Johnson
```

## Production Notes

⚠️ **Security**: The current setup exposes the API key in the browser (for demo purposes). For production:
1. Move AI processing to your backend
2. Use environment variables on the server
3. Implement rate limiting and usage monitoring

## Cost Estimation
- **FREE** with GitHub Models API!
- No usage costs for basic inference
- Perfect for educational use cases