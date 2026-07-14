import { RewardsScreen } from '@/features/rewards-page/presentation/screens/RewardsScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function RewardsRoute() {
  return (
    <RequireAuthScreen>
      <RewardsScreen />
    </RequireAuthScreen>
  );
}
