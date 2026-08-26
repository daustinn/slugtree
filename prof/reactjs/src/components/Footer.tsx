export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '1.5rem 2rem',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#6b7280'
      }}
    >
      <span>
        Slugtree &copy; {new Date().getFullYear()} — Built with MDX & React
      </span>
    </footer>
  )
}
