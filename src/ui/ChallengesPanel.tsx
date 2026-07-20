import { CHALLENGES } from '../challenges/challenges'
import { useRoomStore } from '../store/roomStore'

export function ChallengesPanel({
  compact = false,
}: {
  compact?: boolean
}) {
  const done = useRoomStore((s) => s.challengesDone)
  const remaining = CHALLENGES.filter((c) => !done.includes(c.id))
  const completed = CHALLENGES.filter((c) => done.includes(c.id))

  if (compact && remaining.length === 0) {
    return (
      <p className="challenges-done-banner" role="status">
        Tous les défis sont réussis !
      </p>
    )
  }

  return (
    <section className="challenges" aria-label="Défis déco">
      <h3 className="challenges-title">Défis</h3>
      <ul className="challenges-list">
        {remaining.map((c) => (
          <li key={c.id} className="challenges-item">
            <span className="challenges-item-title">{c.title}</span>
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
