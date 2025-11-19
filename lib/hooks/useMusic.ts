import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface GenerateMusicInput {
  prompt: string;
  duration?: number;
  userId?: string;
  title?: string;
}

export interface Track {
  id: string;
  title: string;
  description?: string;
  prompt?: string;
  audioUrl: string | null;
  duration: number | null;
  status: string;
  createdAt: string;
  model?: string;
  metadata?: {
    prompt: string;
    model: string;
    created_at: string;
    [key: string]: unknown;
  };
}

// Generate music mutation
export function useGenerateMusicMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateMusicInput) => {
      const response = await fetch(`${API_URL}/music/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate music');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate tracks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}

// Get all tracks query
export function useTracksQuery(userId?: string, limit = 10) {
  return useQuery({
    queryKey: ['tracks', userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_URL}/music/tracks?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      return data.data as Track[];
    },
  });
}

// Get specific track by ID
export function useTrackQuery(id: string) {
  return useQuery({
    queryKey: ['track', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/music/tracks/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch track');
      }

      const data = await response.json();
      return data.data as Track;
    },
    enabled: !!id,
  });
}

// Delete track mutation
export function useDeleteTrackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/music/tracks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}
