'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_TEXT_LENGTH = 50;
const MAX_TAG_COUNT = 5;
const MAX_TAG_LENGTH = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const postSchema = z.object({
    text: z.string()
        .min(1, "テキストは必須です")
        .max(MAX_TEXT_LENGTH, `テキストは${MAX_TEXT_LENGTH}文字以内にしてください`),
    tags: z.array(z.string().max(MAX_TAG_LENGTH, `タグは${MAX_TAG_LENGTH}文字以内にしてください`))
        .max(MAX_TAG_COUNT, `タグは${MAX_TAG_COUNT}個以内にしてください`),
});

export async function updatePostAction(prevState: any, formData: FormData) {
    // 1. 認証チェック
    const { userId } = await auth();
    if (!userId) return { success: false, error: "ログインしていません" };

    // 2. フォームデータの取得
    const postId = formData.get('postId') as string;
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tagsString = formData.get('tags') as string;
    const existingImageUrl = formData.get('existingImageUrl') as string;

    const tagNames = tagsString
        ? tagsString.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

    // 3. バリデーション
    const validatedFields = postSchema.safeParse({ text, tags: tagNames });
    if (!validatedFields.success) {
        const errorMessages = validatedFields.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
        return { success: false, error: errorMessages };
    }

    // 4. 権限確認
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true, imageUrl: true },
    });
    if (!post) return { success: false, error: "投稿が見つかりません" };
    if (post.userId !== userId) return { success: false, error: "編集権限がありません" };

    // 5. 画像処理（新しい画像がある場合のみ）
    let imageUrl = existingImageUrl;
    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > MAX_IMAGE_SIZE) {
            return { success: false, error: `画像サイズは${MAX_IMAGE_SIZE / 1024 / 1024}MB以内にしてください` };
        }
        if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
            return { success: false, error: "画像形式はJPEG、PNG、WebP、GIFのみ対応しています" };
        }

        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
            .from('post-image')
            .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false });
        if (uploadError) return { success: false, error: "画像のアップロードに失敗しました" };

        const { data: publicUrlData } = supabase.storage.from('post-image').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;

        // 旧画像を削除
        if (post.imageUrl) {
            const path = post.imageUrl.split('/post-image/').pop();
            if (path) await supabase.storage.from('post-image').remove([path]);
        }
    }

    // 6. DB更新（既存タグを削除してから再作成）
    try {
        await prisma.tagsOnPosts.deleteMany({ where: { postId } });
        await prisma.post.update({
            where: { id: postId },
            data: {
                content: text,
                imageUrl: imageUrl,
                isPublic,
                tags: {
                    create: tagNames.map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name },
                                create: { name },
                            },
                        },
                    })),
                },
            },
        });
    } catch (error) {
        console.error('更新エラー:', error);
        return { success: false, error: "投稿の更新に失敗しました" };
    }

    revalidatePath(`/entry/${postId}`);
    return { success: true, postId, error: '' };
}
