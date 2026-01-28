import { EntryDetailFeed } from '@/components/EntryDetailFeed';
import { mockEntries } from '@/app/data/mockEntries';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  // 非同期でパラメータを取得
  const { id } = await params;

  // 存在確認（存在しないIDなら404ページへ）
  const entryExists = mockEntries.some(entry => entry.id === id);
  if (!entryExists) {
    notFound();
  }

  return <EntryDetailFeed initialEntryId={id} />;
}

// 静的生成（SSG）用：あらかじめ存在するIDのページを作っておく設定
export async function generateStaticParams() {
  return mockEntries.map((entry) => ({
    id: entry.id,
  }));
}