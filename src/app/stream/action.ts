// src/app/stream/action.ts

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { StreamEntry } from '@/app/types/entry';
import { getWeatherLabel } from '@/lib/weatherUtils';
import { Prisma } from '@prisma/client';

// 取得する投稿数
const LIMIT = 10;

export async function getStreamPostsAction(
    latitude?: number,
    longitude?: number
): Promise<StreamEntry[]> {
    const { userId } = await auth();

    // 基本的なWHERE条件（公開済み かつ 自分の投稿以外）
    let posts: any[];

    try {
        // --- 位置情報がある場合：距離を考慮したランダム取得 ---
        // PostGISを使わない簡易的な距離計算（三平方の定理の近似）とランダムソート
        // ORDER BY (距離係数 * 距離) + (ランダム係数 * RANDOM()) のようなイメージ
        const commonSelect = Prisma.sql`
          p.id,
          p.content,
          p.image_url,
          p.created_at,
          p.weather_id,
          p.temp,
          p.latitude,
          p.longitude,
          u."userName",
          u."display_name",
          u."user_image",
          (
            SELECT COALESCE(JSON_AGG(t.name), '[]')
            FROM "tags" t
            JOIN "post_tags" pt ON t.id = pt.tag_id
            WHERE pt.post_id = p.id
          ) AS tags_json,
          EXISTS (
            SELECT 1 FROM "bookmarks" b
            WHERE b.post_id = p.id AND b.user_id = ${userId ?? ''}
          ) AS is_bookmarked
             `;

        //   -- 簡易距離計算 
        if (latitude && longitude) {
            posts = await prisma.$queryRaw`
        SELECT 
          ${commonSelect},
          (POWER(p.latitude - ${latitude}, 2) + POWER(p.longitude - ${longitude}, 2)) as distance_score
        FROM "posts" p
        JOIN "users" u ON p.user_id = u.id
        WHERE p.is_public = true
          AND p.user_id != ${userId ?? ''} -- ログインしていれば自分のを除外
        ORDER BY 
          -- 距離とランダムのハイブリッドソート
          -- 距離スコア(小さいほど近い) + ランダム値(0~1) * 重み
          -- 重みを大きくするとランダム性が増し、小さくすると近さ優先
          (POWER(p.latitude - ${latitude}, 2) + POWER(p.longitude - ${longitude}, 2)) * 1000 + RANDOM() * 5
        LIMIT ${LIMIT};
      `;
        } else {
            // --- 位置情報がない場合：純粋なランダム ---
            posts = await prisma.$queryRaw`
        SELECT 
          ${commonSelect}
        FROM "posts" p
        JOIN "users" u ON p.user_id = u.id
        WHERE p.is_public = true
          AND p.user_id != ${userId ?? ''}
        ORDER BY RANDOM()
        LIMIT ${LIMIT};
      `;
        }
        console.log(posts);
        // 取得した生データを整形して返す
        return posts.map((post: any) => ({
            id: post.id,
            image: post.image_url || '',
            text: post.content,
            date: new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            weather: getWeatherLabel(post.weather_id),
            weatherId: post.weather_id,
            temperature: post.temp,
            tags: post.tags_json || [],
            isPublic: true,
            latitude: post.latitude,
            longitude: post.longitude,
            isBookmarked: post.is_bookmarked ?? false,
            user: {
                userName: post.userName,
                displayName: post.display_name || post.userName,
                userImage: post.user_image || '',
            }
        }));

    } catch (error) {
        console.error("Stream fetch error:", error);
        return [];
    }
}