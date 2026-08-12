import { FullScreenLoader } from "./full-screen-loader";

export function GameGenerating() {
  return (
    <FullScreenLoader
      title="Paws for a moment..."
      description="We’re getting your pet-care challenge ready."
      showPawTrail
    />
  );
}
