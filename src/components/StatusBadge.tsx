import { ChallengeStatus } from '@/lib/data';

const statusColors: Record<ChallengeStatus, string> = {
  'Reported': 'bg-gray-100 text-gray-700 ring-gray-500/20',
  'Validated': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Open for Proposals': 'bg-green-50 text-green-700 ring-green-600/20',
  'In Progress': 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  'Resolved': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function StatusBadge({ status }: { status: ChallengeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusColors[status]}`}>
      {status}
    </span>
  );
}
