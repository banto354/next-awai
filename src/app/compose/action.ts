'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Supabaseクライアントの作成（管理者権限でストレージを操作するため）
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 定数定義
const MAX_TEXT_LENGTH = 50;
const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// バリデーションスキーマ
const postSchema = z.object({
    text: z.string()
        .min(1, "テキストは必須です")
        .max(MAX_TEXT_LENGTH, `テキストは${MAX_TEXT_LENGTH}文字以内にしてください`),
    tags: z.array(z.string().max(MAX_TAG_LENGTH, `タグは${MAX_TAG_LENGTH}文字以内にしてください`))
        .max(MAX_TAG_COUNT, `タグは${MAX_TAG_COUNT}個以内にしてください`),
});

export async function addPostAction(prevState: any, formData: FormData) {
    // 1. 認証チェック
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "ログインしていません" };
    }

    // 2. フォームデータの取得
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tagsString = formData.get('tags') as string;
    const latStr = formData.get('latitude') as string;
    const lngStr = formData.get('longitude') as string;
    const latitude = Number(latStr) || 0;
    const longitude = Number(lngStr) || 0;
    const weatherId = formData.get('weatherId') as string;
    const temp = formData.get('temp') as string;

    // タグの処理（カンマ区切りを配列にして整形）
    const tagNames = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

    // 3. バリデーション（画像アップロード前に実行）
    const validatedFields = postSchema.safeParse({
        text: text,
        tags: tagNames,
    });

    if (!validatedFields.success) {
        const errorMessages = validatedFields.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
        console.log('バリデーションエラー:', errorMessages);
        return { success: false, error: errorMessages };
    }

    // 4. 画像バリデーション
    if (!imageFile || imageFile.size === 0) {
        return { success: false, error: "画像を選択してください" };
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
        return { success: false, error: `画像サイズは${MAX_IMAGE_SIZE / 1024 / 1024}MB以内にしてください` };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return { success: false, error: "画像形式はJPEG、PNG、WebP、GIFのみ対応しています" };
    }

    // 5. 画像のアップロード処理
    let imageUrl: string | null = null;
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage
        .from('post-image')
        .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: false,
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { success: false, error: "画像のアップロードに失敗しました" };
    }

    // 公開URLを取得
    const { data: publicUrlData } = supabase.storage
        .from('post-image')
        .getPublicUrl(fileName);

    imageUrl = publicUrlData.publicUrl;

    // 6. データベースへの保存
    try {
        await prisma.post.create({
            data: {
                userId: userId,
                content: text,
                imageUrl: imageUrl,
                isPublic: isPublic,
                latitude: latitude || 0,
                longitude: longitude || 0,
                temp: Number(temp) || null,
                weatherId: Number(weatherId) || null,
                tags: {
                    create: tagNames.map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name: name },
                                create: { name: name },
                            },
                        },
                    })),
                },
            },
        });
    } catch (error) {
        console.error('データベースエラー:', error);
        return { success: false, error: "投稿の保存に失敗しました" };
    }

    // 7. 完了後の処理
    revalidatePath('/');
    redirect('/archive');
}

export async function deletePostAction(postId: string, imageUrl: string | null) {
    //認証チェック
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "ログインしていません" };
    }

    try {
        // 削除権限の確認 (自分の投稿かどうか)
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true },
        });

        if (!post) {
            return { success: false, error: "投稿が見つかりません" };
        }

        if (post.userId !== userId) {
            return { success: false, error: "削除権限がありません" };
        }

        // 画像があればSupabaseからも削除 (オプションだが推奨)
        if (imageUrl) {
            // URLからファイルパスを抽出 (例: .../post-image/user123/abc.jpg -> user123/abc.jpg)
            const path = imageUrl.split('/post-image/').pop();
            if (path) {
                await supabase.storage
                    .from('post-image')
                    .remove([path]);
            }
        }

        // DBから削除
        await prisma.post.delete({
            where: { id: postId },
        });

    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "削除に失敗しました" };
    }

    // 5. リダイレクト (削除後は一覧ページへ)
    revalidatePath('/'); // キャッシュクリア
    redirect('/archive'); // アーカイブへ
}