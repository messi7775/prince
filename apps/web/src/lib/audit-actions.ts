import type { AuditAction } from '@prince-net/types';

export interface AuditActionOption {
  value: AuditAction;
  label: string;
}

export const AUDIT_ACTIONS: AuditActionOption[] = [
  { value: 'LOGIN', label: 'تسجيل دخول' },
  { value: 'LOGIN_FAILED', label: 'فشل تسجيل دخول' },
  { value: 'PACKAGE_CREATED', label: 'إنشاء باقة' },
  { value: 'PACKAGE_UPDATED', label: 'تعديل باقة' },
  { value: 'INVENTORY_ADDED', label: 'إضافة مخزون' },
  { value: 'INVENTORY_ADJUSTED', label: 'تعديل مخزون' },
  { value: 'INVENTORY_RETURNED', label: 'إعادة مخزون' },
  { value: 'INVENTORY_BATCH_UPDATED', label: 'تعديل دفعة مخزون' },
  { value: 'INVENTORY_BATCH_DELETED', label: 'حذف دفعة مخزون' },
  { value: 'DISTRIBUTOR_CREATED', label: 'إضافة موزع' },
  { value: 'DISTRIBUTOR_UPDATED', label: 'تعديل موزع' },
  { value: 'DISTRIBUTOR_ACTIVATED', label: 'تفعيل موزع' },
  { value: 'DISTRIBUTOR_DEACTIVATED', label: 'تعطيل موزع' },
  { value: 'SALE_CREATED', label: 'إنشاء بيع' },
  { value: 'SALE_CANCELLED', label: 'إلغاء بيع' },
  { value: 'SALE_UPDATED', label: 'تعديل بيع' },
  { value: 'PAYMENT_CREATED', label: 'إنشاء دفعة' },
  { value: 'PAYMENT_UPDATED', label: 'تعديل دفعة' },
  { value: 'PAYMENT_DELETED', label: 'حذف دفعة' },
  { value: 'PAYMENT_REVERSED', label: 'عكس دفعة' },
  { value: 'LINE_CREATED', label: 'إضافة خط' },
  { value: 'LINE_UPDATED', label: 'تعديل خط' },
  { value: 'LINE_DELETED', label: 'حذف خط' },
  { value: 'LINE_ACTIVATED', label: 'تفعيل خط' },
  { value: 'LINE_DEACTIVATED', label: 'تعطيل خط' },
  { value: 'LINE_PAYMENT_CREATED', label: 'إنشاء دفعة خط' },
  { value: 'LINE_PAYMENT_UPDATED', label: 'تعديل دفعة خط' },
  { value: 'LINE_PAYMENT_DELETED', label: 'حذف دفعة خط' },
  { value: 'LINE_PAYMENT_REVERSED', label: 'عكس دفعة خط' },
  { value: 'EXPENSE_CREATED', label: 'إنشاء مصروف' },
  { value: 'EXPENSE_UPDATED', label: 'تعديل مصروف' },
  { value: 'EXPENSE_REVERSED', label: 'عكس مصروف' },
  { value: 'EXPENSE_DELETED', label: 'حذف مصروف' },
  { value: 'EXPENSE_CATEGORY_CREATED', label: 'إنشاء تصنيف مصروفات' },
  { value: 'EXPENSE_CATEGORY_UPDATED', label: 'تعديل تصنيف مصروفات' },
  { value: 'EXPENSE_CATEGORY_ACTIVATED', label: 'تفعيل تصنيف مصروفات' },
  { value: 'EXPENSE_CATEGORY_DEACTIVATED', label: 'تعطيل تصنيف مصروفات' },
  { value: 'EXPENSE_CATEGORY_DELETED', label: 'حذف تصنيف مصروفات' },
  { value: 'OWNER_WITHDRAWAL_CREATED', label: 'سحب المالك' },
  { value: 'OWNER_WITHDRAWAL_UPDATED', label: 'تعديل سحب المالك' },
  { value: 'OWNER_WITHDRAWAL_DELETED', label: 'حذف سحب المالك' },
  { value: 'OWNER_WITHDRAWAL_REVERSED', label: 'عكس سحب المالك' },
  { value: 'CASH_MANUAL_IN', label: 'إيداع يدوي' },
  { value: 'CASH_MANUAL_OUT', label: 'سحب يدوي' },
  { value: 'BACKUP_CREATED', label: 'إنشاء نسخة احتياطية' },
  { value: 'BACKUP_RESTORED', label: 'استعادة نسخة' },
  { value: 'SETTINGS_UPDATED', label: 'تعديل الإعدادات' },
  { value: 'PASSWORD_CHANGED', label: 'تغيير كلمة المرور' },
];

export function getAuditActionLabel(action: AuditAction): string {
  return (
    AUDIT_ACTIONS.find((a) => a.value === action)?.label ?? action
  );
}
