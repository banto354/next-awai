import { prisma } from "@/lib/prisma";
import { ArchiveScreen } from "../../components/ArchiveScreen";
import { auth } from "@clerk/nextjs/server";
import { ArchiveEntry } from "../types/entry";
import { getWeatherLabel } from "@/lib/weatherUtils";
import { formatDateJapanese } from "@/lib/dateUtils";

const INITIAL_LIMIT = 12;

export default async function ArchivePage() {
    // 認証はmiddlewareで処理済み。userIdはDB検索に使用
    const { userId } = await auth();

    // TypeScriptの型チェック用（Middlewareで認証済みのため実行時にはnullにならない）
    if (!userId) {
        return <ArchiveScreen initialEntries={[]} initialCursor={null} initialHasMore={false} />;
    }

    // DBから投稿を取得（初回は10件+1で次があるか判定）
    const posts = await prisma.post.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: INITIAL_LIMIT + 1,
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

    const hasMore = posts.length > INITIAL_LIMIT;
    const postsToReturn = hasMore ? posts.slice(0, INITIAL_LIMIT) : posts;
    const nextCursor = postsToReturn.length > 0 ? postsToReturn[postsToReturn.length - 1].id : null;

    const formattedEntries: ArchiveEntry[] = postsToReturn.map((post) => ({
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

    return <ArchiveScreen initialEntries={formattedEntries} initialCursor={nextCursor} initialHasMore={hasMore} />;
}
