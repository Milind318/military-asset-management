export default function StatCard({
  title,
  value,
  sub,
  onClick,
  icon: Icon,
  iconColor = "blue",
}) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      hover: "group-hover:bg-blue-600",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      hover: "group-hover:bg-emerald-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      hover: "group-hover:bg-red-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      hover: "group-hover:bg-purple-600",
    },
  };

  const theme = colors[iconColor] || colors.blue;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`group text-left bg-white rounded-2xl border border-slate-200 p-5 w-full shadow-sm transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 break-words">
            {value}
          </p>

          {sub && (
            <p className="text-xs text-slate-400 mt-2">
              {sub}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 transition-all duration-300 ${
              onClick ? `${theme.hover} group-hover:text-white` : ""
            }`}
          >
            <Icon size={21} />
          </div>
        )}
      </div>

      {onClick && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600">
          View breakdown →
        </div>
      )}
    </button>
  );
}