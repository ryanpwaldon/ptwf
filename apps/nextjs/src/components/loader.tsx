import { cn } from "@acme/ui";

const PAW_PATH =
  "M7 3.75C7 1.876 8.277 0 10.25 0s3.25 1.876 3.25 3.75-1.277 3.75-3.25 3.75S7 5.624 7 3.75M14.5 10a9 9 0 0 0-8.975 9.675c.142 1.914 1.265 3.276 2.703 4.122C9.643 24.63 11.405 25 13.055 25h2.89c1.65 0 3.412-.37 4.827-1.203 1.438-.846 2.56-2.208 2.703-4.122q.025-.335.025-.675a9 9 0 0 0-9-9m1-6.25C15.5 1.876 16.777 0 18.75 0S22 1.876 22 3.75 20.723 7.5 18.75 7.5 15.5 5.624 15.5 3.75m7 4.5c0-1.874 1.277-3.75 3.25-3.75S29 6.376 29 8.25 27.723 12 25.75 12s-3.25-1.876-3.25-3.75M0 8.25C0 6.376 1.277 4.5 3.25 4.5S6.5 6.376 6.5 8.25 5.223 12 3.25 12 0 10.124 0 8.25";

const PAW_TRANSFORMS = [
  "translate(0 0) translate(25 0) rotate(90)",
  "translate(46 10) translate(25 0) rotate(90)",
  "translate(92 0) translate(25 0) rotate(90)",
  "translate(138 10) translate(25 0) rotate(90)",
] as const;

export function Loader({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Loading"
      className={cn("h-auto w-20 text-current", className)}
      fill="none"
      focusable="false"
      role="status"
      viewBox="0 0 163 39"
      xmlns="http://www.w3.org/2000/svg"
    >
      {PAW_TRANSFORMS.map((transform) => (
        <path
          className="paw-loader-step"
          d={PAW_PATH}
          fill="currentColor"
          key={transform}
          transform={transform}
        />
      ))}
    </svg>
  );
}
