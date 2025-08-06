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
    <div className="flex flex-col h-full space-y-6 py-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Choose how to add students to your class
        </p>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <Card className="flex-1 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectCreateNew}>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Create new accounts</h3>
              <p className="text-sm text-muted-foreground">
                For students who don't have a Prodigy account yet
              </p>
            </div>
            <Button size="lg" className="mt-4">
              Create accounts
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelectLinkExisting}>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Link className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Link existing accounts</h3>
              <p className="text-sm text-muted-foreground">
                For students who already use Prodigy
              </p>
            </div>
            <Button size="lg" variant="outline" className="mt-4">
              Link accounts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountTypeSelection;