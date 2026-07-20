import { getCatalogItem } from '../catalog'
import { isRoomCell } from '../placement'
import type { PlacedItem } from '../store/roomStore'

export type ChallengeId =
  | 'cat-garden'
  | 'plush-bed'
  | 'photo-smile'
  | 'animal-trio'

export type ChallengeDef = {
  id: ChallengeId
  title: string
  hint: string
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
    check: (items) => {
      const n = items.filter((i) => {
        const cat = getCatalogItem(i.catalogId)
        return cat?.category === 'animals'
      }).length
      return n >= 3
    },
  },
  {
    id: 'photo-smile',
    title: 'Souvenir photo',
    hint: 'Entre en mode Photo et enregistre une image de ta chambre.',
    check: () => false, // completed via markChallengeDone('photo-smile')
  },
]

export function evaluateChallenges(
  items: PlacedItem[],
  done: ChallengeId[],
): ChallengeId[] {
  const newly: ChallengeId[] = []
  for (const challenge of CHALLENGES) {
    if (done.includes(challenge.id)) continue
    if (challenge.id === 'photo-smile') continue
    if (challenge.check(items)) newly.push(challenge.id)
  }
  return newly
}
