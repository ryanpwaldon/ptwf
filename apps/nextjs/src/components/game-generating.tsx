import { FullScreenLoader } from "./full-screen-loader";

export function GameGenerating() {
  return (
    <FullScreenLoader
      title="Get ready..."
      description="Please wait while we prepare the game for you."
    />
  );
}
