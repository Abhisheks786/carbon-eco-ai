interface Recommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  difficulty: string;
  category: string;
}

export default function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {recommendation.title}
        </h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            difficultyColors[recommendation.difficulty as keyof typeof difficultyColors]
          }`}
        >
          {recommendation.difficulty}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-3">{recommendation.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Saves: <span className="text-emerald-400 font-semibold">
            {recommendation.estimatedSavings.toFixed(0)} kg CO₂/year
          </span>
        </span>
        <button className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
