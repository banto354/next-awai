import { BookmarksScreen } from "../../components/BookmarksScreen";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Entry } from '../types/entry';

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
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        },
    },
});

console.log("userId", userId);
console.log("bookmarks", bookmarks);

const bookmarkedEntries: Entry[] = bookmarks.map((bookmark) => ({
    id: bookmark.post.id,
    image: bookmark.post.imageUrl || "",
    text: bookmark.post.content,
    date: bookmark.post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weather: "Clear", // 必要に応じてDBから取得
    temperature: bookmark.post.temp ?? 0,
    tags: bookmark.post.tags.map((t) => t.tag.name),
    isPublic: bookmark.post.isPublic,
    isBookmarked: true, // ブックマークページなので true
    latitude: bookmark.post.latitude ?? 0,
    longitude: bookmark.post.longitude ?? 0,
}));

export default function BookmarksPage() {
    return <BookmarksScreen bookmarkedEntries={bookmarkedEntries} />;
}
