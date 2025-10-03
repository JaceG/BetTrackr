import StatsStrip from "../StatsStrip";

export default function StatsStripExample() {
  return (
    <StatsStrip
      currentBalance={1750}
      netPL={1150}
      peakBalance={2100}
      maxDrawdown={-450}
    />
  );
}
