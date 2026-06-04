import { NextRequest } from 'next/server'
import { searchContent } from 'slugtree'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q') || ''
  const result = searchContent(q)
  return Response.json(result.slice(0, 10))
}
