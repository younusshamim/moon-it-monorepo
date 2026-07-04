// Room write mutations. Branch scope is enforced server-side (the service checks the resource's branch
// against the caller's grants); the client just sends the payload and invalidates on success.
import { type NewRoom, type Room, RoomSchema, type UpdateRoom } from "@moonit/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewRoom): Promise<Room> =>
      apiFetch("/v1/rooms", { method: "POST", body: input, schema: RoomSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() }),
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoom }): Promise<Room> =>
      apiFetch(`/v1/rooms/${id}`, { method: "PATCH", body: input, schema: RoomSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() }),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => apiFetch(`/v1/rooms/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() }),
  });
}
