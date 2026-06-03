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
          'Cache-Control': 'public, max-age=45, stale-while-revalidate=120',
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
          'Cache-Control': 'public, max-age=20, stale-while-revalidate=60',
        },
      }
    );
  }
}
