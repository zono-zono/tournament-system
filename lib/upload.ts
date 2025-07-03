export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadConfig {
  maxSize: number; // bytes
  allowedTypes: string[];
  folder: string;
}

// 画像アップロード設定
export const imageUploadConfig: UploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  folder: 'images',
};

// 大会ロゴアップロード設定
export const tournamentLogoConfig: UploadConfig = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  folder: 'tournament-logos',
};

// プロフィール画像アップロード設定
export const profileImageConfig: UploadConfig = {
  maxSize: 1 * 1024 * 1024, // 1MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  folder: 'profile-images',
};

// ドキュメントアップロード設定
export const documentUploadConfig: UploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  folder: 'documents',
};

// ファイル検証
export function validateFile(file: File, config: UploadConfig): { valid: boolean; error?: string } {
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます。${maxSizeMB}MB以下にしてください。`,
    };
  }

  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `対応していないファイル形式です。対応形式: ${config.allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

// ファイル名の生成
export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  
  return `${userId}_${timestamp}_${randomString}.${extension}`;
}

// 画像リサイズ（ブラウザ側）
export function resizeImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持してリサイズ
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('画像の変換に失敗しました'));
        }
      }, file.type, quality);
    };

    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    img.src = URL.createObjectURL(file);
  });
}

// MIME タイプから拡張子を取得
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
  };
  
  return mimeToExt[mimeType] || 'bin';
}