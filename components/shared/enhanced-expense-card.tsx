'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  MoreHorizontal, 
  CreditCard, 
  MessageSquare, 
  Copy, 
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

interface EnhancedSharedExpense {
  id: number;
  name: string;
  total_amount: number;
  date: string;
  tag: string;
  created_by: string;
  split_method?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: number;
    user_id: string;
    share_amount: number;
    settlement_status: string;
    paid_amount: number;
  }>;
}

interface EnhancedExpenseCardProps {
  expense: EnhancedSharedExpense;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onUpdate?: () => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (expense: EnhancedSharedExpense) => void;
  onSettle?: (id: number) => void;
  onRemind?: (id: number) => void;
  showActions?: boolean;
  showSelection?: boolean;
}

export function EnhancedExpenseCard({
  expense,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onSettle,
  onRemind,
  showActions = true,
  showSelection = false
}: EnhancedExpenseCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const userParticipant = expense.participants[0];
  const totalOwed = expense.participants.reduce((sum, p) => sum + p.share_amount, 0);
  const totalPaid = expense.participants.reduce((sum, p) => sum + p.paid_amount, 0);
  const isFullySettled = expense.participants.every(p => p.settlement_status === 'confirmed');
  const hasPendingPayments = expense.participants.some(p => p.settlement_status === 'pending');
  const hasOverduePayments = expense.participants.some(p => 
    p.settlement_status === 'paid' && 
    new Date(expense.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const getStatusBadge = () => {
    if (isFullySettled) {
      return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Liquidado</Badge>;
    }
    if (hasOverduePayments) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Atrasado</Badge>;
    }
    if (hasPendingPayments) {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
    return <Badge variant="secondary">Ativo</Badge>;
  };

  const handleQuickSettle = async () => {
    try {
      await onSettle?.(expense.id);
      toast.success('Liquidação iniciada');
    } catch (error) {
      toast.error('Falha ao liquidar despesa');
    }
  };

  const handleSendReminder = async () => {
    try {
      await onRemind?.(expense.id);
      toast.success('Lembrete enviado');
    } catch (error) {
      toast.error('Falha ao enviar lembrete');
    }
  };

  const handleDuplicate = () => {
    onDuplicate?.(expense);
    toast.success('Despesa duplicada');
  };

  const handleDelete = () => {
    onDelete?.(expense.id);
    setDeleteDialogOpen(false);
    toast.success('Despesa excluída');
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with selection */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {showSelection && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={onSelect}
                    className="mt-1"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium truncate">{expense.name}</span>
                    <Badge variant="secondary">{expense.tag}</Badge>
                    {expense.split_method && expense.split_method !== 'equal' && (
                      <Badge variant="outline" className="text-xs">
                        {expense.split_method}
                      </Badge>
                    )}
                    {getStatusBadge()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {expense.participants.length} participantes
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Sua parte: {formatCurrency(userParticipant?.share_amount || 0)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(expense.total_amount)}</div>
                </div>
                
                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!isFullySettled && (
                        <>
                          <DropdownMenuItem onClick={handleQuickSettle}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Liquidação Rápida
                          </DropdownMenuItem>
                          {hasPendingPayments && (
                            <DropdownMenuItem onClick={handleSendReminder}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Enviar Lembrete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Progress Bar for unsettled expenses */}
            {!isFullySettled && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso da Liquidação</span>
                  <span>{formatCurrency(totalPaid)} / {formatCurrency(totalOwed)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      hasOverduePayments ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min((totalPaid / totalOwed) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Quick action buttons for mobile */}
            <div className="flex gap-2 md:hidden">
              {!isFullySettled && (
                <Button size="sm" variant="outline" onClick={handleQuickSettle} className="flex-1">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Liquidar
                </Button>
              )}
              {hasPendingPayments && (
                <Button size="sm" variant="outline" onClick={handleSendReminder} className="flex-1">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Lembrar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa Compartilhada</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir "{expense.name}"? Esta ação não pode ser desfeita e afetará todos os participantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
