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
  },

  {
    id: 'reverse-linked-list',
    title: 'Reverse a Linked List (as array)',
    description: `Given a list representing a singly linked list (as a plain array of values, head first), return a new list with the nodes reversed.

**Example:**
- Input: [1, 2, 3, 4, 5]
- Output: [5, 4, 3, 2, 1]

**Constraints:**
- 0 <= length <= 10^4`,
    initialCode: `def reverse_list(values):
    # Write your solution here
    pass`,
    difficulty: 'Easy',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)'
    },
    hints: [
      "You don't need extra space beyond the output itself",
      "Think about iterating with two pointers, or simply building the result backwards",
      "Consider the edge cases: empty list, single element"
    ],
    testCases: [
      {
        input: "[1, 2, 3, 4, 5]",
        output: "[5, 4, 3, 2, 1]",
        explanation: "Nodes reversed"
      },
      {
        input: "[]",
        output: "[]",
        explanation: "Empty list stays empty"
      }
    ],
    category: "Linked Lists",
    interviewContext: "Modeling a linked list as an array to keep the exercise language-agnostic while testing the core reversal logic and pointer manipulation intuition."
  },

  {
    id: 'binary-search',
    title: 'Binary Search',
    description: `Given a sorted array of integers and a target value, return the index of the target, or -1 if it's not present.

**Example:**
- Input: nums = [-1, 0, 3, 5, 9, 12], target = 9
- Output: 4

**Constraints:**
- Array is sorted in ascending order
- Must run in O(log n) time`,
    initialCode: `def binary_search(nums, target):
    # Write your solution here
    pass`,
    difficulty: 'Easy',
    expectedComplexity: {
      time: 'O(log n)',
      space: 'O(1)'
    },
    hints: [
      "Since the array is sorted, you can eliminate half the search space each step",
      "Track a low and high pointer and compute the midpoint",
      "Be careful with the loop's termination condition"
    ],
    testCases: [
      {
        input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        output: "4",
        explanation: "9 is at index 4"
      },
      {
        input: "nums = [-1, 0, 3, 5, 9, 12], target = 2",
        output: "-1",
        explanation: "2 is not in the array"
      }
    ],
    category: "Binary Search",
    interviewContext: "The canonical O(log n) search problem — tests whether a candidate reaches for the sorted-array invariant instead of a linear scan."
  },

  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray Sum',
    description: `Given an integer array, find the contiguous subarray with the largest sum and return that sum.

**Example:**
- Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
- Output: 6 (from subarray [4, -1, 2, 1])

**Constraints:**
- 1 <= array.length <= 10^5`,
    initialCode: `def max_subarray(nums):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)'
    },
    hints: [
      "Consider Kadane's algorithm — track a running sum and reset it when it goes negative",
      "At each step, decide: extend the current subarray, or start fresh here?",
      "Keep a separate variable for the best sum seen so far"
    ],
    testCases: [
      {
        input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        output: "6",
        explanation: "[4, -1, 2, 1] has the largest sum"
      },
      {
        input: "[1]",
        output: "1",
        explanation: "Single element array"
      }
    ],
    category: "Dynamic Programming",
    interviewContext: "Kadane's algorithm is one of the most common DP-flavored interview questions and a good test of whether a candidate can spot an O(n) greedy/DP reformulation of a brute-force O(n²) problem."
  },

  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    description: `Given a list of intervals, merge all overlapping intervals and return the result.

**Example:**
- Input: [[1,3], [2,6], [8,10], [15,18]]
- Output: [[1,6], [8,10], [15,18]]

**Constraints:**
- Intervals are given as [start, end] pairs
- 1 <= number of intervals <= 10^4`,
    initialCode: `def merge_intervals(intervals):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n log n)',
      space: 'O(n)'
    },
    hints: [
      "Sorting the intervals by start time first makes this much easier",
      "Walk through the sorted intervals and compare each one to the last merged interval",
      "Two intervals overlap if the next one's start is <= the current merged interval's end"
    ],
    testCases: [
      {
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "[1,3] and [2,6] overlap and merge into [1,6]"
      },
      {
        input: "[[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Touching intervals count as overlapping"
      }
    ],
    category: "Intervals",
    interviewContext: "Interval merging tests sorting intuition plus careful boundary-condition handling — a frequent mid-level interview staple."
  },

  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string, find the length of the longest substring without repeating characters.

**Example:**
- Input: "abcabcbb"
- Output: 3 (the answer is "abc")

