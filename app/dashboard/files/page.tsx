import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileManager } from "@/components/file-manager";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageUploadConfig, documentUploadConfig, profileImageConfig, tournamentLogoConfig } from "@/lib/upload";

export const runtime = 'edge';

export default async function FilesPage() {
  let user = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    user = authUser;
    
    if (!user) {
      return redirect("/auth/login");
    }
  } catch (error) {
    console.error("Auth error:", error);
    return redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ファイル管理</h1>
        <p className="text-muted-foreground">
          画像やドキュメントをアップロード・管理できます
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">ファイル一覧</TabsTrigger>
          <TabsTrigger value="upload">アップロード</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <FileManager userId={user.id} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 画像アップロード */}
            <Card>
              <CardHeader>
                <CardTitle>画像アップロード</CardTitle>
                <CardDescription>
                  一般的な画像ファイルをアップロードできます（最大5MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  config={imageUploadConfig}
                  userId={user.id}
                  accept="image/*"
                  multiple
                />
              </CardContent>
            </Card>

            {/* ドキュメントアップロード */}
            <Card>
              <CardHeader>
                <CardTitle>ドキュメントアップロード</CardTitle>
                <CardDescription>
                  PDF、Word文書、テキストファイルをアップロードできます（最大10MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  config={documentUploadConfig}
                  userId={user.id}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                />
              </CardContent>
            </Card>

            {/* プロフィール画像アップロード */}
            <Card>
              <CardHeader>
                <CardTitle>プロフィール画像</CardTitle>
                <CardDescription>
                  プロフィール用の画像をアップロードできます（最大1MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  config={profileImageConfig}
                  userId={user.id}
                  accept="image/*"
                />
              </CardContent>
            </Card>

            {/* 大会ロゴアップロード */}
            <Card>
              <CardHeader>
                <CardTitle>大会ロゴ</CardTitle>
                <CardDescription>
                  大会用のロゴ画像をアップロードできます（最大2MB）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  config={tournamentLogoConfig}
                  userId={user.id}
                  accept="image/*"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}