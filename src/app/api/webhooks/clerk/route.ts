import { prisma } from '@/lib/prisma'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)
        // Do something with payload
        // For this guide, log payload to console
        const eventType = evt.type

        if (eventType === 'user.created' || eventType === 'user.updated') {
            try {
                const { id, username, image_url, email_addresses, first_name, last_name } = evt.data;
                const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";
                const displayName = `${first_name || ''}${last_name || ''}` || username || `user_${id}`;
                // create と update を統合
                await prisma.user.upsert({
                    where: {
                        id: id as string,
                    },
                    update: {
                        userName: username || `user_${id}` as string,
                        displayName: displayName,
                        userImage: image_url as string,
                        email: email,
                    },
                    create: {
                        id: id as string,
                        userName: username || `user_${id}` as string,
                        displayName: displayName,
                        userImage: image_url as string,
                        email: email,
                    }
                })

                return new Response("ユーザー情報の同期に成功しました。", { status: 200 })

            } catch (err) {
                console.error('DB操作エラー:', err);
                return new Response("DB処理に失敗しました", { status: 500 })
            }
        }
        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}