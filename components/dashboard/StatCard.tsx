interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <p className="text-sm text-card-foreground/70 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-card-foreground mb-1">{value}</p>
      {description && (
        <p className="text-sm text-card-foreground/70">{description}</p>
      )}
    </div>
  );
}
