'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleBookmarkAction(postId: string): Promise<{
    success: boolean;
    isBookmarked: boolean;
    error?: string;
}> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, isBookmarked: false, error: "ログインしていません" };
    }

    try {
        const existing = await prisma.bookmark.findUnique({
            where: {
                userId_postId: { userId, postId },
            },
        });

        if (existing) {
            await prisma.bookmark.delete({
                where: {
                    userId_postId: { userId, postId },
                },
            });
            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: false };
        } else {
            await prisma.bookmark.create({
                data: { userId, postId },
            });
            revalidatePath('/bookmarks');
            return { success: true, isBookmarked: true };
        }
    } catch (error) {
        console.error("Bookmark toggle error:", error);
        return { success: false, isBookmarked: false, error: "ブックマークの更新に失敗しました" };
    }
}