**Constraints:**
- 0 <= string length <= 5 * 10^4
- String consists of English letters, digits, symbols, and spaces`,
    initialCode: `def longest_substring(s):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(min(n, m))'
    },
    hints: [
      "A sliding window is the key technique here",
      "Track the last seen index of each character",
      "When you hit a repeat, jump the window's left edge past the previous occurrence"
    ],
    testCases: [
      {
        input: '"abcabcbb"',
        output: "3",
        explanation: '"abc" is the longest substring without repeats'
      },
      {
        input: '"bbbbb"',
        output: "1",
        explanation: 'Only "b" — every character repeats'
      }
    ],
    category: "Sliding Window",
    interviewContext: "One of the most frequently asked sliding-window problems — tests whether a candidate can avoid an O(n²) brute force by maintaining window state incrementally."
  },

  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    description: `You're climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?

**Example:**
- Input: n = 5
- Output: 8

**Constraints:**
- 1 <= n <= 45`,
    initialCode: `def climb_stairs(n):
    # Write your solution here
    pass`,
    difficulty: 'Easy',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)'
    },
    hints: [
      "This is really just a disguised Fibonacci sequence",
      "The number of ways to reach step n is the sum of ways to reach n-1 and n-2",
      "You only need to track the last two values, not a full array"
    ],
    testCases: [
      {
        input: "n = 5",
        output: "8",
        explanation: "5 steps can be climbed 8 distinct ways"
      },
      {
        input: "n = 2",
        output: "2",
        explanation: "Either 1+1 or 2"
      }
    ],
    category: "Dynamic Programming",
    interviewContext: "A gentle first DP problem — tests whether a candidate can recognize a recurrence relation and optimize away unnecessary memory."
  },

  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    description: `Given an array of strings, group the anagrams together. You can return the groups in any order.

**Example:**
- Input: ["eat","tea","tan","ate","nat","bat"]
- Output: [["eat","tea","ate"],["tan","nat"],["bat"]]

**Constraints:**
- 1 <= array.length <= 10^4
- Strings consist of lowercase English letters`,
    initialCode: `def group_anagrams(strs):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n * k log k)',
      space: 'O(n * k)'
    },
    hints: [
      "Anagrams share the same characters, just in different order",
      "What canonical form could you compute per string so anagrams map to the same key?",
      "A hash map from that canonical key to a list of original strings works well"
    ],
    testCases: [
      {
        input: '["eat","tea","tan","ate","nat","bat"]',
        output: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
        explanation: "Grouped by sorted-character key"
      },
      {
        input: '[""]',
        output: '[[""]]',
        explanation: "Single empty string forms its own group"
      }
    ],
    category: "Arrays & Hashing",
    interviewContext: "Tests the instinct to use a normalized key (sorted string or character count) as a hash map key rather than comparing strings pairwise."
  },

  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    description: `Given two strings, determine if the second is an anagram of the first.

**Example:**
- Input: s = "anagram", t = "nagaram"
- Output: true

**Constraints:**
- 1 <= s.length, t.length <= 5 * 10^4
- Both strings consist of lowercase English letters`,
    initialCode: `def is_anagram(s, t):
    # Write your solution here
    pass`,
    difficulty: 'Easy',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1)'
    },
    hints: [
      "Two anagrams must have the same length and the same character counts",
      "A character-frequency count (or sorting both strings) both work",
      "Sorting is O(n log n); counting characters gets you to O(n)"
    ],
    testCases: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
        explanation: "Same characters, different order"
      },
      {
        input: 's = "rat", t = "car"',
        output: "false",
        explanation: "Different character sets"
      }
    ],
    category: "Arrays & Hashing",
    interviewContext: "A simple warm-up that tests basic hash map / counting technique before moving into harder problems."
  },

  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    description: `Given an integer array, return an array where each element is the product of all other elements, without using division.

**Example:**
- Input: [1, 2, 3, 4]
- Output: [24, 12, 8, 6]

**Constraints:**
- 2 <= array.length <= 10^5
- Must run in O(n) time without using the division operator`,
    initialCode: `def product_except_self(nums):
    # Write your solution here
    pass`,
    difficulty: 'Medium',
    expectedComplexity: {
      time: 'O(n)',
      space: 'O(1) extra (excluding output array)'
    },
    hints: [
      "Think about splitting the problem into a 'prefix product' and 'suffix product' pass",
      "Compute prefix products left to right, then multiply in suffix products right to left",
      "You can reuse the output array itself to avoid extra space for the prefix pass"
    ],
    testCases: [
      {
        input: "[1, 2, 3, 4]",
        output: "[24, 12, 8, 6]",
        explanation: "Each element is the product of the other three"
      },
      {
        input: "[-1, 1, 0, -3, 3]",
        output: "[0, 0, 9, 0, 0]",
        explanation: "A single zero forces most outputs to zero"
      }
    ],
    category: "Arrays & Hashing",
    interviewContext: "A classic 'no division allowed' constraint problem that tests whether a candidate can think in two passes instead of reaching for the obvious (and disallowed) approach."
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
