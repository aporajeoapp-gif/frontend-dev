export default function ListLoader({ label = "Loading data..." }) {
  return (
    <div className="py-16 text-center text-slate-400 dark:text-slate-500">
      <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-primary-500/30 border-t-primary-600 animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
