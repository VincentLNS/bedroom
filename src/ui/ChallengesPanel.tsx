import { CHALLENGES, earnedStars, totalStars } from '../challenges/challenges'
import { useRoomStore } from '../store/roomStore'

function Stars({ n, max }: { n: number; max: number }) {
  return (
    <span className="challenges-stars" aria-label={`${n} sur ${max} étoiles`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={
            i < n ? 'challenges-star challenges-star--on' : 'challenges-star'
          }
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  )
}

export function ChallengesPanel({
  compact = false,
}: {
  compact?: boolean
}) {
  const done = useRoomStore((s) => s.challengesDone)
  const remaining = CHALLENGES.filter((c) => !done.includes(c.id))
  const completed = CHALLENGES.filter((c) => done.includes(c.id))
  const stars = earnedStars(done)
  const maxStars = totalStars()

  if (compact && remaining.length === 0) {
    return (
      <p className="challenges-done-banner" role="status">
        <Stars n={maxStars} max={maxStars} /> Tous les défis sont réussis !
      </p>
    )
  }

  return (
    <section className="challenges" aria-label="Défis déco">
      <div className="challenges-header">
        <h3 className="challenges-title">Défis</h3>
        <Stars n={stars} max={maxStars} />
      </div>
      <ul className="challenges-list">
        {remaining.map((c) => (
          <li key={c.id} className="challenges-item">
            <span className="challenges-item-title">
              {c.title}{' '}
              <span className="challenges-item-stars">
                {'★'.repeat(c.stars)}
              </span>
            </span>
            <span className="challenges-item-hint">{c.hint}</span>
          </li>
        ))}
        {completed.map((c) => (
          <li
            key={c.id}
            className="challenges-item challenges-item--done"
          >
            <span className="challenges-item-title">✓ {c.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
