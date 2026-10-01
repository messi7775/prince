import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateLinePaymentInput } from '@prince-net/validation';
import { updateLinePayment } from '../api/update';

interface UpdateParams {
  id: string;
  lineId: string;
  input: UpdateLinePaymentInput;
}

export function useUpdateLinePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: Omit<UpdateParams, 'lineId'>) =>
      updateLinePayment({ id, input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
