"use client";

export function ChapterHeader({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <span
        className="flex items-center justify-center w-10 h-10 rounded-xl text-lg flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--color-lilac), var(--color-mint))",
        }}
      >
        {icon}
      </span>
      <div>
        <h2 className="text-xl font-bold text-gradient m-0">{title}</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
