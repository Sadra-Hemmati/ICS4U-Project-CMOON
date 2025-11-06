import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export function getUrgencyVariant(urgency?: 'low' | 'medium' | 'high'): 'default' | 'secondary' | 'destructive' {
    switch (urgency) {
        case 'high':
            return 'destructive';
        case 'medium':
            return 'secondary';
        case 'low':
            return 'default';
        default:
            return 'default';
    }
}
