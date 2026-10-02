import { apiClient } from '../../../lib/api-client';
import type { LinePayment } from '@prince-net/types';
import type { UpdateLinePaymentInput } from '@prince-net/validation';

interface UpdateParams {
  id: string;
  input: UpdateLinePaymentInput;
}

export async function updateLinePayment({
  id,
  input,
}: UpdateParams): Promise<LinePayment> {
  return apiClient.patch<LinePayment>(`/line-payments/${id}`, input);
}
