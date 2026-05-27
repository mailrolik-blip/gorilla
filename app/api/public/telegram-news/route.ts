import { getHomepageTelegramFeed } from '@/lib/telegram-news';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await getHomepageTelegramFeed();

  return Response.json(
    {
      items,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=45, stale-while-revalidate=120',
      },
    }
  );
}
