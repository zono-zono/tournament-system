// ユーザーテーブルのデバッグ用スクリプト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Environment variables validation
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません。SUPABASE_URL と SUPABASE_ANON_KEY を設定してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsers() {
  try {
    console.log('🔍 ユーザーテーブルの状況を確認中...');
    
    // public.users テーブルの確認
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*');
    
    if (publicError) {
      console.error('❌ public.users テーブルエラー:', publicError.message);
    } else {
      console.log('✅ public.users テーブル:', publicUsers.length, '件');
      publicUsers.forEach(user => {
        console.log('  -', user.id, user.username);
      });
    }
    
    // tournaments テーブルの確認
    console.log('\n🏆 トーナメントテーブルの状況を確認中...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*');
    
    if (tournamentsError) {
      console.error('❌ tournaments テーブルエラー:', tournamentsError.message);
    } else {
      console.log('✅ tournaments テーブル:', tournaments.length, '件');
      tournaments.forEach(tournament => {
        console.log('  -', tournament.id, tournament.name, 'organizer:', tournament.organizer_id);
      });
    }
    
    // リレーションシップのテスト
    console.log('\n🔗 リレーションシップのテスト...');
    const { data: tournamentWithOrganizer, error: relationError } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:users!tournaments_organizer_id_fkey(username)
      `)
      .limit(1);
    
    if (relationError) {
      console.error('❌ リレーションシップエラー:', relationError.message);
    } else {
      console.log('✅ リレーションシップテスト成功');
      console.log('結果:', tournamentWithOrganizer);
    }
    
  } catch (error) {
    console.error('❌ デバッグエラー:', error.message);
  }
}

debugUsers().catch(console.error);