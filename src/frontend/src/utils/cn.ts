/** Tiny className joiner — avoids pulling in clsx/tailwind-merge for a hackathon scaffold. */
export function cn(...classes: ReadonlyArray<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
