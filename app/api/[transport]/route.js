import { createMcpHandler } from 'mcp-handler';
import { timingSafeEqual } from 'node:crypto';
import registerTools from '@/lib/mcpTools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// কানেক্টর URL: https://আপনার-সাইট/api/mcp?key=MCP_SECRET
const handler = createMcpHandler(
  (server) => registerTools(server),
  {},
  { basePath: '/api', maxDuration: 60, verboseLogs: false, disableSse: true }
);

function authorized(req) {
  const secret = process.env.MCP_SECRET || '';
  if (secret.length < 24) return false; // দুর্বল/ফাঁকা সিক্রেট হলে কিছুই চলবে না
  const url = new URL(req.url);
  const given = url.searchParams.get('key') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function secured(req) {
  if (!authorized(req)) return new Response('Unauthorized', { status: 401 });
  return handler(req);
}

export { secured as GET, secured as POST, secured as DELETE };
