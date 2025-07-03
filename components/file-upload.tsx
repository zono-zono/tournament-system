"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon, ImageIcon, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadConfig, validateFile, resizeImage } from "@/lib/upload";
import { uploadFileToSupabase } from "@/lib/actions/upload";

interface FileUploadProps {
  config: UploadConfig;
  userId: string;
  onUploadComplete?: (url: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  resizeImages?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

export function FileUpload({
  config,
  userId,
  onUploadComplete,
  onUploadError,
  accept,
  multiple = false,
  className,
  resizeImages = true,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // ファイル検証
    const validation = validateFile(file, config);
    if (!validation.valid) {
      setUploadingFiles(prev => 
        prev.map(f => f.file === file ? { ...f, status: "error", error: validation.error } : f)
      );
      onUploadError?.(validation.error || "ファイル検証エラー");
      return;
    }

    let processedFile: File | Blob = file;

    // 画像の場合はリサイズ
    if (resizeImages && file.type.startsWith('image/')) {
      try {
        processedFile = await resizeImage(file);
      } catch (error) {
        console.error('Image resize failed:', error);
        // リサイズに失敗しても元ファイルで続行
      }
    }

    // アップロード開始
    const formData = new FormData();
    formData.append('file', processedFile instanceof Blob ? new File([processedFile], file.name, { type: file.type }) : processedFile);

    try {
      // プログレス更新をシミュレート
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f => f.file === file ? { ...f, progress: Math.min(f.progress + 10, 90) } : f)
        );
      }, 200);

      const result = await uploadFileToSupabase(formData, config, userId);

      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadingFiles(prev =>
          prev.map(f => f.file === file ? { 
            ...f, 
            progress: 100, 
            status: "success", 
            url: result.url 
          } : f)
        );
        onUploadComplete?.(result.url, file.name);
      } else {
        setUploadingFiles(prev =>
          prev.map(f => f.file === file ? { 
            ...f, 
            status: "error", 
            error: result.error 
          } : f)
        );
        onUploadError?.(result.error || "アップロードエラー");
      }
    } catch (error) {
      setUploadingFiles(prev =>
        prev.map(f => f.file === file ? { 
          ...f, 
          status: "error", 
          error: "アップロードに失敗しました" 
        } : f)
      );
      onUploadError?.("アップロードに失敗しました");
    }
  }, [config, userId, onUploadComplete, onUploadError, resizeImages]);

  const handleFiles = useCallback((files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // 各ファイルを処理
    newFiles.forEach(({ file }) => {
      processFile(file);
    });
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    return <FileIcon className="h-8 w-8" />;
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* ドロップゾーン */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-primary hover:bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className={cn(
            "h-12 w-12 mb-4",
            dragActive ? "text-primary" : "text-muted-foreground"
          )} />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              ファイルをドロップするかクリックして選択
            </p>
            <p className="text-sm text-muted-foreground">
              最大サイズ: {(config.maxSize / (1024 * 1024)).toFixed(1)}MB
            </p>
            <p className="text-xs text-muted-foreground">
              対応形式: {config.allowedTypes.join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* アップロード状況 */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((uploadFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(uploadFile.file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === "uploading" && (
                        <LoadingSpinner size="sm" />
                      )}
                      {uploadFile.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {uploadFile.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.file)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{formatFileSize(uploadFile.file.size)}</span>
                    {uploadFile.status === "uploading" && (
                      <span>{uploadFile.progress}%</span>
                    )}
                  </div>
                  
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}
                  
                  {uploadFile.status === "error" && uploadFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                  )}
                  
                  {uploadFile.status === "success" && uploadFile.url && (
                    <p className="text-xs text-green-600 mt-1">アップロード完了</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}