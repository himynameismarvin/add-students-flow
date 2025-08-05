import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Copy } from 'lucide-react';

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
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Link Existing Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Connect students who already have accounts in the system.
        </p>
      </div>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">Linking Code</CardTitle>
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
                Copy Code
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Instructions:</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Share this code with your students</p>
              <p>2. Students should enter this code in their account settings</p>
              <p>3. They will be automatically linked to your class</p>
              <p>4. You'll receive a notification when students link their accounts</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This linking code will expire in 24 hours. Students must use it before then to connect their existing accounts.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="-mx-6 border-t">
        <div className="flex justify-between pt-4 px-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkExistingAccounts;