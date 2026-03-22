'use client'
import { WEEKLY_REPORT } from '@/lib/data'

const DONUT_DATA = [
  { name: 'Berhasil',    value: WEEKLY_REPORT.berhasil,   fill: '#34d399' },
  { name: 'On Progress', value: WEEKLY_REPORT.onProgress, fill: '#6366f1' },
  { name: 'Baru Mulai',  value: WEEKLY_REPORT.baruMulai,  fill: '#fbbf24' },
]

function DonutSVG() {
  const cx = 70, cy = 70, r = 50, inner = 32
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0)
  let angle = -90

  const slices = DONUT_DATA.map(d => {
    const sweep = (d.value / total) * 360
    const start = angle
    angle += sweep
    return { ...d, start, sweep }
  })

  function arcPath(startDeg: number, sweepDeg: number, outerR: number, innerR: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const x1 = cx + outerR * Math.cos(toRad(startDeg))
    const y1 = cy + outerR * Math.sin(toRad(startDeg))
    const x2 = cx + outerR * Math.cos(toRad(startDeg + sweepDeg))
    const y2 = cy + outerR * Math.sin(toRad(startDeg + sweepDeg))
    const x3 = cx + innerR * Math.cos(toRad(startDeg + sweepDeg))
    const y3 = cy + innerR * Math.sin(toRad(startDeg + sweepDeg))
    const x4 = cx + innerR * Math.cos(toRad(startDeg))
    const y4 = cy + innerR * Math.sin(toRad(startDeg))
    const large = sweepDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`
  }

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {slices.map((s, i) => (
        <path key={i} d={arcPath(s.start, s.sweep - 1.5, r, inner)} fill={s.fill} opacity={0.9} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f9fafb" fontSize="18" fontWeight="700">{total}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="10">tasks</text>
    </svg>
  )
}

export function WeeklyDonut() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 surface-card">
      <div className="flex justify-center mb-2">
        <DonutSVG />
      </div>
      <div className="space-y-1.5">
        {DONUT_DATA.map(d => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
              <span className="text-xs text-muted-foreground">{d.name}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
