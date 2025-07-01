# 大会管理システム 仕様書

## 1. システム概要

### 1.1 目的
大会やトーナメントの管理を効率化し、管理者と参加者の双方にとって使いやすい大会運営システムを提供する。

### 1.2 システム概要
- 管理者は大会の作成、公開、管理を行う
- 利用者は公開された大会にエントリーできる
- ドラッグ&ドロップによる直感的な大会運営機能を提供

## 2. ユーザー役割

### 2.1 管理者（Administrator）
- 大会の作成・編集・削除
- 大会の公開・非公開設定
- 参加者の管理・承認
- 組み合わせの作成・管理（トーナメント・リーグ）
- 対戦表の管理（ドラッグ&ドロップ操作）
- 看板（対戦情報表示板）の管理
- 試合結果の入力・管理
- 大会進行の統制
- アナウンス通知の送信（メール・LINE）

### 2.2 利用者（Participant）
- 公開された大会の閲覧
- 大会へのエントリー
- 自分の対戦情報の確認
- 看板（対戦情報表示板）の閲覧

## 3. 主要機能

### 3.1 大会管理機能（管理者用）
#### 3.1.1 大会作成・編集
- 大会名、説明、開催日時の設定
- 参加人数上限・下限の設定
- エントリー期間の設定（開始・終了日時）
- 大会形式の選択（シングルエリミネーション、ダブルエリミネーション、リーグ戦、スイス式等）
- 参加資格・条件の設定
- 参加費の設定（無料/有料）
- 会場情報・アクセス情報の入力

#### 3.1.2 大会公開・参加者管理
- 大会の公開・非公開切り替え
- エントリー受付の開始・終了
- 参加者の承認・拒否機能
- 参加者情報の確認・編集
- 参加者への一括連絡機能
- 定員管理（キャンセル待ち機能）

#### 3.1.3 組み合わせ管理機能
- **トーナメント方式**の組み合わせ作成
  - シングルエリミネーション
  - ダブルエリミネーション
  - 参加者数に応じた自動組み合わせ生成
  - 手動での組み合わせ調整
- **リーグ戦方式**の組み合わせ作成
  - 総当たり戦
  - グループ分け機能
  - 試合数の自動計算
- **複数組み合わせの管理**
  - 1つの大会に複数のトーナメント・リーグを作成可能
  - 例：トーナメント2つ + リーグ4つ
  - 各組み合わせの独立した進行管理
  - 組み合わせ間の参加者振り分け

#### 3.1.4 看板管理機能
- **ドラッグ&ドロップ操作**による看板の自由配置
- 看板情報の編集：
  - 対戦相手の変更
  - コート番号の設定
  - 日時の変更
  - その他大会運営に必要な情報

#### 3.1.5 アナウンス通知機能
- **メール通知**
  - 参加者全員への一斉送信
  - 特定の組み合わせ参加者への送信
  - カスタムメッセージの作成
  - 送信履歴の管理
- **LINE通知**
  - LINE Messaging API連携
  - 参加者のLINEアカウント連携
  - リッチメッセージの送信
  - 通知の既読確認
- **通知テンプレート**
  - 定型文の作成・管理
  - 大会情報の自動挿入
  - 多言語対応

### 3.2 参加者機能（利用者用）
#### 3.2.1 大会検索・閲覧
- 公開中の大会一覧表示（検索・フィルタ機能付き）
- 大会詳細情報の閲覧
- お気に入り大会の登録・管理

#### 3.2.2 エントリー機能
- 大会への参加申込（必要情報の入力）
- エントリー情報の確認・変更・キャンセル
- エントリー状況の確認（承認待ち/承認済み/拒否）

#### 3.2.3 看板閲覧機能
- 大会の看板（対戦情報表示板）の閲覧
- 対戦相手、コート番号、日時等の確認
- リアルタイムでの看板情報更新表示
- 自分の試合スケジュールのハイライト表示

#### 3.2.4 通知機能
- 大会情報更新の通知
- 試合開始時間の通知
- 結果発表の通知

