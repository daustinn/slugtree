import type { APIRoute } from 'astro'
import { getNodeData, getSlugs } from 'slugtree'

export function getStaticPaths() {
  return getSlugs().map((slug) => ({
    params: {
      slug: Array.isArray(slug)
        ? slug.length === 0
          ? undefined
          : slug.join('/')
        : slug
    },
    props: {
      slug
    }
  }))
}

export const GET: APIRoute = ({ props }) => {
  const nodeData = getNodeData(props.slug)

  if (!nodeData) return new Response('Not found', { status: 404 })

  return new Response(nodeData.rawContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
