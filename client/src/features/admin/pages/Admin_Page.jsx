// Admin_Page.jsx — Shared layout wrapper cho tất cả trang Admin

import "../styles/Admin_Page.css";

function AdminPage({ title, actions, children }) {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">{title}</h1>
        
        {actions && (
          <div className="admin-page__actions">{actions}</div>
        )}
      </div>
      <div className="admin-page__body">{children}</div>
    </div>
  );
}

export default AdminPage;