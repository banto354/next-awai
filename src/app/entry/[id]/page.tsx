import { EntryDetailFeed } from '@/components/EntryDetailFeed';
import { mockEntries } from '@/app/data/mockEntries';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Entry } from '@/app/types/entry';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  // 非同期でパラメータを取得
  const { id } = await params;

  // 存在確認（存在しないIDなら404ページへ）
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: {
      user: true,
      tags: {
        include: { tag: true },
      },
      // // 自分がブックマークしているか確認
      // bookmarkedBy: {
      //   where: { userId: userId },
      // },
    },
  });

  if (!post) {
    notFound();
  }

  const formattedEntry: Entry = {
    id: post.id,
    image: post.imageUrl || "",
    text: post.content,
    date: post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weather: "Clear", // 必要に応じてDBから取得
    temperature: post.temp ?? 0,
    tags: post.tags.map((t) => t.tag.name),
    isPublic: post.isPublic,
    latitude: post.latitude ?? 0,
    longitude: post.longitude ?? 0,
    user: {
      displayName: post.user.displayName || "Unknown",
      userImage: post.user.userImage || "",
      userName: post.user.userName,
    }
  };

  return <EntryDetailFeed entry={formattedEntry} />;
}

// 静的生成（SSG）用：あらかじめ存在するIDのページを作っておく設定
export async function generateStaticParams() {
  return mockEntries.map((entry) => ({
    id: entry.id,
  }));
}