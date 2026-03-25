import { BookmarksScreen } from "@/components/screens/BookmarksScreen";
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { BookmarkEntry } from '@/types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';
import { formatDateJapanese } from '@/lib/dateUtils';

const INITIAL_LIMIT = 12;

export default async function BookmarksPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag: initialTag } = await searchParams;
    // 認証はmiddlewareで処理済み。userIdはDB検索に使用
    const { userId } = await auth();

    // TypeScriptの型チェック用（Middlewareで認証済みのため実行時にはnullにならない）
    if (!userId) {
        return <BookmarksScreen bookmarkedEntries={[]} initialOffset={0} initialHasMore={false} initialTag={initialTag} />;
    }

    // DBから投稿を取得（初回は10件+1で次があるか判定）
    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: INITIAL_LIMIT + 1,
        include: {
            post: {
                include: {
                    user: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            },
        },
    });

    const hasMore = bookmarks.length > INITIAL_LIMIT;
    const bookmarksToReturn = hasMore ? bookmarks.slice(0, INITIAL_LIMIT) : bookmarks;

    const bookmarkedEntries: BookmarkEntry[] = bookmarksToReturn.map((bookmark) => ({
        id: bookmark.post.id,
        image: bookmark.post.imageUrl || "",
        text: bookmark.post.content,
        date: formatDateJapanese(bookmark.post.createdAt),
        weatherId: bookmark.post.weatherId ?? 0,
        weather: bookmark.post.weatherId ? getWeatherLabel(bookmark.post.weatherId) : "天気不明",
        temperature: Math.round(bookmark.post.temp ?? 0),
        tags: bookmark.post.tags.map((t) => t.tag.name),
        isPublic: bookmark.post.isPublic,
        isBookmarked: true,
        latitude: bookmark.post.latitude ?? 0,
        longitude: bookmark.post.longitude ?? 0,
        user: {
            userName: bookmark.post.user.userName,
            displayName: bookmark.post.user.displayName || bookmark.post.user.userName,
            userImage: bookmark.post.user.userImage || "",
        },
    }));

    return <BookmarksScreen bookmarkedEntries={bookmarkedEntries} initialOffset={bookmarksToReturn.length} initialHasMore={hasMore} initialTag={initialTag} />;
}

