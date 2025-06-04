import { createColor, getColors } from '@/controllers/colorController';

export async function POST(req) {
  try {
    const color = await createColor(req);
    return new Response(JSON.stringify(color), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create color' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const colors = await getColors();
    return new Response(JSON.stringify(colors), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch colors' }), { status: 500 });
  }
}
