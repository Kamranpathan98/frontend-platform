import { Container } from "@/components/layout/container";

const REPO_URL = "https://github.com/Kamranpathan98/frontend-platform";

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <Container
        wide
        className="flex h-16 items-center justify-between gap-4 text-sm text-muted-foreground"
      >
        <span className="font-heading font-semibold text-foreground">
          FrontendPro
        </span>
        <div className="flex gap-6">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href={`${REPO_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            License
          </a>
        </div>
      </Container>
    </footer>
  );
}
