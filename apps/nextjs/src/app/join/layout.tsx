import type { Metadata } from "next";

const title = "Join a game";
const fullTitle = `${title} | All about pets!`;
const description = "Enter a game code to join a round of pet-care trivia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/join",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/join",
    title: fullTitle,
    description,
    images: ["/meta/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description,
    images: ["/meta/opengraph-image.png"],
  },
};

export default function JoinLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
