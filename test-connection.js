// Supabase接続テスト用スクリプト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://kldspkowaezkyiqwdsht.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0";

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'あり' : 'なし');
  process.exit(1);
}

console.log('🔗 Supabase接続テスト開始...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Supabaseへの基本的な接続テスト
    console.log('📡 接続テスト中...');
    
    // まずは認証状態を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 認証状態:', user ? 'ログイン済み' : '未ログイン');
    
    // 認証テスト
    console.log('🔐 認証テスト中...');
    
    // テスト用認証
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('❌ 認証エラー:', signUpError.message);
      return { connected: false, hasAuth: false, hasSchema: false };
    } else {
      console.log('✅ 認証機能が動作しています');
    }
    
    // データベーステーブルの存在確認
    console.log('🗃️  テーブル存在確認中...');
    
    // tournamentsテーブルへの簡単なクエリ（エラーでテーブルの存在を確認）
    const { data, error } = await supabase
      .from('tournaments')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "tournaments" does not exist')) {
        console.log('⚠️  データベースにテーブルが作成されていません');
        console.log('📋 スキーマを適用する必要があります');
        return { connected: true, hasSchema: false };
      } else {
        console.log('❌ データベースエラー:', error.message);
        return { connected: false, hasSchema: false };
      }
    } else {
      console.log('✅ データベース接続成功！');
      console.log('✅ テーブルが存在します');
      return { connected: true, hasSchema: true };
    }
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    return { connected: false, hasSchema: false };
  }
}

testConnection().then(result => {
  console.log('\n📊 テスト結果:');
  console.log('- 接続:', result.connected ? '✅ 成功' : '❌ 失敗');
  console.log('- スキーマ:', result.hasSchema ? '✅ 適用済み' : '❌ 未適用');
  
  if (result.connected && !result.hasSchema) {
    console.log('\n🔧 次のステップ:');
    console.log('1. Supabase管理画面にアクセス: https://app.supabase.com');
    console.log('2. SQL Editorを開く');
    console.log('3. supabase/migrations/001_initial_schema.sql の内容を実行');
  }
}).catch(console.error);