export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedComplexity: {
    time: string;
    space: string;
  };
  hints: string[];
  testCases: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  category: string;
  interviewContext: string;
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'find-duplicates',
    title: 'Find Duplicates in Array',
    description: `Given an integer array, find and return all duplicate elements.

**Example:**
- Input: [1, 2, 3, 2, 1, 4]
- Output: [1, 2]

**Constraints:**
- 1 <= array.length <= 10^5
- Elements can be negative or positive integers`,
    initialCode: `def find_duplicates(arr):
    # Write your solution here
    pass`,
    difficulty: 'Easy',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(n)'
    },
    hints: [
      "Think about what data structure offers O(1) lookup time",
      "Consider using a set or hash map to track seen elements",
      "You can solve this in a single pass through the array"
    ],
    testCases: [
      {
        input: "[1, 2, 3, 2, 1, 4]",
        output: "[1, 2]",
        explanation: "1 and 2 appear more than once"
      },
      {
        input: "[1, 2, 3, 4, 5]",
        output: "[]",
        explanation: "No duplicates found"
      }
    ],
    category: "Arrays & Hashing",
    interviewContext: "This is a classic warm-up problem frequently asked at FAANG companies to assess basic problem-solving and data structure knowledge."
  },

  {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers and a target sum, return the indices of two numbers that add up to the target.

**Example:**
- Input: nums = [2, 7, 11, 15], target = 9
- Output: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)

**Constraints:**
- Each input has exactly one solution
- You may not use the same element twice
- 2 <= nums.length <= 10^4`,
    initialCode: `def two_sum(nums, target):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(n)'
    },
    hints: [
      "The brute force approach is O(n²) - can you do better?",
      "What if you store complements as you iterate?",
      "Hash maps provide O(1) average lookup time"
    ],
    testCases: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6"
      }
    ],
    category: "Arrays & Hashing",
    interviewContext: "LeetCode #1 - One of the most asked questions in tech interviews. Tests understanding of hash maps and algorithmic optimization."
  },

  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

**Valid conditions:**
1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order
3. Every close bracket has a corresponding open bracket

**Example:**
- Input: "()[]{}"
- Output: true
- Input: "([)]"
- Output: false`,
    initialCode: `def is_valid(s):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(n)'
    },
    hints: [
      "Think about the Last In, First Out (LIFO) principle",
      "What data structure naturally follows LIFO?",
      "Consider pairing opening brackets with their closing counterparts"
    ],
    testCases: [
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: "All brackets are properly matched"
      },
      {
        input: '"([)]"',
        output: 'false',
        explanation: "Brackets are not properly nested"
      }
    ],
    category: "Stack",
    interviewContext: "A fundamental stack problem that appears in 70% of technical interviews. Tests understanding of data structures and pattern recognition."
  }
];

export function getProblemById(id: string): CodingProblem | undefined {
  return CODING_PROBLEMS.find(problem => problem.id === id);
}

export function getNextProblem(currentId: string): CodingProblem | undefined {
  const currentIndex = CODING_PROBLEMS.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex >= CODING_PROBLEMS.length - 1) {
    return undefined;
  }
  return CODING_PROBLEMS[currentIndex + 1];
}
