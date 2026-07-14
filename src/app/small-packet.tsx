import { SmallPacketScreen } from '@/features/small-packet-page/presentation/screens/SmallPacketScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function SmallPacketRoute() {
  return (
    <RequireAuthScreen>
      <SmallPacketScreen />
    </RequireAuthScreen>
  );
}
