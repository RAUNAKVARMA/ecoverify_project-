export default function ImmersiveShell({ children, className = '' }) {
  return (
    <div className={`immersive-shell ${className}`}>
      <div className="immersive-paper" aria-hidden />
      <div className="immersive-dotgrid" aria-hidden />
      <div className="immersive-wash" aria-hidden />
      <div className="immersive-content">{children}</div>
    </div>
  )
}
