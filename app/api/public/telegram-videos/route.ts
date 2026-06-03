import { getHomepageTelegramVideos } from '@/lib/telegram-news';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getHomepageTelegramVideos();

    return Response.json(
      {
        items,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return Response.json(
      {
        items: [],
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
        },
      }
    );
  }
}
