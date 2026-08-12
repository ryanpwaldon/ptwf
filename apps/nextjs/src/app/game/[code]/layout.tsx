import type { Metadata, ResolvingMetadata } from "next";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}

export async function generateMetadata(
  { params }: GameLayoutProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();
  const parentMetadata = await parent;
  const title = `Game ${normalizedCode} | All about pets!`;
  const description = `Play a round of pet-care trivia in game ${normalizedCode}.`;
  const inviteTitle = "You're invited to play!";
  const inviteDescription = `Join game ${normalizedCode} for a round of pet-care trivia.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: `/game/${encodeURIComponent(normalizedCode)}`,
      title: inviteTitle,
      description: inviteDescription,
      images: parentMetadata.openGraph?.images,
    },
  };
}

export default function GameLayout({ children }: GameLayoutProps) {
  return children;
}
