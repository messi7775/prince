import { apiClient } from '../../../lib/api-client';

export async function deleteLinePayment(id: string): Promise<void> {
  await apiClient.delete<{ success: boolean }>(`/line-payments/${id}`);
}
