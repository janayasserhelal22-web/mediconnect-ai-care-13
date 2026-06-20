import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand">
            <span className="size-3 rounded-full bg-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">Connect Care</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="/#features" className="hover:text-brand">Features</a>
          <a href="/#about" className="hover:text-brand">About</a>
          <Link to="/summary" className="hover:text-brand">Doctor view</Link>
        </div>
        <Link
          to="/consultation"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark"
        >
          Start Consultation
        </Link>
      </div>
    </nav>
  );
}
