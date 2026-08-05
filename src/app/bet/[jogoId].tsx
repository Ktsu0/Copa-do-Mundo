import { BetDetailScreen } from "@/features/upcoming-matches-page/presentation/screens/BetDetailScreen";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function BetDetailRoute() {
  const { jogoId } = useLocalSearchParams<{ jogoId: string }>();

  // Sem jogoId valido (deep link quebrado, navegacao programatica errada),
  // volta pra lista de partidas em vez de tentar carregar um id vazio.
  if (!jogoId) {
    return <Redirect href="/(tabs)/betting" />;
  }

  return <BetDetailScreen jogoId={jogoId} />;
}
