/**
 * Converts numeric intelligence level (1-10) to categorical level
 * 1-3: low
 * 4-7: medium
 * 8-10: high
 */
export function numericToCategorical(level: number): 'low' | 'medium' | 'high' {
  if (level >= 1 && level <= 3) {
    return 'low';
  } else if (level >= 4 && level <= 7) {
    return 'medium';
  } else if (level >= 8 && level <= 10) {
    return 'high';
  }
  // Default to medium for invalid values
  return 'medium';
}

/**
 * Converts categorical level to numeric (for backward compatibility if needed)
 */
export function categoricalToNumeric(level: 'low' | 'medium' | 'high'): number {
  switch (level) {
    case 'low':
      return 2; // Middle of 1-3 range
    case 'medium':
      return 5; // Middle of 4-7 range
    case 'high':
      return 9; // Middle of 8-10 range
    default:
      return 5;
  }
}
