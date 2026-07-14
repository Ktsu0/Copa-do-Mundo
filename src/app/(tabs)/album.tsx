import { AlbumScreen } from '@/features/album-page/presentation/screens/AlbumScreen';
import { RequireAuthScreen } from '@/shareds/presentation/components/RequireAuthScreen';

export default function AlbumRoute() {
  return (
    <RequireAuthScreen>
      <AlbumScreen />
    </RequireAuthScreen>
  );
}
