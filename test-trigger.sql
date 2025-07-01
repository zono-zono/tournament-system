-- データベーストリガーのテスト用SQL
-- Supabase管理画面のSQL Editorで実行してください

-- 1. 現在のトリガー状況確認
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. ユーザープロファイル作成関数の存在確認
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';

-- 3. 既存のユーザー確認
SELECT id, username, created_at FROM users LIMIT 5;

-- 4. 手動でのユーザー作成テスト（トリガーをテスト）
-- 注意: このクエリは実際にユーザーを作成します
-- INSERT INTO auth.users (id, email, raw_user_meta_data) 
-- VALUES (gen_random_uuid(), 'manual-test@example.com', '{"username": "manualtest"}');

-- 5. RLSポリシー確認
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'users';