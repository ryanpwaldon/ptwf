import { ThemeToggle } from "@acme/ui/theme";

import { Logo } from "./logo";

export function Header() {
  return (
    <div>
      <header className="flex h-16 items-center justify-between px-4">
        <Logo href="/" />
        <ThemeToggle />
      </header>
    </div>
  );
}
