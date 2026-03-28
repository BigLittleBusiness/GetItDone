export type FilterId = "all" | "todo" | "week" | "done";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "week", label: "This Week" },
  { id: "done", label: "Done" },
];

interface TaskFilterBarProps {
  filter: FilterId;
  onChange: (filter: FilterId) => void;
}

export default function TaskFilterBar({ filter, onChange }: TaskFilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filter === f.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
