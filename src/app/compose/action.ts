'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
// import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Supabaseクライアントの作成（管理者権限でストレージを操作するため）
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export async function addPostAction(formData: FormData) {
    // 1. 認証チェック
    const { userId } = await auth();
    if (!userId) {
        throw new Error("ログインしていません");
    }
    console.log('フォームデータ');
    // 2. フォームデータの取得
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tagsString = formData.get('tags') as string;
    // ※位置情報（後述の修正が必要）
    const latStr = formData.get('latitude') as string;
    const lngStr = formData.get('longitude') as string;
    // 3. 画像のアップロード処理
    let imageUrl: string | null = null;

    // if (imageFile && imageFile.size > 0) {
    //     // ファイル名をユニークにする (例: user_id/timestamp-random.png)
    //     const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`;

    //     const { data, error } = await supabase.storage
    //         .from('awai-posts') // ★Supabaseでこのバケットを作成しておく必要があります
    //         .upload(fileName, imageFile, {
    //             contentType: imageFile.type,
    //             upsert: false,
    //         });

    //     if (error) {
    //         console.error('Upload Error:', error);
    //         throw new Error("画像のアップロードに失敗しました");
    //     }

    //     // 公開URLを取得
    //     const { data: publicUrlData } = supabase.storage
    //         .from('awai-posts')
    //         .getPublicUrl(fileName);

    //     imageUrl = publicUrlData.publicUrl;
    // }

    // 4. タグの処理（カンマ区切りを配列にして整形）
    const tagNames = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0); // 空文字を除去

    // 5. データベースへの保存
    try {
        console.log('データベースへの保存');
        await prisma.post.create({
            data: {
                userId: userId,
                content: text,
                imageUrl: imageUrl,
                isPublic: isPublic,
                // 位置情報: 数値に変換。取得できていない場合は一旦 0 などを入れるかエラーにする
                latitude: parseFloat(latStr) || 0,
                longitude: parseFloat(lngStr) || 0,
                placeName: "Unknown", // 一旦仮置き（必要なら逆ジオコーディングで取得）

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
        console.error('データベースエラー:', error);
        throw new Error("投稿の保存に失敗しました");
    }

    // 6. 完了後の処理
    revalidatePath('/'); // タイムライン等を更新
    redirect('/'); // トップページへ戻る
}