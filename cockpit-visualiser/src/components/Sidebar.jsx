import './Sidebar.css'

export default function Sidebar({ views, active, onChange, total }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-title">Cockpit DSG</p>
        <p className="sidebar-sub">{total} response{total !== 1 ? 's' : ''}</p>
      </div>
      <ul className="sidebar-nav">
        {views.map(v => (
          <li key={v.id}>
            <button
              className={`sidebar-btn ${active === v.id ? 'sidebar-active' : ''}`}
              onClick={() => onChange(v.id)}
            >
              {v.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
