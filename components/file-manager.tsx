"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  FileIcon, 
  ImageIcon, 
  Trash2, 
  Download, 
  Search,
  Grid3X3,
  List,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserFiles, deleteFileFromSupabase } from "@/lib/actions/upload";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface FileData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  public_url: string;
  folder: string;
  created_at: string;
}

interface FileManagerProps {
  userId: string;
  folder?: string;
  onFileSelect?: (file: FileData) => void;
  selectable?: boolean;
  className?: string;
}

export function FileManager({
  userId,
  folder,
  onFileSelect,
  selectable = false,
  className,
}: FileManagerProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(folder || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [userId, folder]);

  useEffect(() => {
    filterFiles();
  }, [files, searchTerm, selectedFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await getUserFiles(userId, folder);
      setFiles(data);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = files;

    // フォルダーフィルター
    if (selectedFolder !== "all") {
      filtered = filtered.filter(file => file.folder === selectedFolder);
    }

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  };

  const handleDelete = async (file: FileData) => {
    if (!confirm(`「${file.file_name}」を削除しますか？`)) return;

    setDeleting(file.id);
    try {
      const success = await deleteFileFromSupabase(file.file_path, userId);
      if (success) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
      } else {
        alert("ファイルの削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("ファイルの削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  const getFolderBadgeColor = (folderName: string) => {
    const colors: Record<string, string> = {
      'profile-images': 'bg-green-100 text-green-800',
      'tournament-logos': 'bg-blue-100 text-blue-800',
      'documents': 'bg-purple-100 text-purple-800',
      'images': 'bg-yellow-100 text-yellow-800',
    };
    return colors[folderName] || 'bg-gray-100 text-gray-800';
  };

  const getFolderDisplayName = (folderName: string) => {
    const names: Record<string, string> = {
      'profile-images': 'プロフィール画像',
      'tournament-logos': '大会ロゴ',
      'documents': 'ドキュメント',
      'images': '画像',
    };
    return names[folderName] || folderName;
  };

  const uniqueFolders = Array.from(new Set(files.map(f => f.folder)));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* フィルター・検索バー */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="text-lg">ファイル管理</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ファイル名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedFolder === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder("all")}
              >
                すべて
              </Button>
              {uniqueFolders.map(folderName => (
                <Button
                  key={folderName}
                  variant={selectedFolder === folderName ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFolder(folderName)}
                >
                  {getFolderDisplayName(folderName)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ファイル一覧 */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || selectedFolder !== "all" ? "条件に一致するファイルが見つかりません" : "ファイルがありません"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "space-y-2"
        )}>
          {filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className={cn(
                "transition-all hover:shadow-md",
                selectable && "cursor-pointer hover:border-primary",
                viewMode === "list" && "p-4"
              )}
              onClick={() => selectable && onFileSelect?.(file)}
            >
              {viewMode === "grid" ? (
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getFileIcon(file.file_type)}
                      <Badge className={getFolderBadgeColor(file.folder)} variant="outline">
                        {getFolderDisplayName(file.folder)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(file.created_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                        disabled={deleting === file.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === file.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(file.file_type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <Badge className={getFolderBadgeColor(file.folder)} variant="outline">
                          {getFolderDisplayName(file.folder)}
                        </Badge>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(file.created_at), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={file.public_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      disabled={deleting === file.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === file.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}