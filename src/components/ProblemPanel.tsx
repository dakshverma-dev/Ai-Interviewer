import type { CodingProblem } from '@/data/problems';

interface ProblemPanelProps {
  problem: CodingProblem;
}

const difficultyColor: Record<CodingProblem['difficulty'], string> = {
  Easy: 'var(--color-sprout)',
  Medium: 'var(--color-sunbeam)',
  Hard: 'var(--color-ember)',
};

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="card p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xl font-medium tracking-tight">{problem.title}</h2>
        <span
          className="text-xs font-medium px-2 py-1 rounded-[var(--radius-full)]"
          style={{ background: 'var(--color-sand)', color: difficultyColor[problem.difficulty] }}
        >
          {problem.difficulty}
        </span>
      </div>
      <p className="text-sm text-[var(--color-fog)] mb-4">{problem.category}</p>
      <div className="text-sm whitespace-pre-wrap leading-relaxed">{problem.description}</div>
    </div>
  );
}
