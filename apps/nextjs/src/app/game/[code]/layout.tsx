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
  const title = `Game ${normalizedCode}`;
  const description = `Play a round of pet-care trivia in game ${normalizedCode}.`;
  const inviteTitle = "You're invited to play!";
  const inviteDescription = `Join game ${normalizedCode} for a round of pet-care trivia.`;
  const url = `/game/${encodeURIComponent(normalizedCode)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: "website",
      url,
      title: inviteTitle,
      description: inviteDescription,
      images: parentMetadata.openGraph?.images,
    },
    twitter: {
      card: "summary_large_image",
      title: inviteTitle,
      description: inviteDescription,
      images: parentMetadata.twitter?.images,
    },
  };
}

export default function GameLayout({ children }: GameLayoutProps) {
  return children;
}
