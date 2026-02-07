import { EntryDetailFeed } from '@/components/EntryDetailFeed';
import { mockEntries } from '@/app/data/mockEntries';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Entry } from '@/app/types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';
import { auth } from '@clerk/nextjs/server';
import { formatDateTimeJapanese } from '@/lib/dateUtils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  // 非同期でパラメータを取得
  const { id } = await params;
  const { userId: currentUserID } = await auth();

  // 存在確認（存在しないIDなら404ページへ）
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: {
      user: true,
      tags: {
        include: { tag: true },
      },
      bookmarkedBy: {
        where: { userId: currentUserID ?? '' },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const isAuthor = currentUserID === post.userId;

  const formattedEntry: Entry = {
    id: post.id,
    image: post.imageUrl || "",
    text: post.content,
    date: formatDateTimeJapanese(post.createdAt),
    weatherId: post.weatherId ?? 0,
    weather: getWeatherLabel(post.weatherId),
    temperature: Math.round(post.temp ?? 0),
    tags: post.tags.map((t) => t.tag.name),
    isPublic: post.isPublic,
    latitude: post.latitude ?? 0,
    longitude: post.longitude ?? 0,
    isBookmarked: post.bookmarkedBy.length > 0,
    user: {
      displayName: post.user.displayName || "Unknown",
      userImage: post.user.userImage || "",
      userName: post.user.userName,
    }
  };

  return <EntryDetailFeed
    entry={formattedEntry}
    isAuthor={isAuthor} />;
}

// 静的生成（SSG）用：あらかじめ存在するIDのページを作っておく設定
export async function generateStaticParams() {
  return mockEntries.map((entry) => ({
    id: entry.id,
  }));
}