### 3.3 対戦管理機能
#### 3.3.1 対戦表生成
- 各組み合わせ（トーナメント・リーグ）ごとの対戦表作成
- 参加者に基づく自動対戦表作成
- 手動での対戦組み合わせ調整
- シード設定機能
- 予選・本戦の分離管理

#### 3.3.2 進行管理
- 組み合わせ別の試合結果入力・編集
- 次回戦の自動生成（トーナメント）
- 総当たり戦の進行管理（リーグ）
- 試合進行状況の管理
- 不戦勝・棄権の処理
- 遅刻・欠席の管理

#### 3.3.3 結果管理
- 組み合わせ別の最終結果・順位確定
- 複数組み合わせの統合結果管理
- 表彰台・入賞者の管理
- 大会結果のエクスポート機能

### 3.4 料金体系 (管理者向け)
#### 3.4.1 無料プラン
- 新規登録した管理者は、最初の1大会まで無料で作成・運営することができます。

#### 3.4.2 有料プラン
- 2大会目以降の大会を作成・運営するには、有料プランへの加入が必要です。
- **決済処理**: 決済はStripeを利用して行います。
- **機能**:
  - 無制限の大会作成
  - 高度な機能へのアクセス（将来的な拡張）

## 4. システム要件

### 4.1 機能要件
- Webブラウザでアクセス可能（Chrome、Firefox、Safari、Edge対応）
- レスポンシブデザイン対応（PC、タブレット、スマートフォン）
- リアルタイム更新機能（WebSocket使用）
- ドラッグ&ドロップUI（看板操作）
- マルチ言語対応（日本語、英語）
- アクセシビリティ対応（WCAG 2.1 AA準拠）

### 4.2 非機能要件
- **セキュリティ**：ユーザー認証・認可、HTTPS通信、データ暗号化
- **パフォーマンス**：同時アクセス100人以上対応、ページ読み込み3秒以内
- **可用性**：99.9%以上の稼働率、定期メンテナンス時間を除く
- **拡張性**：マイクロサービス アーキテクチャ採用
- **保守性**：コードの可読性、テストカバレッジ80%以上

## 5. データ構造

### 5.1 主要エンティティ

#### User（ユーザー）
- user_id (Primary Key): ユーザーID
- username: ユーザー名
- email: メールアドレス
- password_hash: パスワードハッシュ
- role: 役割（admin/participant）
- subscription_status: 購読ステータス (free/paid)
- stripe_customer_id: Stripe顧客ID
- created_at: 作成日時
- updated_at: 更新日時

#### Tournament（大会）
- tournament_id (Primary Key): 大会ID
- name: 大会名
- description: 説明
- start_date: 開始日時
- end_date: 終了日時
- entry_start: エントリー開始日時
- entry_end: エントリー終了日時
- max_participants: 最大参加者数
- min_participants: 最小参加者数
- entry_fee: 参加費
- venue: 会場情報
- status: 状態（draft/published/ongoing/completed/cancelled）
- created_by: 作成者ID (Foreign Key to User)
- created_at: 作成日時
- updated_at: 更新日時

#### TournamentEntry（大会エントリー）
- entry_id (Primary Key): エントリーID
- tournament_id (Foreign Key): 大会ID
- user_id (Foreign Key): 参加者ID
- participant_name: 参加者名
- contact_info: 連絡先
- status: ステータス（pending/approved/rejected/cancelled）
- seed_number: シード番号
- entry_date: エントリー日時
- approved_date: 承認日時

#### Competition（組み合わせ）
- competition_id (Primary Key): 組み合わせID
- tournament_id (Foreign Key): 大会ID
- name: 組み合わせ名
- type: 方式（tournament/league）
- format: 形式（single_elimination/double_elimination/round_robin/group_stage）
- max_participants: 最大参加者数
- status: 状態（draft/active/completed）
- start_date: 開始日時
- end_date: 終了日時
- created_at: 作成日時
- updated_at: 更新日時

#### CompetitionEntry（組み合わせ参加）
- entry_id (Primary Key): 参加ID
- competition_id (Foreign Key): 組み合わせID
- user_id (Foreign Key): ユーザーID
- seed_number: シード番号
- group_name: グループ名（リーグ戦用）
- status: 状態（active/eliminated/completed）
- created_at: 作成日時

