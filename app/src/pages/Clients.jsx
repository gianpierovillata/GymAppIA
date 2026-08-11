import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
}

const formatDate = (value) => value?.slice(0, 10) ?? '—'

const initials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

export default function Clients() {
  const [clients, setClients] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const loadClients = async () => {
    setError(null)
    setClients(null)
    try {
      setClients(await apiGet('/clients'))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => {
    if (!clients) return []
    const term = search.trim().toLowerCase()
    if (!term) return clients
    return clients.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone ?? ''}`
        .toLowerCase()
        .includes(term),
    )
  }, [clients, search])

  const handleSaved = (message) => {
    setModal(null)
    setToast({ type: 'success', message })
    loadClients()
  }

  const handleDelete = async () => {
    try {
      await apiDelete(`/clients/${deleteTarget.id}`)
      setDeleteTarget(null)
      setToast({ type: 'success', message: `Cliente "${deleteTarget.firstName} ${deleteTarget.lastName}" eliminado.` })
      loadClients()
    } catch (err) {
      setDeleteTarget(null)
      setToast({ type: 'error', message: err.message })
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>Datos de contacto, membresías y planes asignados.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          <PlusIcon />
          Nuevo cliente
        </button>
      </div>

      {error && (
        <div className="banner warning">
          <p>No se pudo cargar la lista: {error}</p>
          <button className="btn btn-ghost" onClick={loadClients}>
            Reintentar
          </button>
        </div>
      )}

      {clients === null && !error && (
        <div className="card">
          <p className="empty-state">Cargando clientes...</p>
        </div>
      )}

      {clients && (
        <div className="card">
          <div className="toolbar">
            <div className="search-box">
              <SearchIcon />
              <input
                type="search"
                className="input"
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="table-count">
              {filtered.length} de {clients.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-state">
              {search ? `No hay resultados para "${search}".` : 'No hay clientes registrados.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Nacimiento</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className={c.isActive ? '' : 'row-inactive'}>
                      <td>
                        <div className="cell-client">
                          <span className="avatar">{initials(c.firstName, c.lastName)}</span>
                          <div>
                            <div className="cell-name">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="cell-muted">
                              Creado {new Date(c.createdAt).toLocaleDateString('es-AR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{formatDate(c.birthDate)}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'green' : 'amber'}`}>
                          {c.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setModal({ mode: 'edit', client: c })}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <ClientFormModal
          mode={modal.mode}
          client={modal.client}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar cliente</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que querés eliminar a{' '}
                <strong>
                  {deleteTarget.firstName} {deleteTarget.lastName}
                </strong>
                ? Esta acción desactiva su cuenta (soft-delete).
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <TrashIcon />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckIcon /> : <AlertIcon />}
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  )
}

function ClientFormModal({ mode, client, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone ?? '',
          birthDate: client.birthDate ?? '',
          address: client.address ?? '',
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      birthDate: form.birthDate || null,
      address: form.address.trim() || null,
    }

    try {
      if (isEdit) {
        await apiPut(`/clients/${client.id}`, payload)
        onSaved('Cliente actualizado correctamente.')
      } else {
        await apiPost('/clients', payload)
        onSaved('Cliente creado correctamente.')
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            <button type="button" className="icon-btn" onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="banner warning">
                <p>{error}</p>
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="firstName">Nombre *</label>
                <input
                  id="firstName"
                  className="input"
                  value={form.firstName}
                  onChange={setField('firstName')}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-field">
                <label htmlFor="lastName">Apellido *</label>
                <input
                  id="lastName"
                  className="input"
                  value={form.lastName}
                  onChange={setField('lastName')}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={setField('email')}
                  required
                  maxLength={150}
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  className="input"
                  value={form.phone}
                  onChange={setField('phone')}
                  maxLength={30}
                  placeholder="555-0000"
                />
              </div>

              <div className="form-field">
                <label htmlFor="birthDate">Fecha de nacimiento</label>
                <input
                  id="birthDate"
                  type="date"
                  className="input"
                  value={form.birthDate}
                  onChange={setField('birthDate')}
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="address">Dirección</label>
                <input
                  id="address"
                  className="input"
                  value={form.address}
                  onChange={setField('address')}
                  maxLength={250}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
