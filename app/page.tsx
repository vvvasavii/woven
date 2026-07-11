export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-foreground">
          Welcome to Woven
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your thoughtfully crafted bookmark manager
        </p>
        {/* TODO: Add dashboard content in future phases */}
      </div>
    </div>
  );
}
