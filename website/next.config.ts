import type { NextConfig } from 'next'
import { withSlugtree } from 'slugtree/next'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx']
}

export default withSlugtree(nextConfig)
