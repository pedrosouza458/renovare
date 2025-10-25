// Image compression utility to prevent 413 Payload Too Large errors
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export const compressImage = (
  file: File,
  options: CompressImageOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with the specified quality
      let currentQuality = quality;
      let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      
      // Reduce quality until under size limit
      while (getDataUrlSizeKB(dataUrl) > maxSizeKB && currentQuality > 0.1) {
        currentQuality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

const getDataUrlSizeKB = (dataUrl: string): number => {
  // Remove data URL prefix to get just the base64 data
  const base64 = dataUrl.split(',')[1];
  // Base64 encoding adds ~33% overhead, so divide by 1.33 to get approximate original size
  return (base64.length * 0.75) / 1024;
};

export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }

  // Check file size (before compression)
  const maxSizeMB = 10; // Allow up to 10MB for input
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image is too large. Please select an image smaller than ${maxSizeMB}MB`;
  }

  return null;
};