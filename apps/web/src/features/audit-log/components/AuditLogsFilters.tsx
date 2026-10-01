import type { AuditAction } from '@prince-net/types';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { DateFilterInput } from '../../../components/ui/date-filter-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { AUDIT_ACTIONS } from '../../../lib/audit-actions';

const ENTITY_TYPE_OPTIONS = [
  { value: 'Sale', label: 'مبيعة' },
  { value: 'Payment', label: 'دفعة' },
  { value: 'Package', label: 'باقة' },
  { value: 'PackageStock', label: 'دفعة مخزون' },
  { value: 'Distributor', label: 'موزع' },
  { value: 'Line', label: 'خط' },
  { value: 'LinePayment', label: 'دفعة خط' },
  { value: 'Expense', label: 'مصروف' },
  { value: 'ExpenseCategory', label: 'تصنيف مصروفات' },
  { value: 'OwnerWithdrawal', label: 'سحب المالك' },
  { value: 'CashMovement', label: 'حركة نقدية' },
  { value: 'Settings', label: 'الإعدادات' },
  { value: 'Backup', label: 'نسخة احتياطية' },
];

interface AuditLogsFiltersProps {
  action: AuditAction | 'ALL';
  onActionChange: (v: AuditAction | 'ALL') => void;
  entityType: string;
  onEntityTypeChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
}

export function AuditLogsFilters({
  action,
  onActionChange,
  entityType,
  onEntityTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: AuditLogsFiltersProps) {
  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs">العملية</Label>
        <Select
          value={action}
          onValueChange={(v) => onActionChange(v as AuditAction | 'ALL')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="ALL">الكل</SelectItem>
            {AUDIT_ACTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">نوع السجل</Label>
        <Select
          value={entityType || 'ALL'}
          onValueChange={(v) => onEntityTypeChange(v === 'ALL' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="ALL">الكل</SelectItem>
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="auditDateFrom">
          من تاريخ
        </Label>
        <DateFilterInput
          value={dateFrom}
          onChange={onDateFromChange}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs" htmlFor="auditDateTo">
          إلى تاريخ
        </Label>
        <DateFilterInput
          value={dateTo}
          onChange={onDateToChange}
        />
      </div>
    </div>
  );
}
