import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Clara<span className="text-primary/90">Answers</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-muted-foreground border border-white/5">
              Pipeline Dashboard
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
