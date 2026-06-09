interface DashboardCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: number;
  subtitle?: string;
  stats?: { xp: number; level: number };
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  stats,
}: DashboardCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
          <span className="text-3xl">{icon}</span>
        </div>
        <div className="mb-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend < 0 ? 'text-emerald-400' : 'text-red-400'}>
              {trend < 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-slate-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
