import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy } from 'lucide-react';

interface LinkExistingAccountsProps {
  onBack: () => void;
  onClose: () => void;
}

const LinkExistingAccounts: React.FC<LinkExistingAccountsProps> = ({
  onBack,
  onClose
}) => {
  // Generate a 6-digit code (placeholder for now)
  const linkingCode = Math.floor(100000 + Math.random() * 900000).toString();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(linkingCode);
    // TODO: Add toast notification for successful copy
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="mt-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy code
              </Button>
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