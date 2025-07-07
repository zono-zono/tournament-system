// ユーザーテーブルのデバッグ用スクリプト
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://kldspkowaezkyiqwdsht.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHNwa293YWV6a3lpcXdkc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzc1MTEsImV4cCI6MjA2Njg1MzUxMX0.VB4C2BeC8iIVNaEDhDNTYqL3At1MgEkTJGGOSDxZVE0";

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