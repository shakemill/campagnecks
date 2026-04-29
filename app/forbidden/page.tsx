export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="soft-card w-full max-w-lg p-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-gray">Acces refuse</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre role ne permet pas d&apos;acceder a cette section.
        </p>
      </section>
    </main>
  );
}
