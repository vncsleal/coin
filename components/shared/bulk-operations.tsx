'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  CreditCard, 
  MessageSquare, 
  Trash2,
  CheckCircle,
  Download,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperationsProps {
  selectedCount: number;
  selectedExpenses: number[];
  clearSelectionAction: () => void;
  bulkSettleAction: (expenseIds: number[]) => Promise<void>;
  bulkRemindAction: (expenseIds: number[]) => Promise<void>;
  bulkDeleteAction: (expenseIds: number[]) => Promise<void>;
  bulkExportAction: (expenseIds: number[]) => Promise<void>;
  bulkMarkSettledAction: (expenseIds: number[]) => Promise<void>;
}

export function BulkOperations({
  selectedCount,
  selectedExpenses,
  clearSelectionAction,
  bulkSettleAction,
  bulkRemindAction,
  bulkDeleteAction,
  bulkExportAction,
  bulkMarkSettledAction
}: BulkOperationsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkOperation = async (operation: () => Promise<void>, successMessage: string) => {
    setLoading(true);
    try {
      await operation();
      toast.success(successMessage);
      clearSelectionAction();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    await handleBulkOperation(
      () => bulkDeleteAction(selectedExpenses),
      `${selectedCount} expense(s) deleted`
    );
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/5 border rounded-lg">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {selectedCount} selected
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSelectionAction}
          >
            Clear selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Button
            size="sm"
            onClick={() => handleBulkOperation(
              () => bulkSettleAction(selectedExpenses),
              'Settlement process initiated for selected expenses'
            )}
            disabled={loading}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Settle All
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkOperation(
              () => bulkRemindAction(selectedExpenses),
              'Reminders sent for selected expenses'
            )}
            disabled={loading}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={loading}>
                More Actions
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleBulkOperation(
                  () => bulkMarkSettledAction(selectedExpenses),
                  'Selected expenses marked as settled'
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Settled
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => handleBulkOperation(
                  () => bulkExportAction(selectedExpenses),
                  'Export completed'
                )}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Expenses</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected expense(s)? 
              This action cannot be undone and will affect all participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedCount} Expense(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
