/**
 * Date formatting utilities
 */

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @param includeTime Whether to include time in the output
 * @returns Formatted date string
 */
export function formatDate(dateString: string, includeTime = false): string {
  const date = new Date(dateString);

  if (includeTime) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
