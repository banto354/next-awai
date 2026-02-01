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

export async function addPostAction(prevState: any, formData: FormData) {
    // 認証チェック
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "ログインしていません" };
    }
    console.log('フォームデータ');
    // フォームデータの取得
    const text = formData.get('text') as string;
    console.log('text', text);
    const imageFile = formData.get('image') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tagsString = formData.get('tags') as string;
    console.log('tagsString', tagsString);
    // 位置情報（後述の修正が必要）
    const latStr = formData.get('latitude') as string;
    const lngStr = formData.get('longitude') as string;
    // 画像のアップロード処理
    let imageUrl: string | null = null;
    // バリデーション
    console.log('バリデーション');
    const schema = z.object({
        text: z.string().min(1, "テキストは必須です"),
        tags: z.string(),
        // latitude: z.string(),
        // longitude: z.string(),
    });

    if (imageFile && imageFile.size > 0) {
        // ファイル名をユニークにする (例: user_id/timestamp-random.png)
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;

        const { data, error } = await supabase.storage
            .from('post-image') // ★Supabase内のバケット名
            .upload(fileName, imageFile, {
                contentType: imageFile.type,
                upsert: false,
            });
        console.log('画像のアップロード');
        if (error) {
            console.error('Upload Error:', error);
            return { success: false, error: "画像のアップロードに失敗しました" };
        }

        // 公開URLを取得
        const { data: publicUrlData } = supabase.storage
            .from('post-image')
            .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;

        // タグの処理（カンマ区切りを配列にして整形）
        const tagNames = tagsString
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0); // 空文字を除去
        console.log('タグの処理');

        const validatedFields = schema.safeParse({
            text: text,
            tags: tagsString,
        });

        if (!validatedFields.success) {
            console.log('バリデーションエラー', validatedFields.error);
            return { success: false, error: "入力内容に誤りがあります" };
        }
        // データベースへの保存
        try {
            console.log('データベースへの保存');
            console.log('タグの配列');
            console.log(tagNames);
            await prisma.post.create({
                data: {
                    userId: userId,
                    content: text,
                    imageUrl: imageUrl,
                    isPublic: isPublic,
                    // 位置情報: 数値に変換。取得できていない場合は一旦 0 などを入れるかエラーにする
                    latitude: parseFloat(latStr) || 0,
                    longitude: parseFloat(lngStr) || 0,
                    // タグのリレーション保存
                    tags: {
                        create: tagNames.map((name) => ({
                            tag: {
                                connectOrCreate: {
                                    where: { name: name }, // 既にタグがあれば接続
                                    create: { name: name }, // なければ新規作成
                                },
                            },
                        })),
                    },
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('バリデーションエラー:', error);
                return { success: false, error: "入力内容に誤りがあります" };
            } else if (error instanceof Error) {
                console.error('データベースエラー:', error);
                return { success: false, error: "投稿の保存に失敗しました" };
            } else {
                console.error('予期せぬエラー:', error);
                return { success: false, error: "予期せぬエラーが発生しました" };
            }
        }
    } else {
        console.log('画像を選択してください');
        return { success: false, error: "画像を選択してください" };
    }
    // 　完了後の処理
    revalidatePath('/'); // タイムライン等を更新    
    redirect('/archive'); // トップページへ戻る
}