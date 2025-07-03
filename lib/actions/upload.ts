"use server";

import { createClient } from "@/lib/supabase/server";
import { UploadResult, generateFileName, validateFile, UploadConfig } from "@/lib/upload";

export async function uploadFileToSupabase(
  formData: FormData,
  config: UploadConfig,
  userId: string
): Promise<UploadResult> {
  try {
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: "ファイルが選択されていません。" };
    }

    // ファイル検証
    const validation = validateFile(file, config);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // ファイル名生成
    const fileName = generateFileName(file.name, userId);
    const filePath = `${config.folder}/${fileName}`;

    // Supabase Storage にアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { 
        success: false, 
        error: `アップロードに失敗しました: ${uploadError.message}` 
      };
    }

    // 公開URL取得
    const { data: urlData } = supabase.storage
      .from('tournament-files')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return { 
        success: false, 
        error: "アップロードは成功しましたが、URLの取得に失敗しました。" 
      };
    }

    // ファイル情報をデータベースに保存
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        public_url: urlData.publicUrl,
        folder: config.folder,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // ファイルは正常にアップロードされたが、DBへの記録に失敗
      // URLは返すが、警告を含める
    }

    return {
      success: true,
      url: urlData.publicUrl,
    };

  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      success: false,
      error: "予期しないエラーが発生しました。",
    };
  }
}

export async function deleteFileFromSupabase(filePath: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // ファイルの所有者確認
    const { data: fileData, error: fileError } = await supabase
      .from('uploaded_files')
      .select('user_id')
      .eq('file_path', filePath)
      .single();

    if (fileError || fileData?.user_id !== userId) {
      console.error('File ownership verification failed');
      return false;
    }

    // Supabase Storage からファイル削除
    const { error: deleteError } = await supabase.storage
      .from('tournament-files')
      .remove([filePath]);

    if (deleteError) {
      console.error('File deletion error:', deleteError);
      return false;
    }

    // データベースからレコード削除
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('file_path', filePath)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      // ファイルは削除されたが、DBレコードの削除に失敗
    }

    return true;

  } catch (error) {
    console.error('Unexpected deletion error:', error);
    return false;
  }
}

export async function getUserFiles(userId: string, folder?: string): Promise<any[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (folder) {
      query = query.eq('folder', folder);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user files:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Unexpected error fetching files:', error);
    return [];
  }
}