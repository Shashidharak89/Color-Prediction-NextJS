// app/api/color/route.js
import { placeBet, getColors } from '@/controllers/colorController';

export async function POST(req) {
  const result = await placeBet(req);
  return new Response(JSON.stringify(result), { status: 201 });
}

export async function GET() {
  const colors = await getColors();
  return new Response(JSON.stringify(colors), { status: 200 });
}
