import { useEffect, useState } from 'react'
import { getInvite } from '../api/index.js'

// "Add Waffle to a server" link. The link is fetched ahead of time so it opens
// as a normal link (browsers can block pop-ups that open after a wait).
export default function InviteButton({ quiet = false, className = '', children = 'Add Waffle to a server' }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let current = true
    getInvite()
      .then((r) => { if (current) setUrl(r.data.url) })
      .catch(() => { /* the button just stays disabled until the API answers */ })
    return () => { current = false }
  }, [])

  const classes = `w-btn ${quiet ? 'w-btn-quiet' : ''} ${className}`

  if (!url) {
    return (
      <button type="button" className={classes} disabled title="Waffle is still starting...">
        {children}
      </button>
    )
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className={classes}>
      {children}
    </a>
  )
}
