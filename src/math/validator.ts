// Answer validation logic

export interface ValidationResult {
  correct: boolean;
  normalizedInput: string;
  normalizedAnswer: string;
}

export class AnswerValidator {
  /**
   * Check if the user's answer matches the expected answer
   * Handles: integers, decimals, fractions (simplified and unsimplified), mixed numbers
   */
  static validate(input: string, expected: string): ValidationResult {
    // Parse both answers to their numeric values
    const inputValue = this.parseToNumber(input);
    const expectedValue = this.parseToNumber(expected);

    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // If we can parse both as numbers, compare numerically
    if (inputValue !== null && expectedValue !== null) {
      const correct = Math.abs(inputValue - expectedValue) < 0.0001;
      return { correct, normalizedInput, normalizedAnswer: normalizedExpected };
    }

    // Fallback to string comparison
    return { 
      correct: normalizedInput === normalizedExpected, 
      normalizedInput, 
      normalizedAnswer: normalizedExpected 
    };
  }

  /**
   * Parse any math answer to a numeric value
   * Handles: integers, decimals, fractions (improper/proper), mixed numbers
   */
  private static parseToNumber(input: string): number | null {
    if (!input || input.trim() === '') return null;
    
    const trimmed = input.trim();

    // Try simple number first (int or decimal)
    const simpleNum = parseFloat(trimmed);
    if (!isNaN(simpleNum) && !trimmed.includes('/')) {
      return simpleNum;
    }

    // Check for mixed number (e.g., "1 1/2", "2 3/4")
    const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1], 10);
      const num = parseInt(mixedMatch[2], 10);
      const den = parseInt(mixedMatch[3], 10);
      if (den === 0) return null;
      return whole + (num / den);
    }

    // Check for simple fraction (e.g., "3/2", "12/8")
    const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fracMatch) {
      const num = parseInt(fracMatch[1], 10);
      const den = parseInt(fracMatch[2], 10);
      if (den === 0) return null;
      return num / den;
    }

    return null;
  }

  /**
   * Normalize a math answer for display/comparison
   */
  private static normalize(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
  }

  /**
   * Format a number for display
   */
  static formatDisplay(value: number): string {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  /**
   * Simplify a fraction and return as string
   */
  static simplifyFraction(numerator: number, denominator: number): string {
    if (denominator === 0) return 'undefined';
    
    const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
    const num = numerator / gcd;
    const den = denominator / gcd;
    
    // Convert to mixed number if improper
    if (Math.abs(num) >= den) {
      const whole = Math.floor(num / den);
      const remainder = Math.abs(num) % den;
      if (remainder === 0) return whole.toString();
      return `${whole} ${remainder}/${den}`;
    }
    
    return `${num}/${den}`;
  }

  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
