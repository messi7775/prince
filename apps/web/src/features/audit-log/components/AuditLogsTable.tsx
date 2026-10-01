import { Eye, History } from 'lucide-react';
import type { AuditAction, AuditLog } from '@prince-net/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Pagination } from '../../../components/ui/pagination';
import { formatDateTime } from '../../../lib/format';
import { getAuditActionLabel, AUDIT_ACTIONS } from '../../../lib/audit-actions';

interface AuditLogsTableProps {
  data: AuditLog[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (log: AuditLog) => void;
}

const ACTION_LABELS: Record<AuditAction, string> = Object.fromEntries(
  AUDIT_ACTIONS.map((a) => [a.value, a.label]),
) as Record<AuditAction, string>;

const ENTITY_TYPE_LABELS: Record<string, string> = {
  Sale: 'مبيعة',
  Payment: 'دفعة',
  Package: 'باقة',
  PackageStock: 'دفعة مخزون',
  InventoryMovement: 'حركة مخزون',
  Distributor: 'موزع',
  Line: 'خط',
  LinePayment: 'دفعة خط',
  Expense: 'مصروف',
  ExpenseCategory: 'تصنيف مصروفات',
  OwnerWithdrawal: 'سحب المالك',
  CashMovement: 'حركة نقدية',
  Settings: 'الإعدادات',
  Backup: 'نسخة احتياطية',
  User: 'مستخدم',
};

type BadgeVariant = 'success' | 'default' | 'destructive' | 'warning' | 'secondary';

function actionVariant(action: AuditAction): BadgeVariant {
  if (
    action.endsWith('_CREATED') ||
    action.endsWith('_ADDED') ||
    action.endsWith('_RETURNED') ||
    action.endsWith('_ACTIVATED')
  ) {
    return 'success';
  }
  if (action.endsWith('_UPDATED')) return 'default';
  if (
    action.endsWith('_CANCELLED') ||
    action.endsWith('_REVERSED') ||
    action.endsWith('_DELETED') ||
    action.endsWith('_DEACTIVATED') ||
    action === 'LOGIN_FAILED'
  ) {
    return 'destructive';
  }
  if (
    action.endsWith('_ADJUSTED') ||
    action === 'CASH_MANUAL_IN' ||
    action === 'CASH_MANUAL_OUT'
  ) {
    return 'warning';
  }
  return 'secondary';
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.slice(0, 8);
}

function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType;
}

export function AuditLogsTable({
  data,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
}: AuditLogsTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="لا توجد سجلات"
        description="لم تُسجَّل أي عمليات بعد"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ والوقت</TableHead>
              <TableHead>العملية</TableHead>
              <TableHead className="hidden sm:table-cell">المستخدم</TableHead>
              <TableHead className="hidden md:table-cell">السجل المتأثر</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={actionVariant(log.action)}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {log.userEmail ?? '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  <span className="font-medium">{getEntityTypeLabel(log.entityType)}</span>
                  {log.entityId && (
                    <span className="num text-muted-foreground ms-2 text-xs">
                      {shortId(log.entityId)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log)}
                  >
                    <Eye className="me-1 h-3.5 w-3.5" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export { ACTION_LABELS, ENTITY_TYPE_LABELS };
