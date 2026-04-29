type FeuilleCirculationProps = {
  steps: Array<{ label: string; done: boolean }>;
};

export function FeuilleCirculation({ steps }: FeuilleCirculationProps) {
  return (
    <section className="soft-card p-4">
      <h3 className="font-heading text-lg font-semibold text-brand-gray">Feuille de circulation</h3>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`rounded-lg border px-3 py-2 text-sm ${
              step.done ? "border-brand-green bg-green-50 text-brand-green" : "bg-white text-muted-foreground"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </section>
  );
}