#### Match（試合）
- match_id (Primary Key): 試合ID
- competition_id (Foreign Key): 組み合わせID
- round: ラウンド数
- match_number: 試合番号
- player1_id (Foreign Key): プレイヤー1ID
- player2_id (Foreign Key): プレイヤー2ID
- winner_id (Foreign Key): 勝者ID
- score: スコア
- court_number: コート番号
- scheduled_time: 予定時刻
- actual_start_time: 実際開始時刻
- actual_end_time: 実際終了時刻
- status: 状態（scheduled/in_progress/completed/walkover/cancelled）
- notes: 備考
- created_at: 作成日時
- updated_at: 更新日時

#### Board（看板）
- board_id (Primary Key): 看板ID
- tournament_id (Foreign Key): 大会ID
- name: 看板名
- position_x: X座標
- position_y: Y座標
- width: 幅
- height: 高さ
- background_color: 背景色
- text_color: 文字色
- font_size: フォントサイズ
- content: 表示内容（JSON形式）
- is_visible: 表示/非表示
- created_at: 作成日時
- updated_at: 更新日時

#### Notification（通知）
- notification_id (Primary Key): 通知ID
- user_id (Foreign Key): ユーザーID
- tournament_id (Foreign Key): 大会ID
- type: 通知タイプ（tournament_update/match_scheduled/result_announced/announcement）
- title: タイトル
- message: メッセージ
- is_read: 既読フラグ
- created_at: 作成日時

#### AnnouncementNotification（アナウンス通知）
- announcement_id (Primary Key): アナウンスID
- tournament_id (Foreign Key): 大会ID
- competition_id (Foreign Key): 組み合わせID（特定組み合わせ対象の場合）
- title: タイトル
- message: メッセージ
- notification_type: 通知方法（email/line/both）
- target_type: 対象（all_participants/competition_participants）
- sent_at: 送信日時
- created_by: 作成者ID (Foreign Key to User)
- created_at: 作成日時

#### UserProfile（ユーザープロフィール）
- user_id (Foreign Key): ユーザーID
- line_user_id: LINEユーザーID
- email_notifications: メール通知設定
- line_notifications: LINE通知設定
- phone_number: 電話番号
- created_at: 作成日時
- updated_at: 更新日時

### 5.2 リレーションシップ
- User 1:N Tournament (一人のユーザーが複数の大会を作成可能)
- Tournament 1:N TournamentEntry (一つの大会に複数のエントリー)
- User 1:N TournamentEntry (一人のユーザーが複数の大会にエントリー可能)
- Tournament 1:N Competition (一つの大会に複数の組み合わせ)
- Competition 1:N CompetitionEntry (一つの組み合わせに複数の参加者)
- Competition 1:N Match (一つの組み合わせに複数の試合)
- Tournament 1:N Board (一つの大会に複数の看板)
- User 1:N Notification (一人のユーザーに複数の通知)
- Tournament 1:N AnnouncementNotification (一つの大会に複数のアナウンス)
- User 1:1 UserProfile (ユーザーとプロフィールは1対1関係)

## 6. ユーザーストーリーとワークフロー

### 6.1 管理者ストーリー
1. **大会作成**: 管理者として、新しい大会を作成し、詳細情報を設定できる（初回無料）
2. **大会公開**: 管理者として、大会を公開して参加者を募集できる
3. **参加者管理**: 管理者として、エントリーした参加者を承認・拒否できる
4. **組み合わせ作成**: 管理者として、トーナメントやリーグの組み合わせを複数作成できる
5. **対戦表作成**: 管理者として、各組み合わせの対戦表を自動生成または手動作成できる
6. **看板管理**: 管理者として、看板をドラッグ&ドロップで自由に配置できる
7. **試合管理**: 管理者として、各組み合わせの試合結果を入力し、進行を管理できる
8. **アナウンス通知**: 管理者として、参加者にメールやLINEでアナウンスを送信できる
9. **有料プラン登録**: 管理者として、2つ目以降の大会を作成するために有料プランに登録できる

