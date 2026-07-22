import { useLocalSearchParams } from 'expo-router';
import { TeamDetailScreen } from '@/features/team-detail-page/presentation/screens/TeamDetailScreen';

export default function TeamRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TeamDetailScreen teamId={id || 'br'} />;
}
