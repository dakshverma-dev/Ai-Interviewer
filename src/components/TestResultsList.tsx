import type { TestCaseResult } from '@/lib/interviewState';

interface TestResultsListProps {
  results: TestCaseResult[];
}

export default function TestResultsList({ results }: TestResultsListProps) {
  if (results.length === 0) return null;

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="card p-4 mt-3">
      <p className="text-sm font-medium mb-2">
        {passedCount}/{results.length} test cases passed
      </p>
      <div className="flex flex-col gap-2">
        {results.map((result, i) => (
          <div
            key={i}
            className="text-xs font-mono p-2 rounded-[var(--radius-md)]"
            style={{ background: result.passed ? 'rgba(40, 200, 64, 0.08)' : 'rgba(255, 95, 87, 0.08)' }}
          >
            <span style={{ color: result.passed ? 'var(--color-sprout)' : 'var(--color-ember)' }}>
              {result.passed ? '✓ PASS' : '✗ FAIL'}
            </span>{' '}
            input: {result.input} — expected: {result.expectedOutput} — got:{' '}
            {result.error ?? result.actualOutput}
          </div>
        ))}
      </div>
    </div>
  );
}
