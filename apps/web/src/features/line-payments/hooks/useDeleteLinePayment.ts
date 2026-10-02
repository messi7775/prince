import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLinePayment } from '../api/delete';

interface DeleteParams {
  id: string;
  lineId: string;
}

export function useDeleteLinePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: Omit<DeleteParams, 'lineId'>) =>
      deleteLinePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lines'] });
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
