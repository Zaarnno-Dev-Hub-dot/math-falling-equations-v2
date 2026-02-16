import { describe, it, expect } from 'vitest';
import { EquationGenerator } from '../../src/math/equation-generator';

describe('EquationGenerator', () => {
  describe('Grade 2', () => {
    it('should generate addition equations', () => {
      const gen = new EquationGenerator(2);
      const equation = gen.generate();
      
      expect(equation.operation).toBe('add');
      expect(equation.text).toMatch(/^\d+ \+ \d+$/);
      expect(equation.numericAnswer).toBeGreaterThan(0);
    });

    it('should generate subtraction with positive results', () => {
      const gen = new EquationGenerator(2);
      // Force subtraction by trying multiple times
      let found = false;
      for (let i = 0; i < 50; i++) {
        const eq = gen.generate();
        if (eq.operation === 'sub') {
          const [a, b] = eq.text.split(' - ').map(Number);
          expect(a).toBeGreaterThanOrEqual(b);
          expect(eq.numericAnswer).toBeGreaterThanOrEqual(0);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should have answers within grade 2 range', () => {
      const gen = new EquationGenerator(2);
      for (let i = 0; i < 20; i++) {
        const eq = gen.generate();
        expect(eq.numericAnswer).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('Grade 3', () => {
    it('should generate multiplication equations', () => {
      const gen = new EquationGenerator(3);
      let found = false;
      for (let i = 0; i < 50; i++) {
        const eq = gen.generate();
        if (eq.operation === 'mul') {
          expect(eq.text).toMatch(/^\d+ × \d+$/);
          expect(eq.numericAnswer).toBeGreaterThan(0);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should generate division with integer results', () => {
      const gen = new EquationGenerator(3);
      let found = false;
      for (let i = 0; i < 50; i++) {
        const eq = gen.generate();
        if (eq.operation === 'div') {
          expect(Number.isInteger(eq.numericAnswer)).toBe(true);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('Grade 4', () => {
    it('should generate fraction addition', () => {
      const gen = new EquationGenerator(4);
      let found = false;
      for (let i = 0; i < 50; i++) {
        const eq = gen.generate();
        if (eq.operation === 'frac-add') {
          expect(eq.text).toMatch(/^\d+\/\d+ \+ \d+\/\d+$/);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('Grade 5', () => {
    it('should generate decimal multiplication', () => {
      const gen = new EquationGenerator(5);
      let found = false;
      for (let i = 0; i < 50; i++) {
        const eq = gen.generate();
        if (eq.operation === 'decimal-mul') {
          expect(eq.text).toMatch(/^\d+\.\d × \d+$/);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('Difficulty scaling', () => {
    it('should increase difficulty with level', () => {
      const gen1 = new EquationGenerator(3, 1);
      const gen10 = new EquationGenerator(3, 10);
      
      // Generate several equations and compare max numbers used
      let maxNumLevel1 = 0;
      let maxNumLevel10 = 0;
      
      for (let i = 0; i < 20; i++) {
        const eq1 = gen1.generate();
        const eq10 = gen10.generate();
        
        const nums1 = eq1.text.match(/\d+/g)?.map(Number) || [];
        const nums10 = eq10.text.match(/\d+/g)?.map(Number) || [];
        
        maxNumLevel1 = Math.max(maxNumLevel1, ...nums1);
        maxNumLevel10 = Math.max(maxNumLevel10, ...nums10);
      }
      
      // Higher level should generally have larger numbers
      expect(maxNumLevel10).toBeGreaterThanOrEqual(maxNumLevel1);
    });
  });

  describe('Equation correctness', () => {
    it('all generated equations should have correct answers', () => {
      const grades = [2, 3, 4, 5];
      
      for (const grade of grades) {
        const gen = new EquationGenerator(grade);
        for (let i = 0; i < 50; i++) {
          const eq = gen.generate();
          
          // Parse and calculate expected answer
          let calculated: number;
          const parts = eq.text.split(' ');
          
          if (eq.operation === 'add') {
            calculated = Number(parts[0]) + Number(parts[2]);
          } else if (eq.operation === 'sub') {
            calculated = Number(parts[0]) - Number(parts[2]);
          } else if (eq.operation === 'mul') {
            calculated = Number(parts[0]) * Number(parts[2]);
          } else if (eq.operation === 'div') {
            calculated = Number(parts[0]) / Number(parts[2]);
          } else {
            continue; // Skip fractions for this test
          }
          
          expect(Math.abs(calculated - eq.numericAnswer)).toBeLessThan(0.001);
        }
      }
    });
  });
});