### 6.2 利用者ストーリー
1. **大会検索**: 利用者として、公開中の大会を検索・閲覧できる
2. **エントリー**: 利用者として、気になる大会にエントリーできる
3. **スケジュール確認**: 利用者として、自分の対戦スケジュールを確認できる
4. **看板閲覧**: 利用者として、大会の看板を閲覧して最新の対戦情報を確認できる
5. **通知受信**: 利用者として、大会更新や試合開始の通知を受け取ることができる

### 6.3 システムワークフロー

#### 6.3.1 大会作成から開催までのフロー
1. **大会作成** (管理者)
   - 管理者がログイン
   - 大会作成フォームに必要情報を入力（初回無料、2回目以降は有料プラン加入が必要）
   - 下書き保存で状態を'draft'に設定

2. **大会公開** (管理者)
   - 大会情報の最終確認
   - 公開ボタンで状態を'published'に変更
   - エントリー受付開始

3. **エントリー期間** (利用者)
   - 利用者が大会一覧で大会を検索
   - 大会詳細を閲覧しエントリーボタンをクリック
   - 参加情報を入力し申込み完了
   - エントリー状態が'pending'に設定

4. **参加者承認** (管理者)
   - 管理者がエントリー一覧を確認
   - 各エントリーを承認または拒否
   - 承認された参加者に通知送信

5. **組み合わせ作成** (管理者)
   - エントリー期間終了後、組み合わせを作成
   - トーナメント方式またはリーグ戦方式を選択
   - 複数の組み合わせを作成可能（例：トーナメント2つ+リーグ4つ）
   - 各組み合わせに参加者を振り分け

6. **対戦表作成** (管理者)
   - 各組み合わせで自動または手動で対戦表生成
   - シード設定や組み合わせ調整
   - 大会状態を'ongoing'に変更

7. **看板設定** (管理者)
   - 看板作成・配置をドラッグ&ドロップで実施
   - 各組み合わせの試合情報、コート情報を看板に設定
   - 看板を公開設定

8. **アナウンス送信** (管理者)
   - 必要に応じて参加者にアナウンスを送信
   - メールまたはLINEでの通知
   - 全参加者または特定組み合わせの参加者を対象に選択可能

#### 6.3.2 大会進行中のフロー
1. **試合開始前**
   - 参加者に試合開始通知送信（メール/LINE）
   - 各組み合わせの看板で最新情報を表示

2. **試合中**
   - 管理者が各組み合わせの試合状態を'in_progress'に更新
   - リアルタイムで看板情報を更新

3. **試合結果入力**
   - 管理者が各組み合わせの試合結果を入力
   - トーナメント：勝者が次ラウンドに自動進出
   - リーグ：勝点・勝数を自動集計
   - 結果を参加者に通知

4. **次ラウンド進行**
   - トーナメント：自動で次ラウンドの対戦表生成
   - リーグ：総当たり戦の進行管理
   - 各組み合わせの看板情報を更新
   - 次ラウンドのスケジュールを通知

5. **組み合わせ終了・大会終了**
   - 各組み合わせの最終結果確定
   - 複数組み合わせの結果を統合して大会全体の順位発表
   - 大会状態を'completed'に変更
   - 全参加者に結果を通知（メール/LINE）

## 7. 技術仕様

### 7.1 技術スタック

#### フロントエンド
- **フレームワーク**: Next.js (React 18+)
- **言語**: TypeScript 4.9+
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand (または React Context)
- **ドラッグ&ドロップ**: @dnd-kit/core
- **フォーム管理**: React Hook Form
- **ビルド・ホスティング**: Vercel

#### バックエンド (BaaS)
- **プラットフォーム**: Supabase
- **データベース**: Supabase Postgres
- **認証**: Supabase Auth
- **リアルタイム機能**: Supabase Realtime Subscriptions
- **サーバーレス関数**: Supabase Edge Functions (Deno)
- **ストレージ**: Supabase Storage

#### 外部サービス連携
- **決済**: Stripe
- **メール通知**: Resend
- **LINE通知**: LINE Messaging API

### 7.2 API設計

