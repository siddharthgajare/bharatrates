import { STATES } from '@/lib/states';
import StateMaterialsClient from './state-materials-client';

export function generateStaticParams() {
  return STATES.map((s) => ({
    state: s.name.toLowerCase().replace(/[^a-z]+/g, '-'),
  }));
}

export default function StateMaterialsPage({
  params,
}: {
  params: { state: string };
}) {
  return <StateMaterialsClient stateSlug={params.state} />;
}
