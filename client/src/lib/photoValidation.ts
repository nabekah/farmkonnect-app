export interface PhotoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  lastModified: number;
  dataUrl?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function validatePhoto(file: File): Promise<PhotoValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let metadata: PhotoMetadata | undefined;

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`File type not supported. Allowed types: JPEG, PNG, GIF, WebP`);
  }

  // Get image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
      warnings.push(
        `Image resolution is low (${dimensions.width}x${dimensions.height}). Recommended minimum: ${MIN_WIDTH}x${MIN_HEIGHT}`
      );
    }

    metadata = {
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
  } catch (error) {
    errors.push('Failed to read image dimensions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 2048x2048)
        let width = img.width;
        let height = img.height;
        const maxDim = 2048;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function generatePhotoThumbnail(file: File, size: number = 200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = size;
        canvas.height = size;

        // Calculate crop area to maintain aspect ratio
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function getPhotoStats(files: File[]): {
  totalSize: number;
  totalSizeMB: string;
  averageSize: string;
  largestFile: string;
} {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const largestFile = Math.max(...files.map((f) => f.size));

  return {
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    averageSize: ((totalSize / files.length) / 1024).toFixed(2),
    largestFile: (largestFile / 1024 / 1024).toFixed(2),
  };
}

export async function validatePhotoCollection(
  files: File[],
  minPhotos: number = 1
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validPhotos: File[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validPhotos: File[] = [];

  if (files.length < minPhotos) {
    errors.push(`Please upload at least ${minPhotos} photo(s). Current: ${files.length}`);
  }

  for (const file of files) {
    const result = await validatePhoto(file);
    if (result.isValid) {
      validPhotos.push(file);
    } else {
      errors.push(`${file.name}: ${result.errors.join(', ')}`);
    }
    warnings.push(...result.warnings.map((w) => `${file.name}: ${w}`));
  }

  return {
    isValid: errors.length === 0 && validPhotos.length >= minPhotos,
    errors,
    warnings,
    validPhotos,
  };
}
