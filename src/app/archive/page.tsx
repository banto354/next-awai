import { prisma } from "@/lib/prisma";
import { ArchiveScreen } from "../../components/ArchiveScreen";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Entry } from "../types/entry";


export default async function ArchivePage() {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
        redirect('/sign-in');
    }
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
        },
    });
    const formattedEntries: Entry[] = posts.map((post) => ({
        id: post.id,
        image: post.imageUrl || "", // nullの場合は空文字などでフォールバック
        text: post.content,
        date: post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }), // "Jan 11" のような形式に
        weather: "Clear", // ※DBにweatherカラムがない場合、一旦固定値か、別途取得ロジックが必要
        temperature: post.temp ?? 0, // nullの場合は0
        tags: post.tags.map((t) => t.tag.name), // タグオブジェクトから名前の配列へ
        isPublic: post.isPublic,
        isBookmarked: false, // ※ブックマーク判定ロジックが必要なら別途実装
        latitude: post.latitude ?? 0,
        longitude: post.longitude ?? 0,
    }));

    return <ArchiveScreen initialEntries={formattedEntries} />;
}
