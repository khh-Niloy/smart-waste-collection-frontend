import { api } from '@/lib/api';

export interface UploadedPhotoResponse {
  storageKey: string;
  previewUrl: string;
  mimeType: string;
  size: number;
}

export const uploadsService = {
  async uploadPhoto(file: File): Promise<UploadedPhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<UploadedPhotoResponse>(
      '/uploads/photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data;
  },
};

