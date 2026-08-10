export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-white/70 px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">{description}</p> : null}
      {action}
    </div>
  )
}
