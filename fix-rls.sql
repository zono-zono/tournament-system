-- RLSポリシーの修正
-- Supabase管理画面のSQL Editorで実行してください

-- ユーザーテーブルにINSERTポリシーを追加
CREATE POLICY "Enable insert for authentication" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_profilesテーブルにもポリシーを追加
CREATE POLICY "Users can read own user_profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_profiles" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);