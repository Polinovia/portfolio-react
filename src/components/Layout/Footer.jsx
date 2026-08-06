// ─────────────────────────────────────────────
// Footer.jsx — Bottom bar always visible on the page
// Contains: contact links only — name/tagline already
// shown in the sidebar, no need to repeat them here.
//
// No props needed — this component is static.
// Just update the LINKS array below to personalize
// it with your real info.
// ─────────────────────────────────────────────

// All your contact/social links.
// To add a new one, add an object to this array with:
// - label: the text shown on the button
// - href:  the URL it links to
// - icon:  an SVG element
const LINKS = [
  {
    label: 'polya.bevz02@gmail.com',
    href: 'mailto:polya.bevz02@gmail.com',
    icon: (
      // Email icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <polyline points="2,4 12,13 22,4" />
      </svg>
    ),
  },
  {
    label: 'github.com/Polinovia',
    href: 'https://github.com/Polinovia',
    icon: (
      // GitHub icon
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: 'linkedin.com/in/polinabevz02',
    href: 'https://www.linkedin.com/in/polinabevz02/',
    icon: (
      // LinkedIn icon
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">

        {/* Contact links — one button per item in LINKS array */}
        <div className="footer-links">
          {LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="footer-link"
              // target="_blank" opens the link in a new browser tab
              // rel="noopener noreferrer" is a security best practice with target="_blank"
              target={link.href.startsWith('mailto') ? '_self' : '_blank'}
              rel="noopener noreferrer"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright line */}
        <div className="footer-copy">© 2025 · Crafted with care</div>

      </div>
    </footer>
  )
}