import { useEffect, useId, useMemo, useRef, useState } from 'react'

const normalize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export default function SearchSelect({
  items,
  value,
  onChange,
  placeholder = 'Buscar...',
  emptyText = 'Sin resultados',
  clearable = false,
  clearLabel = 'Limpiar selección',
  maxResults = 50,
  disabled = false,
  autoFocus = false,
  id,
  className = '',
  ariaLabel,
}) {
  const generatedId = useId()
  const inputId = id ?? `search-select-${generatedId}`
  const listId = `${inputId}-list`

  const selected = useMemo(
    () => items.find((item) => item.value === value) ?? null,
    [items, value],
  )

  const [query, setQuery] = useState(selected?.label ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    setQuery(selected?.label ?? '')
  }, [selected?.label])

  useEffect(() => {
    if (!open) return
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const term = normalize(selected && query === selected.label ? '' : query)

  const filtered = useMemo(() => {
    if (!term) return items
    return items.filter((item) => normalize(`${item.label} ${item.hint ?? ''}`).includes(term))
  }, [items, term])

  const visible = filtered.slice(0, maxResults)

  useEffect(() => {
    setActiveIndex(-1)
  }, [term, open])

  useEffect(() => {
    if (activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const selectItem = (item) => {
    onChange(item.value)
    setQuery(item.label)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
    setOpen(false)
  }

  const handleChange = (event) => {
    const text = event.target.value
    setQuery(text)
    setOpen(true)
    if (selected && text !== selected.label) {
      onChange('')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setActiveIndex((index) => (index + 1 >= visible.length ? 0 : index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? visible.length - 1 : index - 1))
    } else if (event.key === 'Enter') {
      if (open && activeIndex >= 0 && visible[activeIndex]) {
        event.preventDefault()
        selectItem(visible[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleBlur = () => {
    if (selected) {
      setQuery(selected.label)
    } else if (query) {
      setQuery('')
    }
  }

  const showClear = clearable && Boolean(value)

  return (
    <div className={`combobox ${className}`.trim()} ref={wrapperRef}>
      <input
        id={inputId}
        type="text"
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {showClear && (
        <button
          type="button"
          className="combobox-clear"
          aria-label={clearLabel}
          title={clearLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
        >
          <ClearIcon />
        </button>
      )}

      {open && (
        <div className="combobox-list" id={listId} role="listbox" ref={listRef}>
          {visible.length === 0 && <div className="combobox-empty">{emptyText}</div>}

          {visible.map((item, index) => (
            <div
              key={item.value}
              id={`${inputId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'combobox-option active' : 'combobox-option'}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectItem(item)}
            >
              <span className="combobox-option-label">{item.label}</span>
              {item.hint && <span className="combobox-option-hint">{item.hint}</span>}
            </div>
          ))}

          {filtered.length > visible.length && (
            <div className="combobox-footer">
              Mostrando {visible.length} de {filtered.length}. Seguí escribiendo para afinar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
