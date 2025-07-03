"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { X, Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadConfig } from "@/lib/upload";

interface ImageUploadProps {
  config: UploadConfig;
  userId: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  className?: string;
  placeholder?: string;
  aspectRatio?: "square" | "video" | "auto";
  size?: "sm" | "md" | "lg";
}

export function ImageUpload({
  config,
  userId,
  value,
  onChange,
  className,
  placeholder = "画像をアップロード",
  aspectRatio = "auto",
  size = "md",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(!value);

  const sizeClasses = {
    sm: "h-24 w-24",
    md: "h-32 w-32",
    lg: "h-48 w-48",
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  const handleUploadComplete = (url: string) => {
    setIsUploading(false);
    setShowUpload(false);
    onChange?.(url);
  };

  const handleUploadError = (error: string) => {
    setIsUploading(false);
    console.error("Upload error:", error);
  };

  const handleRemove = () => {
    onChange?.(undefined);
    setShowUpload(true);
  };

  if (value && !showUpload) {
    return (
      <div className={cn("relative group", className)}>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className={cn(
              "relative overflow-hidden bg-muted",
              sizeClasses[size],
              aspectClasses[aspectRatio]
            )}>
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 200px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 mr-2" />
                  削除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <FileUpload
        config={config}
        userId={userId}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        accept="image/*"
        resizeImages={true}
        className="w-full"
      />
    </div>
  );
}

// プロフィール画像専用コンポーネント
interface ProfileImageUploadProps {
  userId: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileImageUpload({
  userId,
  value,
  onChange,
  size = "md",
  className,
}: ProfileImageUploadProps) {
  const profileConfig: UploadConfig = {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'profile-images',
  };

  return (
    <ImageUpload
      config={profileConfig}
      userId={userId}
      value={value}
      onChange={onChange}
      placeholder="プロフィール画像をアップロード"
      aspectRatio="square"
      size={size}
      className={className}
    />
  );
}

// 大会ロゴ専用コンポーネント
interface TournamentLogoUploadProps {
  userId: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  className?: string;
}

export function TournamentLogoUpload({
  userId,
  value,
  onChange,
  className,
}: TournamentLogoUploadProps) {
  const logoConfig: UploadConfig = {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'tournament-logos',
  };

  return (
    <ImageUpload
      config={logoConfig}
      userId={userId}
      value={value}
      onChange={onChange}
      placeholder="大会ロゴをアップロード"
      aspectRatio="auto"
      size="lg"
      className={className}
    />
  );
}