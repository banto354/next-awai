'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { ArchiveEntry } from '@/types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';
import { formatDateJapanese } from '@/lib/dateUtils';

const LIMIT = 12;

export async function getArchivePostsAction(cursor: string | null = null): Promise<{
    entries: ArchiveEntry[];
    nextCursor: string | null;
    hasMore: boolean;
}> {
    const { userId } = await auth();
    if (!userId) {
        return { entries: [], nextCursor: null, hasMore: false };
    }

    const posts = await prisma.post.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: LIMIT + 1, // 1件多く取得してhasMoreを判定
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
            bookmarkedBy: {
                where: { userId },
            },
        },
    });

    const hasMore = posts.length > LIMIT;
    const postsToReturn = hasMore ? posts.slice(0, LIMIT) : posts;
    const nextCursor = postsToReturn.length > 0 ? postsToReturn[postsToReturn.length - 1].id : null;

    const entries: ArchiveEntry[] = postsToReturn.map((post) => ({
        id: post.id,
        image: post.imageUrl || "",
        text: post.content,
        date: formatDateJapanese(post.createdAt),
        weather: post.weatherId ? getWeatherLabel(post.weatherId) : "天気不明",
        weatherId: post.weatherId ?? 0,
        temperature: Math.round(post.temp ?? 0),
        tags: post.tags.map((t) => t.tag.name),
        isPublic: post.isPublic,
        latitude: post.latitude ?? 0,
        longitude: post.longitude ?? 0,
        isBookmarked: post.bookmarkedBy.length > 0,
    }));

    return { entries, nextCursor, hasMore };
}
