import { Redirect, useLocalSearchParams } from 'expo-router';
import { TeamDetailScreen } from '@/features/team-detail-page/presentation/screens/TeamDetailScreen';

export default function TeamRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Sem id valido (deep link quebrado, navegacao programatica errada), volta
  // pra lista de times em vez de renderizar o Brasil silenciosamente.
  if (!id) {
    return <Redirect href="/(tabs)/teams" />;
  }

  return <TeamDetailScreen teamId={id} />;
}
