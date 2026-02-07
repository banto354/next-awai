import { BookmarksScreen } from "../../components/BookmarksScreen";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookmarkEntry } from '../types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';

export default async function BookmarksPage() {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }
    // DBから投稿を取得
    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
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

    const bookmarkedEntries: BookmarkEntry[] = bookmarks.map((bookmark) => ({
        id: bookmark.post.id,
        image: bookmark.post.imageUrl || "",
        text: bookmark.post.content,
        date: bookmark.post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
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

    return <BookmarksScreen bookmarkedEntries={bookmarkedEntries} />;
}
