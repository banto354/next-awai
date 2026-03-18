'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { BookmarkEntry } from '@/types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';
import { formatDateJapanese } from '@/lib/dateUtils';

const LIMIT = 12;

export async function getBookmarkedPostsAction(offset: number = 0): Promise<{
    entries: BookmarkEntry[];
    nextOffset: number;
    hasMore: boolean;
}> {
    const { userId } = await auth();
    if (!userId) {
        return { entries: [], nextOffset: 0, hasMore: false };
    }

    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: LIMIT + 1,
        skip: offset,
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

    const hasMore = bookmarks.length > LIMIT;
    const bookmarksToReturn = hasMore ? bookmarks.slice(0, LIMIT) : bookmarks;
    const nextOffset = offset + bookmarksToReturn.length;

    const entries: BookmarkEntry[] = bookmarksToReturn.map((bookmark) => ({
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

    return { entries, nextOffset, hasMore };
}

