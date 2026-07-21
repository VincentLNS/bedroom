import { getCatalogItem } from '../catalog'
import { isRoomCell } from '../placement'
import type { PlacedItem } from '../store/roomStore'

export type ChallengeId =
  | 'cat-garden'
  | 'plush-bed'
  | 'photo-smile'
  | 'animal-trio'
  | 'reading-nook'
  | 'desk-ready'
  | 'share-room'

export type ChallengeDef = {
  id: ChallengeId
  title: string
  hint: string
  stars: number
  check: (items: PlacedItem[]) => boolean
}

function isGardenCell(cx: number, cz: number): boolean {
  return !isRoomCell(cx, cz)
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'cat-garden',
    title: 'Chat au jardin',
    hint: 'Pose le Chat Devon Rex sur la pelouse autour de la chambre.',
    stars: 1,
    check: (items) =>
      items.some((i) => {
        if (i.catalogId !== 'cat-devon-rex') return false
        return isGardenCell(i.cx, i.cz)
      }),
  },
  {
    id: 'plush-bed',
    title: '3 peluches sur le lit',
    hint: 'Empile trois doudous / peluches nestables sur un lit.',
    stars: 2,
    check: (items) => {
      const beds = items.filter((i) => {
        const cat = getCatalogItem(i.catalogId)
        return cat?.category === 'beds' && (cat.surfaceHeight ?? 0) > 0.05
      })
      for (const bed of beds) {
        const onBed = items.filter((i) => {
          if (i.parentId !== bed.instanceId) return false
          const cat = getCatalogItem(i.catalogId)
          return cat?.nestable === true
        })
        if (onBed.length >= 3) return true
      }
      return false
    },
  },
  {
    id: 'animal-trio',
    title: 'Trio d’animaux',
    hint: 'Place au moins trois animaux (chambre ou jardin).',
    stars: 1,
    check: (items) => {
      const n = items.filter((i) => {
        const cat = getCatalogItem(i.catalogId)
        return cat?.category === 'animals'
      }).length
      return n >= 3
    },
  },
  {
    id: 'reading-nook',
    title: 'Coin lecture',
    hint: 'Place une chaise ou un pouf près d’un tapis.',
    stars: 1,
    check: (items) => {
      const seats = items.filter((i) => {
        const id = i.catalogId
        return (
          id.includes('chair') ||
          id.includes('pouf') ||
          id.includes('beanbag') ||
          id.includes('rattan')
        )
      })
      const rugs = items.filter((i) => {
        const cat = getCatalogItem(i.catalogId)
        return cat?.category === 'soft' && (cat.surfaceHeight ?? 1) <= 0.05
      })
      for (const seat of seats) {
        for (const rug of rugs) {
          if (Math.abs(seat.cx - rug.cx) + Math.abs(seat.cz - rug.cz) <= 3) {
            return true
          }
        }
      }
      return false
    },
  },
  {
    id: 'desk-ready',
    title: 'Bureau prêt',
    hint: 'Une chaise près d’un bureau, avec un objet posé dessus.',
    stars: 2,
    check: (items) => {
      const desks = items.filter((i) => {
        const cat = getCatalogItem(i.catalogId)
        return cat?.category === 'desks' && (cat.surfaceHeight ?? 0) > 0.2
      })
      for (const desk of desks) {
        const onDesk = items.some((i) => i.parentId === desk.instanceId)
        const chairNear = items.some((i) => {
          if (
            !i.catalogId.includes('chair') &&
            !i.catalogId.includes('stool')
          ) {
            return false
          }
          return (
            Math.abs(i.cx - desk.cx) <= 2 && Math.abs(i.cz - desk.cz) <= 2
          )
        })
        if (onDesk && chairNear) return true
      }
      return false
    },
  },
  {
    id: 'photo-smile',
    title: 'Souvenir photo',
    hint: 'Entre en mode Photo et enregistre ou partage une image.',
    stars: 1,
    check: () => false,
  },
  {
    id: 'share-room',
    title: 'Chambre partagée',
    hint: 'Partage ta chambre avec le bouton Lien.',
    stars: 1,
    check: () => false,
  },
]

export function totalStars(): number {
  return CHALLENGES.reduce((sum, c) => sum + c.stars, 0)
}

export function earnedStars(done: ChallengeId[]): number {
  return CHALLENGES.filter((c) => done.includes(c.id)).reduce(
    (sum, c) => sum + c.stars,
    0,
  )
}

export function evaluateChallenges(
  items: PlacedItem[],
  done: ChallengeId[],
): ChallengeId[] {
  const skipManual = new Set<ChallengeId>(['photo-smile', 'share-room'])
  const newly: ChallengeId[] = []
  for (const challenge of CHALLENGES) {
    if (done.includes(challenge.id)) continue
    if (skipManual.has(challenge.id)) continue
    if (challenge.check(items)) newly.push(challenge.id)
  }
  return newly
}
