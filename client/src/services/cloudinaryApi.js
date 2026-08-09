import api from './api';

export const cloudinaryApi = {
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/cloudinary/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteVideo: (publicId) => api.delete(`/cloudinary/video/${publicId}`),
};
