import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCatalogItem,
  listByCategory,
  type CatalogCategory,
  type CatalogItem,
} from '../catalog'
import { useRoomStore, type CatalogSheet } from '../store/roomStore'
import { ChallengesPanel } from './ChallengesPanel'
import { useCoarsePointer } from './useCoarsePointer'
import { isPhoneViewport, usePhoneLayout } from './usePhoneLayout'

const CATEGORIES: CatalogCategory[] = [
  'beds',
  'desks',
  'storage',
  'toys',
  'soft',
  'decor',
  'animals',
]

const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  beds: 'Dormir',
  desks: 'Travailler',
  storage: 'Ranger',
  toys: 'Jouer',
  soft: 'Douillet',
  decor: 'Joli',
  animals: 'Animaux',
}

type TabId = CatalogCategory | 'favorites' | 'recents' | 'challenges'

function itemTint(item: CatalogItem): string {
  if (item.visual.tint) return item.visual.tint
  if (item.visual.type === 'kenney') {
    return KENNEY_SWATCH[item.visual.model] ?? '#D4B896'
  }
  if (item.visual.type === 'primitive') {
    return PRIMITIVE_SWATCH[item.visual.kind] ?? '#E8A0B0'
  }
  return '#E8A0B0'
}

const KENNEY_SWATCH: Record<string, string> = {
  bedSingle: '#F5F0EA',
  bedDouble: '#F0A0B8',
  bedBunk: '#F0A0B8',
  desk: '#E8D8C8',
  deskCorner: '#F8F8F5',
  chairDesk: '#F8F8F5',
  chair: '#F0D040',
  chairRounded: '#D4B896',
  chairCushion: '#C8A0D8',
  bookcaseOpen: '#D4B896',
  bookcaseClosed: '#D4B896',
  bookcaseClosedDoors: '#C4A882',
  cabinetBed: '#F5F5F2',
  cabinetBedDrawer: '#F5F0EA',
  cabinetTelevision: '#D4B896',
  sideTable: '#F0A0B8',
  sideTableDrawers: '#F8F8F5',
  cabinetTelevisionDoors: '#E890A0',
  bookcaseOpenLow: '#E8E0D8',
  cardboardBoxClosed: '#F0C040',
  kitchenCabinet: '#F0A0B8',
  kitchenFridgeSmall: '#F0A0B8',
  kitchenMicrowave: '#F8F8F5',
  kitchenCoffeeMachine: '#E890A0',
  kitchenBlender: '#7EC8E8',
  washer: '#A8D0E8',
  dryer: '#A8D0E8',
  washerDryerStacked: '#C8D8E8',
  bathtub: '#F0A0B8',
  shower: '#A8D0E8',
  toilet: '#F8F8F5',
  bathroomSink: '#A8D8C8',
  bathroomCabinet: '#F5F0EA',
  bathroomMirror: '#E8F0F8',
  kitchenStoveElectric: '#F0A0B8',
  kitchenSink: '#A8D0E8',
  kitchenFridge: '#F5F0EA',
  kitchenBar: '#D4B896',
  kitchenBarEnd: '#D4B896',
  kitchenCabinetDrawer: '#F0A0B8',
  kitchenStove: '#F5F0EA',
  kitchenFridgeBuiltIn: '#A8D0E8',
  kitchenCabinetCornerInner: '#F0A0B8',
  kitchenCabinetCornerRound: '#E8D8C8',
  kitchenCabinetUpper: '#F5F0EA',
  kitchenCabinetUpperDouble: '#F0A0B8',
  kitchenCabinetUpperLow: '#A8D8C8',
  kitchenCabinetUpperCorner: '#E8D8C8',
  lampSquareCeiling: '#F8F8F5',
  tableCoffeeGlassSquare: '#E8F0F8',
  tableCrossCloth: '#F0A0B8',
  table: '#D4B896',
  tableGlass: '#E8F0F8',
  televisionAntenna: '#F5F0EA',
  cardboardBoxOpen: '#F0C040',
  loungeSofa: '#F0A0B8',
  loungeSofaLong: '#F5F0EA',
  loungeSofaCorner: '#A8D8C8',
  loungeChair: '#E890A0',
  loungeChairRelax: '#C8A0D8',
  loungeSofaOttoman: '#F0A0B8',
  bench: '#D4B896',
  benchCushion: '#F0A0B8',
  benchCushionLow: '#A8D8C8',
  tableCoffee: '#D4B896',
  tableCoffeeGlass: '#E8F0F8',
  tableCoffeeSquare: '#F8F8F5',
  tableRound: '#F0D040',
  tableCloth: '#F0A0B8',
  tableCross: '#F0A0B8',
  stoolBarSquare: '#F0D040',
  coatRackStanding: '#D4B896',
  coatRack: '#F0A0B8',
  lampSquareFloor: '#F5F0EA',
  radio: '#F0A0B8',
  televisionVintage: '#F5F0EA',
  televisionModern: '#C8A0D8',
  speakerSmall: '#F0A0B8',
  speaker: '#2A2A32',
  plantSmall1: '#5A9E5A',
  plantSmall3: '#7EC070',
  laptop: '#F0A0B8',
  computerKeyboard: '#F8F8F5',
  computerMouse: '#F0A0B8',
  computerScreen: '#2A2A32',
  trashcan: '#A8D8C8',
  pillow: '#F08070',
  pillowLong: '#F5F0EA',
  rugRound: '#F0D040',
  rugRounded: '#E8F0F8',
  rugRectangle: '#A8D8C8',
  rugSquare: '#C8A0D8',
  bear: '#C4894A',
  pottedPlant: '#5A9E5A',
  plantSmall2: '#7EC070',
  lampRoundTable: '#C9A66B',
  lampSquareTable: '#F8F8F5',
  lampRoundFloor: '#F5EDE0',
  books: '#70A0D0',
}

