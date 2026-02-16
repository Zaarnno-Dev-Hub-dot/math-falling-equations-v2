// Math equation generation for grades 2-5

export type Operation = 'add' | 'sub' | 'mul' | 'div' | 'frac-add' | 'frac-sub';

export interface Equation {
  text: string;
  answer: string;
  numericAnswer: number;
  operation: Operation;
  difficulty: number;
}

export interface Fraction {
  numerator: number;
  denominator: number;
  whole?: number;
}

export class EquationGenerator {
  private grade: number;
  private level: number;

  constructor(grade: number, level = 1) {
    this.grade = grade;
    this.level = level;
  }

  // Generate a random equation appropriate for the grade/level
  generate(): Equation {
    const operations = this.getAllowedOperations();
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    switch (operation) {
      case 'add':
        return this.generateAddition();
      case 'sub':
        return this.generateSubtraction();
      case 'mul':
        return this.generateMultiplication();
      case 'div':
        return this.generateDivision();
      case 'frac-add':
        return this.generateFractionAddition();
      case 'frac-sub':
        return this.generateFractionSubtraction();
      default:
        return this.generateAddition();
    }
  }

  private getAllowedOperations(): Operation[] {
    const ops: Operation[] = [];
    
    switch (this.grade) {
      case 2:
        ops.push('add', 'sub');
        if (this.level >= 3) {
          // Occasionally introduce simple mul/div concepts
          ops.push('add', 'sub'); // Weighted toward add/sub
        }
        break;
      case 3:
        ops.push('add', 'sub', 'mul', 'div');
        break;
      case 4:
        ops.push('add', 'sub', 'mul', 'div', 'frac-add');
        if (this.level >= 5) {
          ops.push('frac-sub');
        }
        break;
      case 5:
        ops.push('mul', 'div', 'frac-add', 'frac-sub');
        if (this.level >= 3) {
          ops.push('add', 'sub'); // Still include basics
        }
        break;
      default:
        ops.push('add', 'sub');
    }
    
    return ops;
  }

  private generateAddition(): Equation {
    const max = this.getMaxNumber();
    const a = this.rand(2, max);
    const b = this.rand(2, max);
    
    return {
      text: `${a} + ${b}`,
      answer: (a + b).toString(),
      numericAnswer: a + b,
      operation: 'add',
      difficulty: this.calculateDifficulty(a, b),
    };
  }

  private generateSubtraction(): Equation {
    const max = this.getMaxNumber();
    const a = this.rand(5, max);
    const b = this.rand(2, a); // Ensure positive result
    
    return {
      text: `${a} - ${b}`,
      answer: (a - b).toString(),
      numericAnswer: a - b,
      operation: 'sub',
      difficulty: this.calculateDifficulty(a, b),
    };
  }

  private generateMultiplication(): Equation {
    const maxFactor = this.grade === 3 ? 9 : 12;
    const a = this.rand(2, maxFactor);
    const b = this.rand(2, maxFactor);
    
    return {
      text: `${a} × ${b}`,
      answer: (a * b).toString(),
      numericAnswer: a * b,
      operation: 'mul',
      difficulty: this.calculateDifficulty(a, b),
    };
  }

  private generateDivision(): Equation {
    const maxFactor = this.grade === 3 ? 9 : 12;
    const b = this.rand(2, maxFactor);
    const answer = this.rand(2, maxFactor);
    const a = b * answer;
    
    return {
      text: `${a} ÷ ${b}`,
      answer: answer.toString(),
      numericAnswer: answer,
      operation: 'div',
      difficulty: this.calculateDifficulty(a, b),
    };
  }

  private generateFractionAddition(): Equation {
    // Like denominators for grade 4
    const denom = this.rand(2, 8);
    const num1 = this.rand(1, denom - 1);
    const num2 = this.rand(1, denom - 1);
    const sumNum = num1 + num2;
    
    let answer: string;
    let numericAnswer: number;
    
    if (sumNum >= denom) {
      const whole = Math.floor(sumNum / denom);
      const rem = sumNum % denom;
      if (rem === 0) {
        answer = whole.toString();
        numericAnswer = whole;
      } else {
        // Simplify
        const gcd = this.gcd(rem, denom);
        answer = `${whole} ${rem / gcd}/${denom / gcd}`;
        numericAnswer = whole + (rem / denom);
      }
    } else {
      // Simplify
      const gcd = this.gcd(sumNum, denom);
      answer = `${sumNum / gcd}/${denom / gcd}`;
      numericAnswer = sumNum / denom;
    }
    
    return {
      text: `${num1}/${denom} + ${num2}/${denom}`,
      answer,
      numericAnswer,
      operation: 'frac-add',
      difficulty: 3,
    };
  }

  private generateFractionSubtraction(): Equation {
    const denom = this.rand(2, 8);
    const num1 = this.rand(2, denom - 1);
    const num2 = this.rand(1, num1 - 1);
    const resultNum = num1 - num2;
    
    // Simplify
    const gcd = this.gcd(resultNum, denom);
    const answer = `${resultNum / gcd}/${denom / gcd}`;
    
    return {
      text: `${num1}/${denom} - ${num2}/${denom}`,
      answer,
      numericAnswer: resultNum / denom,
      operation: 'frac-sub',
      difficulty: 3,
    };
  }

  private getMaxNumber(): number {
    // Scale with grade and level
    const base = this.grade === 2 ? 10 : this.grade === 3 ? 20 : 50;
    const levelBonus = Math.floor((this.level - 1) / 3) * 5;
    return base + levelBonus;
  }

  private calculateDifficulty(a: number, b: number): number {
    // Higher numbers = higher difficulty
    const max = Math.max(a, b);
    if (max <= 10) return 1;
    if (max <= 20) return 2;
    if (max <= 50) return 3;
    return 4;
  }

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  // Update level (call when player levels up)
  setLevel(level: number): void {
    this.level = level;
  }
}
