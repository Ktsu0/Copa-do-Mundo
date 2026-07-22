import { BetDetailScreen } from "@/features/upcoming-matches-page/presentation/screens/BetDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function BetDetailRoute() {
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();
  return <BetDetailScreen jogoId={jogoId ?? ""} />;
}
