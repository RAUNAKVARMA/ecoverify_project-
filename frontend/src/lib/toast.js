/** Lightweight global toast — no React context required. */
export function showToast(message) {
  if (typeof document === 'undefined') return
  const existing = document.querySelector('.app-toast')
  if (existing) existing.remove()

  const el = document.createElement('div')
  el.className = 'app-toast'
  el.setAttribute('role', 'status')
  el.textContent = message
  document.body.appendChild(el)
  requestAnimationFrame(() => el.classList.add('is-in'))
  window.setTimeout(() => {
    el.classList.remove('is-in')
    window.setTimeout(() => el.remove(), 280)
  }, 2300)
}
