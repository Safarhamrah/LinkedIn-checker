import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart2, Linkedin, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar({ theme = "dark", toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Analyze", href: "/" },
    { label: "Progress", href: "/progress" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-linkedin to-linkedin-light">
            <Linkedin className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">ProfilePro</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-border bg-muted/40 p-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                  location.pathname === link.href && "bg-background text-foreground shadow-sm"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {location.pathname !== "/progress" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/progress")}
              className="hidden border-linkedin/30 text-linkedin-light hover:bg-linkedin/10 sm:inline-flex"
            >
              <BarChart2 className="mr-1.5 h-4 w-4" />
              Progress
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
