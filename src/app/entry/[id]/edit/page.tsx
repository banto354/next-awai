import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { EditScreen } from '@/components/screens/EditScreen';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  // 本人以外はアクセス不可
  if (post.userId !== userId) redirect(`/entry/${id}`);

  return (
    <EditScreen
      postId={post.id}
      initialText={post.content}
      initialTags={post.tags.map((t) => t.tag.name)}
      initialIsPublic={post.isPublic}
      initialImageUrl={post.imageUrl ?? ''}
    />
  );
}