const PRIMITIVE_SWATCH: Record<string, string> = {
  animalDevonRex: '#2A2A32',
  animalPuppy: '#F0B060',
  animalRabbit: '#FFFAF5',
  animalDuck: '#FFE040',
  animalHedgehog: '#A06828',
  animalFrog: '#4CB86A',
  animalBird: '#4AA0F0',
  dollhouse: '#F5F5F2',
  plushStitch: '#4A90D9',
  plushAngel: '#F4A0BE',
  basket: '#C4A882',
  rugHopscotch: '#E8A0B0',
  vanityPink: '#F0A0B8',
  starMobile: '#F0D040',
  mushroomLamp: '#FF6B8A',
  rainbowShelf: '#F07070',
  musicBox: '#E890B0',
  fairyLights: '#FFE8A0',
  toyCastle: '#F0A0B8',
  dreamcatcher: '#C8A0E8',
  toySlide: '#FF8B7B',
  gardenSwing: '#F0A0B8',
  miniTrampoline: '#70A0E0',
  cloudShelf: '#A8D0E8',
  sandBox: '#E8C070',
  aquarium: '#7EC8E8',
}

function itemHint(item: CatalogItem): string | null {
  if (item.outdoor) return 'Chambre ou jardin'
  if (item.nestable) return 'Se pose partout'
  if (item.surfaceHeight != null && item.surfaceHeight <= 0.05) {
    return 'On peut poser des jouets dessus'
  }
  if (item.surfaceHeight != null && item.surfaceHeight > 0.05) {
    return 'On peut poser dessus'
  }
  return null
}

const SHEET_CYCLE: CatalogSheet[] = ['peek', 'half', 'full']

