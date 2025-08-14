import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, Monitor } from 'lucide-react';

interface LinkExistingAccountsProps {
  onBack: () => void;
  onClose: () => void;
}

const LinkExistingAccounts: React.FC<LinkExistingAccountsProps> = ({
  onBack,
  onClose
}) => {
  // Generate a 6-digit code once and keep it stable
  const [linkingCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(linkingCode);
    setShowCopiedTooltip(true);
    setTimeout(() => setShowCopiedTooltip(false), 2000);
  };

  const handleScreenShare = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Screen Share - Class Code</title>
            <style>
              body { 
                margin: 0; 
                background: #ff8c00; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                font-family: system-ui, -apple-system, sans-serif;
              }
              .code-display {
                text-align: center;
                color: white;
              }
              .code {
                font-size: 8rem;
                font-weight: bold;
                font-family: monospace;
                letter-spacing: 1rem;
                margin-bottom: 2rem;
              }
              .title {
                font-size: 3rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="code-display">
              <div class="title">Class Code</div>
              <div class="code">${linkingCode}</div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 py-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Connect students who already have a Prodigy account
        </p>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">Class code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-muted p-6 rounded-lg">
              <div className="text-3xl font-mono font-bold text-foreground tracking-widest">
                {linkingCode}
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScreenShare}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Screen share code
                  </Button>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy code
                  </Button>
                  {showCopiedTooltip && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
                      Copied!
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Instructions:</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Share this code with your students</p>
              <p>2. Have students visit play.prodigy.com</p>
              <p>3. Students should log in to their existing account</p>
              <p>4. After logging in, tap <strong>Update</strong> and enter the class code</p>
            </div>
            <Button variant="outline">
            Printable instructions
          </Button>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default LinkExistingAccounts;