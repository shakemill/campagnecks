type VisitItem = {
  date: string;
  title: string;
  details: string;
};

type VisiteTimelineProps = {
  visits: VisitItem[];
};

export function VisiteTimeline({ visits }: VisiteTimelineProps) {
  return (
    <section className="soft-card p-4">
      <h3 className="font-heading text-lg font-semibold text-brand-gray">Timeline des visites</h3>
      <ol className="mt-3 space-y-3">
        {visits.map((visit) => (
          <li key={`${visit.date}-${visit.title}`} className="border-l-2 border-brand-pink pl-3">
            <p className="text-xs text-muted-foreground">{visit.date}</p>
            <p className="font-medium text-brand-gray">{visit.title}</p>
            <p className="text-sm text-muted-foreground">{visit.details}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
