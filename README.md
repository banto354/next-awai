# AWAI (Next.js Location-based SNS)

「AWAI」は、位置情報と季節（天気・気温）を共有するライフログ/SNSアプリケーションです。「何気ない瞬間を、淡く残す」をコンセプトに、フォロー/フォロワー関係ではなく、物理的な距離と偶然性によって投稿と出会う体験を提供します。

## 📖 概要

Next.js App Router と Server Actions を全面的に採用し、APIレスなアーキテクチャで構築されています。位置情報に基づいた独自のコンテンツ配信アルゴリズムと、洗練されたUI/UXが特徴です。

## 🛠 技術スタック

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: shadcn/ui (Radix UI based)
- **Image Handling**: react-easy-crop
- **Icons**: Lucide React

### Backend / Infrastructure
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Clerk](https://clerk.com/)
- **Deployment**: Vercel (Recommended)

## ✨ 主な機能と技術的特徴

### 1. Stream (独自のタイムライン)
現在地に近い投稿を優先しつつ、ランダムな要素を取り入れたタイムラインを表示します。
- **実装詳細**: Prisma の `$queryRaw` を使用し、データベースレベルで「距離スコア」と「ランダム係数」を掛け合わせたソート処理を高速に実行しています。

### 2. 投稿 (Compose)
- **画像処理**: アップロードされた画像を、アプリの世界観に合わせて **16:10** の比率にクライアントサイドでクロップします。
- **メタデータ**: 投稿時に Geolocation API から位置情報を取得し、同時に OpenWeatherMap API を経由して現地の天気と気温を自動記録します。

### 3. アーカイブ & ブックマーク
- **Archive**: 自分の過去の投稿（ライフログ）を一覧表示します。
- **Bookmarks**: 気に入った他者の投稿を保存・管理できます。

📂 ディレクトリ構成
src/app: Next.js App Router のページコンポーネントと Server Actions

stream: タイムライン表示機能とロジック (action.ts)

compose: 投稿作成機能

api: Route Handlers (Weather API, Webhooks)

src/components: UIコンポーネント (shadcn/ui含む)

src/lib: ユーティリティ関数、DBクライアント、外部API連携

prisma: データベーススキーマとマイグレーションファイル
