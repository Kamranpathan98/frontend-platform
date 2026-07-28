import { Container } from "@/components/layout/container";

const REPO_URL = "https://github.com/Kamranpathan98/frontend-platform";

export function Footer() {
  return (
    <footer className="border-border/60 border-t">
      <Container className="text-muted-foreground flex h-14 items-center gap-4 text-sm">
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
      </Container>
    </footer>
  );
}
