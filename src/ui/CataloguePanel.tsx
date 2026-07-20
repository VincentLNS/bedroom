import { useState } from 'react'
import { listByCategory, type CatalogCategory } from '../catalog'
import { useRoomStore } from '../store/roomStore'

const CATEGORIES: CatalogCategory[] = [
  'beds',
  'desks',
  'storage',
  'toys',
  'soft',
  'decor',
]

const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  beds: 'Lits',
  desks: 'Bureau',
  storage: 'Rangement',
  toys: 'Jouets',
  soft: 'Textile',
  decor: 'Déco',
}

function itemTint(item: ReturnType<typeof listByCategory>[number]): string {
  return item.visual.tint ?? '#d8d0c8'
}

export function CataloguePanel() {
  const [category, setCategory] = useState<CatalogCategory>('beds')
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const armPlace = useRoomStore((s) => s.armPlace)
  const items = listByCategory(category)

  return (
    <aside
      className="catalogue"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <nav className="catalogue-tabs" aria-label="Catégories du catalogue">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={
              cat === category
                ? 'catalogue-tab catalogue-tab--active'
                : 'catalogue-tab'
            }
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </nav>
      <ul className="catalogue-list">
        {items.map((item) => {
          const selected = item.id === pendingCatalogId
          return (
            <li key={item.id}>
              <button
                type="button"
                className={
                  selected
                    ? 'catalogue-card catalogue-card--selected'
                    : 'catalogue-card'
                }
                onClick={() => armPlace(item.id)}
              >
                <span
                  className="catalogue-swatch"
                  style={{ background: itemTint(item) }}
                  aria-hidden
                />
                <span className="catalogue-card-name">{item.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
