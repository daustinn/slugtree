import { ReactNode } from 'react'
import ClientProvider from './client-provider.js'
import tree from './generated/tree.js'
import nodes from './generated/nodes.js'
import basePath from './generated/meta.js'

interface ServerProviderProps {
  children: ReactNode
}

export default function ServerProvider({ children }: ServerProviderProps) {
  return (
    <ClientProvider slot={{ tree, nodes, basePath }}>{children}</ClientProvider>
  )
}
