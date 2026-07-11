interface DashboardHeaderProps {
  greeting: string;
  title: string;
  subtitle: string;
}

export function DashboardHeader({ greeting, title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-sm text-muted-foreground mb-2">{greeting}</p>
      <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
}
