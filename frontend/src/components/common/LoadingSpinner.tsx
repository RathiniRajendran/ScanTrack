export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="state-panel">
      <div className="spinner" />
      {label && <p>{label}</p>}
    </div>
  );
}
