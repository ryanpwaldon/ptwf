import { FullScreenLoader } from "./full-screen-loader";

export function GameGenerating() {
  return (
    <FullScreenLoader
      title="Paws for a moment..."
      description="We’re generating your quiz. This may take a moment."
      showPawTrail
    />
  );
}
