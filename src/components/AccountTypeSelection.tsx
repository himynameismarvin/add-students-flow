import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { UserPlus, Link } from 'lucide-react';

interface AccountTypeSelectionProps {
  onSelectCreateNew: () => void;
  onSelectLinkExisting: () => void;
}

const AccountTypeSelection: React.FC<AccountTypeSelectionProps> = ({
  onSelectCreateNew,
  onSelectLinkExisting
}) => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choose Account Type</h2>
        <p className="text-sm text-muted-foreground">
          Select how you'd like to add students to your system.
        </p>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <Card className="flex-1 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectCreateNew}>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Create New Accounts</h3>
              <p className="text-sm text-muted-foreground">
                Add new students and generate fresh accounts with usernames and passwords
              </p>
            </div>
            <Button size="lg" className="mt-4">
              Create New Accounts
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectLinkExisting}>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Link className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Link Existing Accounts</h3>
              <p className="text-sm text-muted-foreground">
                Connect students who already have accounts in the system
              </p>
            </div>
            <Button size="lg" variant="outline" className="mt-4">
              Link Existing Accounts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountTypeSelection;