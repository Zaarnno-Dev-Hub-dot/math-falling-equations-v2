import { describe, it, expect } from 'vitest';
import { AnswerValidator } from '../../src/math/validator';

describe('AnswerValidator', () => {
  describe('Integer validation', () => {
    it('should validate correct integer answers', () => {
      expect(AnswerValidator.validate('5', '5').correct).toBe(true);
      expect(AnswerValidator.validate('123', '123').correct).toBe(true);
      expect(AnswerValidator.validate('0', '0').correct).toBe(true);
    });

    it('should reject incorrect integer answers', () => {
      expect(AnswerValidator.validate('5', '6').correct).toBe(false);
      expect(AnswerValidator.validate('10', '11').correct).toBe(false);
    });

    it('should handle whitespace variations', () => {
      expect(AnswerValidator.validate(' 5 ', '5').correct).toBe(true);
      expect(AnswerValidator.validate('5', ' 5 ').correct).toBe(true);
    });

    it('should handle leading zeros', () => {
      expect(AnswerValidator.validate('05', '5').correct).toBe(true);
      expect(AnswerValidator.validate('005', '5').correct).toBe(true);
    });
  });

  describe('Decimal validation', () => {
    it('should validate correct decimals', () => {
      expect(AnswerValidator.validate('3.5', '3.5').correct).toBe(true);
      expect(AnswerValidator.validate('10.0', '10').correct).toBe(true);
    });

    it('should handle trailing zeros', () => {
      expect(AnswerValidator.validate('5.0', '5').correct).toBe(true);
      expect(AnswerValidator.validate('5.00', '5').correct).toBe(true);
    });

    it('should handle decimal rounding', () => {
      expect(AnswerValidator.validate('0.333', '0.333').correct).toBe(true);
    });
  });

  describe('Fraction validation', () => {
    it('should validate exact fraction matches', () => {
      expect(AnswerValidator.validate('1/2', '1/2').correct).toBe(true);
      expect(AnswerValidator.validate('3/4', '3/4').correct).toBe(true);
    });

    it('should validate equivalent fractions', () => {
      expect(AnswerValidator.validate('1/2', '2/4').correct).toBe(true);
      expect(AnswerValidator.validate('2/4', '1/2').correct).toBe(true);
      expect(AnswerValidator.validate('3/6', '1/2').correct).toBe(true);
      expect(AnswerValidator.validate('4/8', '1/2').correct).toBe(true);
      // 5/8 + 7/8 = 12/8 = 3/2 = 1 1/2 = 1.5
      expect(AnswerValidator.validate('12/8', '3/2').correct).toBe(true);
      expect(AnswerValidator.validate('12/8', '1 1/2').correct).toBe(true);
      expect(AnswerValidator.validate('12/8', '1.5').correct).toBe(true);
      expect(AnswerValidator.validate('6/4', '3/2').correct).toBe(true);
    });

    it('should validate mixed numbers', () => {
      expect(AnswerValidator.validate('1 1/2', '1 1/2').correct).toBe(true);
      expect(AnswerValidator.validate('1 1/2', '3/2').correct).toBe(true);
    });

    it('should reject non-equivalent fractions', () => {
      expect(AnswerValidator.validate('1/2', '1/3').correct).toBe(false);
      expect(AnswerValidator.validate('2/3', '3/4').correct).toBe(false);
    });
  });

  describe('Mixed type validation', () => {
    it('should match fractions to decimals', () => {
      expect(AnswerValidator.validate('1/2', '0.5').correct).toBe(true);
      expect(AnswerValidator.validate('0.5', '1/2').correct).toBe(true);
      expect(AnswerValidator.validate('1/4', '0.25').correct).toBe(true);
    });

    it('should match mixed numbers to decimals', () => {
      expect(AnswerValidator.validate('1 1/2', '1.5').correct).toBe(true);
      expect(AnswerValidator.validate('2 1/4', '2.25').correct).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      expect(AnswerValidator.validate('', '5').correct).toBe(false);
      expect(AnswerValidator.validate('5', '').correct).toBe(false);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(AnswerValidator.validate('abc', '5').correct).toBe(false);
      expect(AnswerValidator.validate('5', 'abc').correct).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(AnswerValidator.validate('-5', '-5').correct).toBe(true);
      expect(AnswerValidator.validate('-10', '-10').correct).toBe(true);
    });
  });

  describe('Fraction simplification', () => {
    it('should simplify fractions correctly', () => {
      expect(AnswerValidator.simplifyFraction(4, 8)).toBe('1/2');
      expect(AnswerValidator.simplifyFraction(6, 9)).toBe('2/3');
      expect(AnswerValidator.simplifyFraction(3, 1)).toBe('3');
    });
  });

  describe('Format display', () => {
    it('should format numbers for display', () => {
      expect(AnswerValidator.formatDisplay(5)).toBe('5');
      expect(AnswerValidator.formatDisplay(5.5)).toBe('5.5');
      expect(AnswerValidator.formatDisplay(5.50)).toBe('5.5');
    });
  });
});
