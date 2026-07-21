import { captureScenePng } from '../scene/capture'
import { useRoomStore } from '../store/roomStore'

/** Open a printable souvenir page (Save as PDF from the browser print dialog). */
export async function exportSouvenirPdf(): Promise<'ok' | 'no-photo' | 'blocked'> {
  const { roomTitle, challengesDone, activeRoom } = useRoomStore.getState()
  const png = captureScenePng()
  if (!png) return 'no-photo'

  const roomLabel =
    activeRoom === 'bedroom'
      ? 'Chambre'
      : activeRoom === 'hall'
        ? 'Couloir'
        : 'Salon'
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const stars = challengesDone.length

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Souvenir — ${escapeHtml(roomTitle)}</title>
  <style>
    @page { margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Nunito", "Segoe UI", system-ui, sans-serif;
      color: #1f3a45;
      background: #fffdf7;
    }
    .sheet {
      max-width: 190mm;
      margin: 0 auto;
      padding: 8mm;
      border: 3px solid #1f3a45;
      border-radius: 12px;
      background:
        radial-gradient(circle at 10% 0%, #ffe8b0, transparent 40%),
        radial-gradient(circle at 90% 100%, #c8efe0, transparent 45%),
        #fffdf7;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 28px;
      font-weight: 800;
    }
    .meta {
      margin: 0 0 14px;
      font-size: 13px;
      font-weight: 700;
      opacity: 0.75;
    }
    img {
      display: block;
      width: 100%;
      border-radius: 10px;
      border: 2px solid #1f3a45;
      background: #e8f4f0;
    }
    .foot {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 14px;
    }
    .brand { color: #2a9d7c; }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>${escapeHtml(roomTitle)}</h1>
    <p class="meta">${escapeHtml(roomLabel)} · ${escapeHtml(date)} · Mini Déco</p>
    <img src="${png}" alt="Vue de la chambre" />
    <div class="foot">
      <span>${stars} défi${stars === 1 ? '' : 's'} réussi${stars === 1 ? '' : 's'}</span>
      <span class="brand">Mini Déco</span>
    </div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 250);
    };
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) return 'blocked'
  win.document.open()
  win.document.write(html)
  win.document.close()
  return 'ok'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
