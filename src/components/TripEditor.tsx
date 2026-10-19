"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { dateFormatError, isIsoDate } from "@/lib/schengen/dates";
import type { Trip } from "@/lib/trips";
import { DateField } from "./dashboard/DateField";

type TripEditorProps = {
  initial: Trip | null;
  onSave: (trip: Trip) => void;
  onCancel: () => void;
};

// Same rules and messages as PR #1's hand-written validation.
const schema = z
  .object({ entry: z.string(), exit: z.string().catch(""), open: z.boolean() })
  .superRefine((v, ctx) => {
    if (!isIsoDate(v.entry)) {
      ctx.addIssue({ code: "custom", path: ["entry"], message: dateFormatError(v.entry) ?? "Enter an entry date." });
      return;
    }
    if (v.open) return;
    if (!isIsoDate(v.exit)) {
      ctx.addIssue({ code: "custom", path: ["exit"], message: dateFormatError(v.exit) ?? "Enter an exit date, or mark the trip as still in the Schengen area." });
      return;
    }
    if (v.exit < v.entry) ctx.addIssue({ code: "custom", path: ["exit"], message: "The exit date is before the entry date." });
  });
type Values = z.infer<typeof schema>;

export function TripEditor({ initial, onSave, onCancel }: TripEditorProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { entry: initial?.entry ?? "", exit: initial?.exit ?? "", open: initial ? initial.exit === null : false },
  });
  const open = watch("open");
  function syncFromDom(form: HTMLFormElement) {
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;
    const entry = field("entry");
    const exit = field("exit");
    const openBox = field("open");
    const isOpen = openBox ? openBox.checked : false;
    if (entry) setValue("entry", entry.value.trim(), { shouldDirty: true });
    if (openBox) setValue("open", isOpen, { shouldDirty: true });
    // An open stay ignores the exit field, whatever is typed in it.
    setValue("exit", isOpen ? "" : (exit?.value ?? "").trim(), { shouldDirty: true });
  }
  const firstError = errors.entry?.message ?? errors.exit?.message;

  return (
    <form
      data-testid="trip-form"
      noValidate
      onSubmit={(event) => {
        // Read what is actually in the fields. A value set without a change
        // event (autofill, scripted input) would otherwise be missed.
        syncFromDom(event.currentTarget);
        return handleSubmit((v) => onSave({ id: initial?.id ?? crypto.randomUUID(), entry: v.entry, exit: v.open ? null : v.exit }))(event);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="trip-entry" testId="trip-entry" label="Entered" autoFocus error={errors.entry ? "" : undefined} aria-describedby="trip-form-error" {...register("entry")} />
        <DateField
          id="trip-exit"
          testId="trip-exit"
          label="Left"
          aria-disabled={open || undefined}
          error={errors.exit ? "" : undefined} aria-describedby="trip-form-error"
          readOnly={open}
          {...register("exit")}
        />
      </div>
      <label htmlFor="trip-open" className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-paper-warm px-4 text-sm">
        <input id="trip-open" data-testid="trip-open" type="checkbox" className="size-5 accent-ink" {...register("open")} />
        I&apos;m still in the Schengen area
      </label>
      {firstError ? (
        <p id="trip-form-error" data-testid="trip-form-error" role="alert" className="rounded-xl bg-risk-wash p-3 text-sm text-risk">{firstError}</p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" data-testid="trip-cancel" onClick={onCancel}
          className="focus-ring h-12 rounded-full px-5 hover:bg-paper-sunk">
          Cancel
        </button>
        <button type="submit" data-testid="trip-save"
          className="focus-ring h-12 rounded-full bg-solar px-6 font-medium text-ink transition-[background,transform] duration-200 hover:bg-solar-deep active:scale-[.98]">
          {initial ? "Save changes" : "Save trip"}
        </button>
      </div>
    </form>
  );
}
