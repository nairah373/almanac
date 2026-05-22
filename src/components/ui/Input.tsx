import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink " +
  "placeholder:text-faint outline-none transition " +
  "focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:opacity-60";

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-soft">
      {children}
    </label>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, id, className, ...props }: InputProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <input id={fieldId} className={cn(fieldClass, "h-11", className)} {...props} />
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export function Textarea({ label, hint, id, className, ...props }: TextareaProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <textarea
        id={fieldId}
        className={cn(fieldClass, "py-2.5 min-h-24 resize-y", className)}
        {...props}
      />
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

export function Select({
  label,
  hint,
  id,
  className,
  children,
  ...props
}: SelectProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <select
        id={fieldId}
        className={cn(fieldClass, "h-11 appearance-none bg-no-repeat pr-9", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236d6b63' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: "right 0.75rem center",
        }}
        {...props}
      >
        {children}
      </select>
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
