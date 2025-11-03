export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isBeforeDeadline(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour < 21;
}

export function getDeadlineMessage(): string {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(21, 0, 0, 0);

  if (now > deadline) {
    return 'Order deadline has passed for today';
  }

  const diff = deadline.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m until deadline`;
}
