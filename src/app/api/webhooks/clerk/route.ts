import { prisma } from '@/lib/prisma'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt.data
        const eventType = evt.type
        if (eventType === 'user.created') {
            try {
                const { id, username, image_url, email_addresses } = evt.data;
                const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";

                await prisma.user.create({
                    data: {
                        id: id as string,
                        userName: username as string,
                        userImage: image_url as string,
                        email: email,
                    }
                })
                return new Response("ユーザーの作成に成功しました。", { status: 200 })
            } catch (err) {
                console.log(err);
                return new Response("ユーザーの作成に失敗しました。", { status: 500 })
            }
        }
        if (eventType === 'user.updated') {
            try {
                const { id, username, image_url, email_addresses } = evt.data;
                const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : "";

                await prisma.user.update({
                    where: {
                        id: id as string,
                    },
                    data: {
                        userName: username as string,
                        userImage: image_url as string,
                        email: email,
                    }
                })
                return new Response("ユーザーの更新に成功しました。", { status: 200 })
            } catch (err) {
                console.log(err);
                return new Response("ユーザーの更新に失敗しました。", { status: 500 })
            }
        }

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}