export function CataloguePanel() {
  const coarse = useCoarsePointer()
  const phone = usePhoneLayout()
  const [open, setOpen] = useState(() => !isPhoneViewport())
  const [tab, setTab] = useState<TabId>('beds')
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const armPlace = useRoomStore((s) => s.armPlace)
  const favorites = useRoomStore((s) => s.favorites)
  const recents = useRoomStore((s) => s.recents)
  const toggleFavorite = useRoomStore((s) => s.toggleFavorite)
  const catalogSheet = useRoomStore((s) => s.catalogSheet)
  const setCatalogSheet = useRoomStore((s) => s.setCatalogSheet)
  const parentLock = useRoomStore((s) => s.parentLock)
  const flashToast = useRoomStore((s) => s.flashToast)
  const dragY = useRef<number | null>(null)
  const phonePeekApplied = useRef(false)

  useEffect(() => {
    if (!phone || phonePeekApplied.current) return
    phonePeekApplied.current = true
    if (useRoomStore.getState().catalogSheet === 'half') {
      setCatalogSheet('peek')
    }
  }, [phone, setCatalogSheet])

  const items = useMemo(() => {
    if (tab === 'favorites') {
      return favorites
        .map((id) => getCatalogItem(id))
        .filter((i): i is CatalogItem => i != null)
    }
    if (tab === 'recents') {
      return recents
        .map((id) => getCatalogItem(id))
        .filter((i): i is CatalogItem => i != null)
    }
    if (tab === 'challenges') return []
    return listByCategory(tab)
  }, [tab, favorites, recents])

  const canCollapse = !coarse || phone

  if (!open && canCollapse) {
    return (
      <aside
        className="catalogue catalogue--collapsed"
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="catalogue-expand"
          aria-expanded={false}
          aria-controls="catalogue-body"
          onClick={() => {
            setOpen(true)
            if (phone) setCatalogSheet('half')
          }}
        >
          <span className="catalogue-expand-label">Boîte à meubles</span>
          <span className="catalogue-expand-hint" aria-hidden>
            Ouvrir
          </span>
        </button>
      </aside>
    )
  }

  const sheetClass = coarse
    ? `catalogue catalogue--sheet catalogue--sheet-${catalogSheet}`
    : 'catalogue'

  const onHandlePointerDown = (e: React.PointerEvent) => {
    if (!coarse) return
    dragY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (!coarse || dragY.current == null) return
    const dy = e.clientY - dragY.current
    dragY.current = null
    const idx = SHEET_CYCLE.indexOf(catalogSheet)
    if (dy < -40) {
      setCatalogSheet(SHEET_CYCLE[Math.min(SHEET_CYCLE.length - 1, idx + 1)])
    } else if (dy > 40) {
      setCatalogSheet(SHEET_CYCLE[Math.max(0, idx - 1)])
    }
  }

  return (
    <aside
      className={
        parentLock ? `${sheetClass} catalogue--locked` : sheetClass
      }
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {parentLock && (
        <div className="catalogue-lock-banner" role="status">
          Mode parent — boîte verrouillée
        </div>
      )}
      {coarse && (
        <button
          type="button"
          className="catalogue-sheet-handle"
          aria-label="Redimensionner la boîte à meubles"
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
          onClick={() => {
            const idx = SHEET_CYCLE.indexOf(catalogSheet)
            setCatalogSheet(SHEET_CYCLE[(idx + 1) % SHEET_CYCLE.length])
          }}
        >
          <span className="catalogue-sheet-grip" aria-hidden />
        </button>
      )}
      <div className="catalogue-header">
        <div className="catalogue-header-row">
          <h2 className="catalogue-title">Boîte à meubles</h2>
          {canCollapse && (
            <button
              type="button"
              className="catalogue-collapse"
              aria-expanded={true}
              aria-controls="catalogue-body"
              onClick={() => setOpen(false)}
            >
              Cacher
            </button>
          )}
        </div>
        <p className="catalogue-subtitle">
          {parentLock
            ? 'Demande à un parent pour ajouter des meubles'
            : 'Choisis, puis appuie dans la chambre'}
        </p>
      </div>
      <nav className="catalogue-tabs" aria-label="Catégories du catalogue">
        <button
          type="button"
          className={
            tab === 'favorites'
              ? 'catalogue-tab catalogue-tab--active'
              : 'catalogue-tab'
          }
          onClick={() => setTab('favorites')}
        >
          ★ Favoris
        </button>
        <button
          type="button"
          className={
            tab === 'recents'
              ? 'catalogue-tab catalogue-tab--active'
              : 'catalogue-tab'
          }
          onClick={() => setTab('recents')}
        >
          Récents
        </button>
        <button
          type="button"
          className={
            tab === 'challenges'
              ? 'catalogue-tab catalogue-tab--active'
              : 'catalogue-tab'
          }
          onClick={() => setTab('challenges')}
        >
          Défis
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={
              cat === tab
                ? 'catalogue-tab catalogue-tab--active'
                : 'catalogue-tab'
            }
            onClick={() => setTab(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </nav>
      {tab === 'challenges' ? (
        <div className="catalogue-challenges" id="catalogue-body">
          <ChallengesPanel />
        </div>
      ) : (
        <ul className="catalogue-list" id="catalogue-body">
          {items.length === 0 && (
            <li className="catalogue-empty">
              {tab === 'favorites'
                ? 'Ajoute des favoris avec ★ sur une carte.'
                : tab === 'recents'
                  ? 'Tes derniers choix apparaîtront ici.'
                  : 'Rien ici.'}
            </li>
          )}
          {items.map((item) => {
            const selected = item.id === pendingCatalogId
            const hint = itemHint(item)
            const isFav = favorites.includes(item.id)
            return (
              <li key={item.id}>
                <div
                  className={
                    selected
                      ? 'catalogue-card catalogue-card--selected'
                      : 'catalogue-card'
                  }
                >
                  <button
                    type="button"
                    className="catalogue-card-main"
                    disabled={parentLock}
                    onClick={() => {
                      if (parentLock) {
                        flashToast('Boîte verrouillée — mode parent', 'error')
                        return
                      }
                      armPlace(item.id)
                    }}
                    aria-pressed={selected}
                    aria-label={`Placer ${item.name}`}
                  >
                    <span
                      className="catalogue-swatch"
                      style={{ background: itemTint(item) }}
                      aria-hidden
                    />
                    <span>
                      <span className="catalogue-card-name">{item.name}</span>
                      {hint && (
                        <span className="catalogue-card-hint">{hint}</span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={
                      isFav
                        ? 'catalogue-fav catalogue-fav--on'
                        : 'catalogue-fav'
                    }
                    aria-label={
                      isFav
                        ? `Retirer ${item.name} des favoris`
                        : `Ajouter ${item.name} aux favoris`
                    }
                    aria-pressed={isFav}
                    onClick={() => toggleFavorite(item.id)}
                  >
                    ★
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