#### REST APIエンドポイント例
```
# 認証
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh

# 大会管理
GET /api/tournaments
GET /api/tournaments/:id
POST /api/tournaments
PUT /api/tournaments/:id
DELETE /api/tournaments/:id

# エントリー管理
GET /api/tournaments/:id/entries
POST /api/tournaments/:id/entries
PUT /api/tournaments/:id/entries/:entryId
DELETE /api/tournaments/:id/entries/:entryId

# 組み合わせ管理
GET /api/tournaments/:id/competitions
POST /api/tournaments/:id/competitions
PUT /api/competitions/:id
DELETE /api/competitions/:id
POST /api/competitions/:id/entries

# 試合管理
GET /api/competitions/:id/matches
POST /api/competitions/:id/matches
PUT /api/matches/:id
POST /api/matches/:id/result

# アナウンス通知
GET /api/tournaments/:id/announcements
POST /api/tournaments/:id/announcements
PUT /api/announcements/:id
DELETE /api/announcements/:id

# 料金・サブスクリプション
GET /api/subscription/status
POST /api/subscription/upgrade
POST /api/subscription/cancel
POST /api/payments/create-session

# 看板管理
GET /api/tournaments/:id/boards
POST /api/tournaments/:id/boards
PUT /api/boards/:id
DELETE /api/boards/:id
```

#### WebSocketイベント
```
# 接続
connect /ws/tournament/:id
connect /ws/competition/:id

# イベント
tournament:updated
competition:updated
match:started
match:result
board:updated
notification:new
announcement:sent
```

#### 認証・認可
- **認証方式**: JWT (JSON Web Token)
- **トークン有効期限**: Access Token (15分), Refresh Token (7日)
- **権限レベル**: admin, participant
- **セキュリティ**: CORS設定、Rate Limiting

## 8. セキュリティ要件

### 8.1 認証・認可
- ユーザー登録・ログイン機能
- 管理者権限の適切な管理
- セッション管理

### 8.2 データ保護
- **個人情報保護**: GDPR・個人情報保護法遵守
- **暗号化**: パスワードはbcryptハッシュ、機密データのAES暗号化
- **SQL injection対策**: パラメータ化クエリ、ORM使用
- **XSS対策**: 入力サニタイゼーション、CSPヘッダー
- **CSRF対策**: CSRFトークン、SameSite Cookie
- **データバックアップ**: 日次自動バックアップ、ポイントインタイムリカバリ

## 9. テスト戦略

### 9.1 テスト種別
- **単体テスト**: Jest + React Testing Library
- **結合テスト**: Supertest (APIテスト)
- **E2Eテスト**: Playwright または Cypress
- **負荷テスト**: Artillery または k6

### 9.2 テストカバレッジ目標
- コードカバレッジ: 80%以上
- クリティカルパス: 95%以上

## 10. デプロイメント戦略

### 10.1 環境構成
- **開発環境**: Docker Composeでローカル構築
- **ステージング**: AWS ECS または GCP Cloud Run
- **本番**: ロードバランサー + マルチAZ構成

### 10.2 CI/CDパイプライン
1. コードコミット
2. 自動テスト実行
3. コード品質チェック (SonarQube)
4. Dockerイメージビルド
5. ステージングデプロイ
6. E2Eテスト実行
7. 本番デプロイ (手動承認)

## 11. モニタリング・ログ

### 11.1 モニタリング
- **APM**: New Relic または Datadog
- **メトリクス**: Prometheus + Grafana
- **アラート**: PagerDuty または Slack通知

### 11.2 ログ管理
- **ログ集約**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **保存期間**: 30日間

## 12. 今後の拡張予定

### 12.1 フェーズ2機能
- **高度なメール通知**: SendGrid または Amazon SES
- **プッシュ通知**: Firebase Cloud Messaging  
- **上位プラン**: プレミアム機能の追加

### 12.2 フェーズ3機能
- **モバイルアプリ**: React Native または Flutter
- **データ分析**: 大会統計・レポート機能
- **AI機能**: 自動シード設定、最適スケジューリング

### 12.3 スケーラビリティ対応
- **マイクロサービス化**: 機能別のサービス分離
- **キャッシュ最適化**: CDN導入、クエリ最適化
- **グローバル対応**: 多言語対応、タイムゾーン対応