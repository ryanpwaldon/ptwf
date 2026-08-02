import { FullScreenError } from "~/components/full-screen-error";

export default function NotFound() {
  return (
    <FullScreenError
      title="Page not found."
      description="The page you are looking for does not exist."
    />
  );
}
