import { prisma } from "@/lib/prisma";
import { ArchiveScreen } from "../../components/ArchiveScreen";
import { auth } from "@clerk/nextjs/server";
import { ArchiveEntry } from "../types/entry";
import { getWeatherLabel } from "@/lib/weatherUtils";
import { formatDateJapanese } from "@/lib/dateUtils";

export default async function ArchivePage() {
    // 認証はmiddlewareで処理済み。userIdはDB検索に使用
    const { userId } = await auth();
    // DBから投稿を取得
    const posts = await prisma.post.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
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
    const formattedEntries: ArchiveEntry[] = posts.map((post) => ({
        id: post.id,
        image: post.imageUrl || "", // nullの場合は空文字などでフォールバック
        text: post.content,
        date: formatDateJapanese(post.createdAt),
        weather: post.weatherId ? getWeatherLabel(post.weatherId) : "天気不明",
        weatherId: post.weatherId ?? 0,
        temperature: Math.round(post.temp ?? 0), // nullの場合は0
        tags: post.tags.map((t) => t.tag.name), // タグオブジェクトから名前の配列へ
        isPublic: post.isPublic,
        latitude: post.latitude ?? 0,
        longitude: post.longitude ?? 0,
        isBookmarked: post.bookmarkedBy.length > 0,
    }));

    return <ArchiveScreen initialEntries={formattedEntries} />;
}
