import { createOrJoinRound, getRounds } from '@/controllers/colorController';

export async function POST(req) {
  try {
    const updatedRound = await createOrJoinRound(req);
    return new Response(JSON.stringify(updatedRound), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to bet' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const rounds = await getRounds();
    return new Response(JSON.stringify(rounds), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
  }
}
