import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import type {
  LinePayment,
  PaginatedResponse,
  PaginationMeta,
} from '@prince-net/types';
import type {
  CreateLinePaymentInput,
  UpdateLinePaymentInput,
  ReverseLinePaymentInput,
} from '@prince-net/validation';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { toMoneyStringRequired } from '../common/utils/money.util';
import {
  normalizePagination,
  buildPaginationMeta,
  type PaginationInput,
} from '../common/utils/pagination.util';

@Injectable()
export class LinePaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listByLine(
    lineId: string,
    query: PaginationInput,
  ): Promise<PaginatedResponse<LinePayment>> {
    const line = await this.prisma.line.findUnique({
      where: { id: lineId },
      select: { id: true },
    });
    if (!line) {
      throw new NotFoundException({
        message: 'الخط غير موجود',
        code: 'LINE_NOT_FOUND',
      });
    }

    const { page, limit, skip, take, order } = normalizePagination(query);
    const where = { lineId };

    const [rows, total] = await Promise.all([
      this.prisma.linePayment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: order },
      }),
      this.prisma.linePayment.count({ where }),
    ]);

    const data: LinePayment[] = rows.map((row) => this.toLinePayment(row));
    const meta: PaginationMeta = buildPaginationMeta(total, page, limit);

    return { success: true, data, meta };
  }

  async create(
    lineId: string,
    input: CreateLinePaymentInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<LinePayment> {
    return this.prisma.$transaction(async (tx) => {
      const line = await tx.line.findUnique({
        where: { id: lineId },
        select: { id: true, name: true },
      });
      if (!line) {
        throw new NotFoundException({
          message: 'الخط غير موجود',
          code: 'LINE_NOT_FOUND',
        });
      }

      const amount = new Prisma.Decimal(input.amount);
      const paymentDate = new Date(input.paymentDate);

      const period =
        input.period?.trim() ||
        `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

      const payment = await tx.linePayment.create({
        data: {
          lineId,
          amount,
          period,
          status: 'ACTIVE',
          paymentDate,
          notes: input.notes ?? null,
          createdBy: userId,
        },
      });

      await tx.cashMovement.create({
        data: {
          direction: 'OUT',
          amount,
          sourceType: 'LINE_PAYMENT',
          sourceId: payment.id,
          description: `دفعة خط ${line.name} - ${period}`,
          movementDate: paymentDate,
          createdBy: userId,
        },
      });

      await this.auditService.logTx(tx, {
        userId,
        action: 'LINE_PAYMENT_CREATED',
        entityType: 'LinePayment',
        entityId: payment.id,
        newValues: {
          lineId,
          amount: input.amount,
          period,
        },
        ipAddress: req.ip ?? null,
        userAgent: req.userAgent ?? null,
      });

      return this.toLinePayment(payment);
    });
  }

  async reverse(
    paymentId: string,
    input: ReverseLinePaymentInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<LinePayment> {
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<
        { id: string; status: string; amount: Prisma.Decimal; line_id: string }[]
      >`
        SELECT id, status, amount, line_id
        FROM line_payments
        WHERE id = ${paymentId}::uuid
        FOR UPDATE
      `;

      if (locked.length === 0) {
        throw new NotFoundException({
          message: 'دفعة الخط غير موجودة',
          code: 'LINE_PAYMENT_NOT_FOUND',
        });
      }

      const payment = locked[0]!;

      if (payment.status !== 'ACTIVE') {
        throw new BusinessException(
          'LINE_PAYMENT_ALREADY_REVERSED',
          'دفعة الخط معكوسة بالفعل',
          400,
        );
      }

      const updated = await tx.linePayment.update({
        where: { id: paymentId },
        data: {
          status: 'REVERSED',
          reversedAt: new Date(),
          reversedBy: userId,
          reversalReason: input.reason,
        },
      });

      await tx.cashMovement.create({
        data: {
          direction: 'IN',
          amount: payment.amount,
          sourceType: 'LINE_PAYMENT_REVERSAL',
          sourceId: paymentId,
          description: `عكس دفعة خط`,
          createdBy: userId,
        },
      });

      await this.auditService.logTx(tx, {
        userId,
        action: 'LINE_PAYMENT_REVERSED',
        entityType: 'LinePayment',
        entityId: paymentId,
        oldValues: { status: 'ACTIVE' },
        newValues: {
          status: 'REVERSED',
          reason: input.reason,
          amount: payment.amount.toString(),
        },
        ipAddress: req.ip ?? null,
        userAgent: req.userAgent ?? null,
      });

      return this.toLinePayment(updated);
    });
  }

  async update(
    paymentId: string,
    input: UpdateLinePaymentInput,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<LinePayment> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.linePayment.findUnique({
        where: { id: paymentId },
      });
      if (!existing) {
        throw new NotFoundException({
          message: 'دفعة الخط غير موجودة',
          code: 'LINE_PAYMENT_NOT_FOUND',
        });
      }

      if (existing.status !== 'ACTIVE') {
        throw new BusinessException(
          'LINE_PAYMENT_NOT_ACTIVE',
          'لا يمكن تعديل دفعة معكوسة',
          400,
        );
      }

      const oldValues: Record<string, unknown> = {};
      const newValues: Record<string, unknown> = {};

      if (input.amount !== undefined) {
        const newAmount = new Prisma.Decimal(input.amount);
        if (!newAmount.equals(existing.amount)) {
          oldValues.amount = existing.amount.toString();
          newValues.amount = input.amount;
        }
      }
      if (input.notes !== undefined && input.notes !== existing.notes) {
        oldValues.notes = existing.notes;
        newValues.notes = input.notes;
      }
      if (
        input.paymentDate !== undefined &&
        input.paymentDate.getTime() !== existing.paymentDate.getTime()
      ) {
        oldValues.paymentDate = existing.paymentDate.toISOString();
        newValues.paymentDate = input.paymentDate.toISOString();
      }

      if (Object.keys(newValues).length === 0) {
        return this.toLinePayment(existing);
      }

      const updated = await tx.linePayment.update({
        where: { id: paymentId },
        data: {
          ...(input.amount !== undefined
            ? { amount: new Prisma.Decimal(input.amount) }
            : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.paymentDate !== undefined
            ? { paymentDate: input.paymentDate }
            : {}),
        },
      });

      // Update associated cash movement
      if (input.amount !== undefined || input.paymentDate !== undefined) {
        await tx.cashMovement.updateMany({
          where: { sourceType: 'LINE_PAYMENT', sourceId: paymentId },
          data: {
            ...(input.amount !== undefined
              ? { amount: new Prisma.Decimal(input.amount) }
              : {}),
            ...(input.paymentDate !== undefined
              ? { movementDate: input.paymentDate }
              : {}),
          },
        });
      }

      await this.auditService.logTx(tx, {
        userId,
        action: 'LINE_PAYMENT_UPDATED',
        entityType: 'LinePayment',
        entityId: paymentId,
        oldValues: Object.keys(oldValues).length > 0 ? oldValues : null,
        newValues,
        ipAddress: req.ip ?? null,
        userAgent: req.userAgent ?? null,
      });

      return this.toLinePayment(updated);
    });
  }

  async delete(
    paymentId: string,
    userId: string,
    req: { ip?: string; userAgent?: string },
  ): Promise<{ success: boolean }> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.linePayment.findUnique({
        where: { id: paymentId },
      });
      if (!existing) {
        throw new NotFoundException({
          message: 'دفعة الخط غير موجودة',
          code: 'LINE_PAYMENT_NOT_FOUND',
        });
      }

      if (existing.status !== 'ACTIVE') {
        throw new BusinessException(
          'LINE_PAYMENT_NOT_ACTIVE',
          'لا يمكن حذف دفعة معكوسة',
          400,
        );
      }

      // Delete associated cash movement
      await tx.cashMovement.deleteMany({
        where: { sourceType: 'LINE_PAYMENT', sourceId: paymentId },
      });

      await tx.linePayment.delete({ where: { id: paymentId } });

      await this.auditService.logTx(tx, {
        userId,
        action: 'LINE_PAYMENT_DELETED',
        entityType: 'LinePayment',
        entityId: paymentId,
        oldValues: {
          lineId: existing.lineId,
          amount: existing.amount.toString(),
          period: existing.period,
        },
        ipAddress: req.ip ?? null,
        userAgent: req.userAgent ?? null,
      });

      return { success: true };
    });
  }

  private toLinePayment(row: {
    id: string;
    lineId: string;
    amount: Prisma.Decimal;
    period: string;
    status: 'ACTIVE' | 'REVERSED';
    paymentDate: Date;
    notes: string | null;
    createdBy: string;
    createdAt: Date;
    reversedAt: Date | null;
    reversedBy: string | null;
    reversalReason: string | null;
  }): LinePayment {
    return {
      id: row.id,
      lineId: row.lineId,
      amount: toMoneyStringRequired(row.amount),
      period: row.period,
      status: row.status,
      paymentDate: row.paymentDate.toISOString(),
      notes: row.notes,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      reversedAt: row.reversedAt ? row.reversedAt.toISOString() : null,
      reversedBy: row.reversedBy,
      reversalReason: row.reversalReason,
    };
  }
}