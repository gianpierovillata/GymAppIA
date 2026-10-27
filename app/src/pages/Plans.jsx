import { useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client.js'

const STATUS_LABELS = {
  Active: 'Activo',
  Expired: 'Expirado',
  Cancelled: 'Cancelado',
}

const STATUS_BADGES = {
  Active: 'green',
  Expired: 'amber',
  Cancelled: 'indigo',
}

const today = () => new Date().toISOString().slice(0, 10)

const formatDate = (value) => value?.slice(0, 10) ?? '—'

const formatPrice = (value) =>
  `$ ${Number(value ?? 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const addDays = (isoDate, days) => {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + Number(days || 0))
  return date.toISOString().slice(0, 10)
}

const initials = (name = '') =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

export default function Plans() {
  const [plans, setPlans] = useState(null)
  const [clients, setClients] = useState([])
  const [assignments, setAssignments] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('catalog')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [planModal, setPlanModal] = useState(null)
  const [assignmentModal, setAssignmentModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [plansRes, clientsRes, assignmentsRes] = await Promise.all([
        apiGet('/plans'),
        apiGet('/clients'),
        apiGet('/plans/assignments'),
      ])
      setPlans(plansRes)
      setClients(clientsRes)
      setAssignments(assignmentsRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setSearch('')
    setStatusFilter('')
    setClientFilter('')
  }, [tab])

  const activePlans = useMemo(() => (plans ?? []).filter((p) => p.isActive), [plans])
  const activeClients = useMemo(() => clients.filter((c) => c.isActive), [clients])

  const filteredPlans = useMemo(() => {
    if (!plans) return []
    const term = search.trim().toLowerCase()
    if (!term) return plans
    return plans.filter((p) =>
      `${p.name} ${p.description ?? ''}`.toLowerCase().includes(term),
    )
  }, [plans, search])

  const filteredAssignments = useMemo(() => {
    if (!assignments) return []
    const term = search.trim().toLowerCase()
    return assignments.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false
      if (clientFilter && a.clientId !== clientFilter) return false
      if (!term) return true
      return `${a.clientName} ${a.planName}`.toLowerCase().includes(term)
    })
  }, [assignments, search, statusFilter, clientFilter])

  const handlePlanSaved = (message) => {
    setPlanModal(null)
    setToast({ type: 'success', message })
    load()
  }

  const handleAssignmentSaved = (message) => {
    setAssignmentModal(null)
    setToast({ type: 'success', message })
    load()
  }

  const handleDelete = async () => {
    const target = deleteTarget
    try {
      if (target.type === 'plan') {
        await apiDelete(`/plans/${target.item.id}`)
        setDeleteTarget(null)
        setToast({ type: 'success', message: `Plan "${target.item.name}" eliminado.` })
      } else {
        await apiDelete(`/clients/${target.item.clientId}/plans/${target.item.id}`)
        setDeleteTarget(null)
        setToast({ type: 'success', message: 'Asignación eliminada.' })
      }
      load()
    } catch (err) {
      setDeleteTarget(null)
      setToast({ type: 'error', message: err.message })
    }
  }

  const sortedClients = useMemo(
    () =>
      [...clients].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      ),
    [clients],
  )

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Planes</h2>
          <p>Membresías, precios de referencia y asignación a clientes.</p>
        </div>
        {tab === 'catalog' ? (
          <button className="btn btn-primary" onClick={() => setPlanModal({ mode: 'create' })}>
            <PlusIcon />
            Nuevo plan
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setAssignmentModal({ mode: 'create' })}
            disabled={activePlans.length === 0 || activeClients.length === 0}
            title={
              activePlans.length === 0
                ? 'Primero creá un plan activo'
                : activeClients.length === 0
                  ? 'No hay clientes activos'
                  : undefined
            }
          >
            <LinkIcon />
            Asignar plan
          </button>
        )}
      </div>

      {error && (
        <div className="banner warning">
          <p>No se pudo cargar la información: {error}</p>
          <button className="btn btn-ghost" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={tab === 'catalog' ? 'tab active' : 'tab'}
          aria-selected={tab === 'catalog'}
          onClick={() => setTab('catalog')}
        >
          Catálogo <span className="tab-count">{plans?.length ?? 0}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === 'assignments' ? 'tab active' : 'tab'}
          aria-selected={tab === 'assignments'}
          onClick={() => setTab('assignments')}
        >
          Asignaciones <span className="tab-count">{assignments?.length ?? 0}</span>
        </button>
      </div>

      {loading && (
        <div className="card">
          <p className="empty-state">Cargando planes...</p>
        </div>
      )}

      {!loading && !error && tab === 'catalog' && plans && (
        <div className="card">
          <div className="toolbar">
            <div className="search-box">
              <SearchIcon />
              <input
                type="search"
                className="input"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="table-count">
              {filteredPlans.length} de {plans.length}
            </span>
          </div>

          {filteredPlans.length === 0 ? (
            <p className="empty-state">
              {search
                ? `No hay resultados para "${search}".`
                : 'No hay planes registrados. Creá el primero.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Precio ref.</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className={plan.isActive ? '' : 'row-inactive'}>
                      <td>
                        <div className="cell-client">
                          <span className="avatar">{initials(plan.name)}</span>
                          <div>
                            <div className="cell-name">{plan.name}</div>
                            <div className="cell-muted">
                              {plan.description || 'Sin descripción'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="plan-price">{formatPrice(plan.referencePrice)}</td>
                      <td>{plan.durationDays} días</td>
                      <td>
                        <span className={`badge ${plan.isActive ? 'green' : 'amber'}`}>
                          {plan.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setPlanModal({ mode: 'edit', plan })}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget({ type: 'plan', item: plan })}
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

      {!loading && !error && tab === 'assignments' && assignments && (
        <div className="card">
          <div className="toolbar">
            <div className="search-box">
              <SearchIcon />
              <input
                type="search"
                className="input"
                placeholder="Buscar por cliente o plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filters">
              <select
                className="input select filter"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <option value="">Todos los clientes</option>
                {sortedClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              <select
                className="input select filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="Active">Activos</option>
                <option value="Expired">Expirados</option>
                <option value="Cancelled">Cancelados</option>
              </select>
              <span className="table-count">
                {filteredAssignments.length} de {assignments.length}
              </span>
            </div>
          </div>

          {assignments.length === 0 ? (
            <p className="empty-state">
              No hay planes asignados. Usá “Asignar plan” para vincular un plan a un cliente.
            </p>
          ) : filteredAssignments.length === 0 ? (
            <p className="empty-state">No hay asignaciones que coincidan con los filtros.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Plan</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Precio ref.</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        <div className="cell-client">
                          <span className="avatar">{initials(assignment.clientName)}</span>
                          <div className="cell-name">{assignment.clientName}</div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-name">{assignment.planName}</div>
                        <div className="cell-muted">{assignment.durationDays} días</div>
                      </td>
                      <td>{formatDate(assignment.startDate)}</td>
                      <td>{formatDate(assignment.endDate)}</td>
                      <td className="plan-price">{formatPrice(assignment.referencePrice)}</td>
                      <td>
                        <StatusBadge status={assignment.status} />
                      </td>
                      <td className="td-actions">
                        <button
                          className="icon-btn"
                          title="Editar"
                          onClick={() => setAssignmentModal({ mode: 'edit', assignment })}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget({ type: 'assignment', item: assignment })}
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

      {planModal && (
        <PlanFormModal
          mode={planModal.mode}
          plan={planModal.plan}
          onClose={() => setPlanModal(null)}
          onSaved={handlePlanSaved}
        />
      )}

      {assignmentModal && (
        <AssignmentFormModal
          mode={assignmentModal.mode}
          assignment={assignmentModal.assignment}
          clients={sortedClients}
          plans={plans ?? []}
          onClose={() => setAssignmentModal(null)}
          onSaved={handleAssignmentSaved}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{deleteTarget.type === 'plan' ? 'Eliminar plan' : 'Eliminar asignación'}</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              {deleteTarget.type === 'plan' ? (
                <p>
                  ¿Estás seguro de que querés eliminar el plan{' '}
                  <strong>{deleteTarget.item.name}</strong>? Se desactiva (soft-delete) y no
                  se podrá asignar a nuevos clientes.
                </p>
              ) : (
                <p>
                  ¿Estás seguro de que querés eliminar la asignación del plan{' '}
                  <strong>{deleteTarget.item.planName}</strong> para{' '}
                  <strong>{deleteTarget.item.clientName}</strong>?
                </p>
              )}
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

function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_BADGES[status] ?? 'indigo'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function PlanFormModal({ mode, plan, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(
    isEdit
      ? {
          name: plan.name,
          description: plan.description ?? '',
          referencePrice: String(plan.referencePrice),
          durationDays: String(plan.durationDays),
        }
      : {
          name: '',
          description: '',
          referencePrice: '',
          durationDays: '30',
        },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      referencePrice: Number(form.referencePrice),
      durationDays: Number(form.durationDays),
    }

    try {
      if (isEdit) {
        await apiPut(`/plans/${plan.id}`, payload)
        onSaved('Plan actualizado correctamente.')
      } else {
        await apiPost('/plans', payload)
        onSaved('Plan creado correctamente.')
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
            <h3>{isEdit ? 'Editar plan' : 'Nuevo plan'}</h3>
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
              <div className="form-field form-field-full">
                <label htmlFor="planName">Nombre *</label>
                <input
                  id="planName"
                  className="input"
                  value={form.name}
                  onChange={setField('name')}
                  required
                  maxLength={100}
                  placeholder="Ej: Mensual Full"
                />
              </div>

              <div className="form-field">
                <label htmlFor="referencePrice">Precio de referencia *</label>
                <input
                  id="referencePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={form.referencePrice}
                  onChange={setField('referencePrice')}
                  required
                  placeholder="25000"
                />
              </div>

              <div className="form-field">
                <label htmlFor="durationDays">Duración (días) *</label>
                <input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="3650"
                  className="input"
                  value={form.durationDays}
                  onChange={setField('durationDays')}
                  required
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="planDescription">Descripción</label>
                <textarea
                  id="planDescription"
                  className="input"
                  rows="3"
                  maxLength={500}
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="Qué incluye el plan..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AssignmentFormModal({ mode, assignment, clients, plans, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const activeClients = clients.filter((c) => c.isActive)
  const activePlans = plans.filter((p) => p.isActive)

  const currentPlan = isEdit ? plans.find((p) => p.id === assignment.planId) : null
  const planOptions =
    currentPlan && !currentPlan.isActive ? [...activePlans, currentPlan] : activePlans

  const initialPlanId = isEdit ? assignment.planId : activePlans[0]?.id ?? ''
  const initialStartDate = isEdit ? assignment.startDate : today()
  const initialPlan = plans.find((p) => p.id === initialPlanId)
  const initialEndDate = isEdit
    ? assignment.endDate
    : initialPlan
      ? addDays(initialStartDate, initialPlan.durationDays)
      : ''

  const [form, setForm] = useState({
    clientId: isEdit ? assignment.clientId : activeClients[0]?.id ?? '',
    planId: initialPlanId,
    startDate: initialStartDate,
    endDate: initialEndDate,
    status: isEdit && assignment.status === 'Cancelled' ? 'Cancelled' : 'Active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const selectedPlan = plans.find((p) => p.id === form.planId)

  const recalculateEndDate = (planId, startDate) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan || !startDate) return ''
    return addDays(startDate, plan.durationDays)
  }

  const handlePlanChange = (e) => {
    const planId = e.target.value
    setForm((current) => ({
      ...current,
      planId,
      endDate: recalculateEndDate(planId, current.startDate),
    }))
  }

  const handleStartChange = (e) => {
    const startDate = e.target.value
    setForm((current) => ({
      ...current,
      startDate,
      endDate: recalculateEndDate(current.planId, startDate),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.endDate || form.endDate <= form.startDate) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.')
      return
    }

    setSaving(true)

    try {
      if (isEdit) {
        await apiPut(`/clients/${assignment.clientId}/plans/${assignment.id}`, {
          planId: form.planId,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        })
        onSaved('Asignación actualizada correctamente.')
      } else {
        await apiPost(`/clients/${form.clientId}/plans`, {
          planId: form.planId,
          startDate: form.startDate,
          endDate: form.endDate,
        })
        onSaved('Plan asignado correctamente.')
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const noOptions = !isEdit && (activePlans.length === 0 || activeClients.length === 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{isEdit ? 'Editar asignación' : 'Asignar plan'}</h3>
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

            {noOptions && (
              <div className="banner info">
                <p>Necesitás al menos un cliente activo y un plan activo para asignar.</p>
              </div>
            )}

            <div className="form-grid">
              <div className="form-field form-field-full">
                <label htmlFor="assignmentClient">Cliente *</label>
                <select
                  id="assignmentClient"
                  className="input select"
                  value={form.clientId}
                  onChange={(e) => setForm((current) => ({ ...current, clientId: e.target.value }))}
                  disabled={isEdit}
                  required
                >
                  {!isEdit && <option value="">Seleccionar cliente...</option>}
                  {activeClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="assignmentPlan">Plan *</label>
                <select
                  id="assignmentPlan"
                  className="input select"
                  value={form.planId}
                  onChange={handlePlanChange}
                  required
                >
                  {planOptions.length === 0 && <option value="">Sin planes activos</option>}
                  {planOptions.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · {formatPrice(plan.referencePrice)} · {plan.durationDays} días
                      {plan.isActive ? '' : ' · inactivo'}
                    </option>
                  ))}
                </select>
                {selectedPlan && (
                  <span className="cell-muted">
                    Vence: {formatDate(form.endDate)} (inicio + {selectedPlan.durationDays} días)
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="assignmentStart">Fecha de inicio *</label>
                <input
                  id="assignmentStart"
                  type="date"
                  className="input"
                  value={form.startDate}
                  onChange={handleStartChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="assignmentEnd">Fecha de fin *</label>
                <input
                  id="assignmentEnd"
                  type="date"
                  className="input"
                  value={form.endDate}
                  onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))}
                  min={form.startDate || undefined}
                  required
                />
              </div>

              {isEdit && (
                <div className="form-field">
                  <label htmlFor="assignmentStatus">Estado *</label>
                  <select
                    id="assignmentStatus"
                    className="input select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, status: e.target.value }))
                    }
                  >
                    <option value="Active">Activo</option>
                    <option value="Cancelled">Cancelado</option>
                  </select>
                  <span className="cell-muted">
                    El estado “Expirado” se calcula automáticamente según la fecha de fin.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || noOptions || !form.planId || !form.clientId}
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Asignar plan'}
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

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
