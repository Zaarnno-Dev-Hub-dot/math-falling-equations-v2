// Answer validation logic

export interface ValidationResult {
  correct: boolean;
  normalizedInput: string;
  normalizedAnswer: string;
}

export class AnswerValidator {
  /**
   * Check if the user's answer matches the expected answer
   * Handles: integers, decimals, fractions (simplified and unsimplified)
   */
  static validate(input: string, expected: string): ValidationResult {
    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // Direct match after normalization
    if (normalizedInput === normalizedExpected) {
      return { correct: true, normalizedInput, normalizedAnswer: normalizedExpected };
    }

    // Try numeric comparison
    const inputNum = this.parseNumber(input);
    const expectedNum = this.parseNumber(expected);

    if (inputNum !== null && expectedNum !== null) {
      // Use small epsilon for float comparison
      const correct = Math.abs(inputNum - expectedNum) < 0.0001;
      return { correct, normalizedInput, normalizedAnswer: normalizedExpected };
    }

    // Check fraction equivalence
    if (this.isFraction(input) && this.isFraction(expected)) {
      const correct = this.compareFractions(input, expected);
      return { correct, normalizedInput, normalizedAnswer: normalizedExpected };
    }

    return { correct: false, normalizedInput, normalizedAnswer: normalizedExpected };
  }

  /**
   * Normalize a math answer for comparison
   */
  private static normalize(input: string): string {
    return input
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all whitespace
      .replace(/^[0]+(\d)/, '$1') // Remove leading zeros
      .replace(/\.$/, '') // Remove trailing decimal
      .replace(/\/0+$/, ''); // Remove trailing zeros in denominator
  }

  /**
   * Parse a number from string (int, float, or fraction)
   */
  private static parseNumber(input: string): number | null {
    const normalized = this.normalize(input);

    // Try direct parse
    const direct = parseFloat(normalized);
    if (!isNaN(direct)) return direct;

    // Try fraction
    if (this.isFraction(normalized)) {
      return this.fractionToDecimal(normalized);
    }

    // Try mixed number (e.g., "1 1/2")
    const mixedMatch = normalized.match(/^(\d+)(\d+\/[\d]+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1]);
      const frac = this.fractionToDecimal(mixedMatch[2]);
      return whole + frac;
    }

    return null;
  }

  /**
   * Check if input is a fraction
   */
  private static isFraction(input: string): boolean {
    return /\//.test(input) && !/^\d+\./.test(input);
  }

  /**
   * Convert fraction string to decimal
   */
  private static fractionToDecimal(frac: string): number {
    const [num, den] = frac.split('/').map(Number);
    if (den === 0) return NaN;
    return num / den;
  }

  /**
   * Compare two fractions for equivalence
   */
  private static compareFractions(frac1: string, frac2: string): boolean {
    // Parse mixed numbers
    const parseMixed = (s: string): { whole: number; num: number; den: number } => {
      const mixedMatch = s.match(/^(\d+)(\d+\/[\d]+)$/);
      if (mixedMatch) {
        const fracParts = mixedMatch[2].split('/').map(Number);
        return { whole: parseInt(mixedMatch[1]), num: fracParts[0], den: fracParts[1] };
      }
      const parts = s.split('/').map(Number);
      return { whole: 0, num: parts[0], den: parts[1] };
    };

    const f1 = parseMixed(this.normalize(frac1));
    const f2 = parseMixed(this.normalize(frac2));

    // Convert to improper fractions
    const imp1 = f1.whole * f1.den + f1.num;
    const imp2 = f2.whole * f2.den + f2.num;

    // Cross multiply to compare
    return imp1 * f2.den === imp2 * f1.den;
  }

  /**
   * Format a number for display
   */
  static formatDisplay(value: number): string {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  /**
   * Simplify a fraction
   */
  static simplifyFraction(numerator: number, denominator: number): string {
    const gcd = this.gcd(numerator, denominator);
    const num = numerator / gcd;
    const den = denominator / gcd;
    
    if (den === 1) return num.toString();
    return `${num}/${den}`;
  }

  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
