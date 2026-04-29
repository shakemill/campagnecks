type FacturePreviewProps = {
  total: number;
  assureurPart: number;
};

export function FacturePreview({ total, assureurPart }: FacturePreviewProps) {
  const patientPart = total - assureurPart;

  return (
    <section className="soft-card p-4">
      <h3 className="font-heading text-lg font-semibold text-brand-gray">Apercu facture</h3>
      <div className="mt-3 space-y-2 text-sm">
        <p className="flex justify-between">
          <span>Total</span>
          <strong>{total.toLocaleString()} FCFA</strong>
        </p>
        <p className="flex justify-between">
          <span>Part assureur</span>
          <strong>{assureurPart.toLocaleString()} FCFA</strong>
        </p>
        <p className="flex justify-between">
          <span>Part patient</span>
          <strong>{patientPart.toLocaleString()} FCFA</strong>
        </p>
      </div>
    </section>
  );
}
