import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateLinePaymentSchema,
  type UpdateLinePaymentInput,
} from '@prince-net/validation';
import type { LinePayment } from '@prince-net/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { DatePicker } from '../../../components/ui/date-picker';

interface EditLinePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: LinePayment | null;
  lineId: string;
  onSubmit: (input: UpdateLinePaymentInput) => Promise<void>;
  isSubmitting: boolean;
}

export function EditLinePaymentDialog({
  open,
  onOpenChange,
  payment,
  onSubmit,
  isSubmitting,
}: EditLinePaymentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateLinePaymentInput>({
    resolver: zodResolver(updateLinePaymentSchema),
    defaultValues: { amount: '', notes: '', paymentDate: undefined },
  });

  useEffect(() => {
    if (open && payment) {
      reset({
        amount: payment.amount,
        notes: payment.notes ?? '',
        paymentDate: new Date(payment.paymentDate),
      });
    }
  }, [open, payment, reset]);

  const handleFormSubmit = async (data: UpdateLinePaymentInput) => {
    const cleaned: UpdateLinePaymentInput = {
      amount: data.amount || undefined,
      notes: data.notes?.trim() ? data.notes.trim() : null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
    };
    await onSubmit(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل الدفعة</DialogTitle>
          <DialogDescription>عدّل بيانات دفعة الخط</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          id="edit-line-payment-form"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="elpAmount">المبلغ (ر.ي)</Label>
              <Input
                id="elpAmount"
                type="text"
                inputMode="decimal"
                autoFocus
                {...register('amount')}
                disabled={isSubmitting}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="elpDate">التاريخ</Label>
              <Controller
                name="paymentDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date ?? undefined)}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="elpNotes">ملاحظات (اختياري)</Label>
            <Textarea
              id="elpNotes"
              rows={3}
              placeholder="ملاحظات إضافية..."
              {...register('notes')}
              disabled={isSubmitting}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            form="edit-line-payment-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
