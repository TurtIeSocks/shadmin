import * as React from "react";
import { useReducer, useRef } from "react";
import type { RaRecord, UseUpdateOptions } from "ra-core";
import {
  Form,
  RecordContextProvider,
  useNotify,
  useRecordContext,
  useResourceContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import type { FieldValues } from "react-hook-form";
import isEqual from "lodash/isEqual";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/admin/text-field";
import { TextInput } from "@/components/admin/text-input";

type InPlaceEditorAction =
  | { type: "edit" }
  | { type: "save"; values: FieldValues }
  | { type: "cancel" }
  | { type: "success" }
  | { type: "error"; error: unknown };

type InPlaceEditorState =
  | { state: "editing" }
  | { state: "saving"; values: FieldValues }
  | { state: "reading" };

interface InPlaceEditorProps<
  RecordType extends RaRecord = RaRecord,
  ErrorType = Error,
> {
  source?: string;
  mutationMode?: "optimistic" | "pessimistic" | "undoable";
  mutationOptions?: UseUpdateOptions<RecordType, ErrorType>;
  cancelOnBlur?: boolean;
  notifyOnSuccess?: boolean;
  resource?: string;
  showButtons?: boolean;
  children?: React.ReactNode;
  editor?: React.ReactNode;
  className?: string;
}

/**
 * Displays a record field value that turns into an editable input on click.
 *
 * The editable field is wrapped in its own `<Form>`, so `<InPlaceEditor>` cannot
 * be used inside another `<Form>`. Submits via `useUpdate` from ra-core on
 * Enter (or on blur, depending on `cancelOnBlur`).
 *
 * The component implements a small state machine: `reading` → click →
 * `editing` → submit → `saving` → success → `reading`. Pressing Escape or
 * (when `cancelOnBlur` is true) blurring the input returns to `reading`.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/in-place-editor InPlaceEditor documentation}
 *
 * @example
 * import { InPlaceEditor } from '@/components/admin';
 *
 * const PostTitleEditor = () => (
 *   <InPlaceEditor source="title" />
 * );
 */
function InPlaceEditor<
  RecordType extends RaRecord = RaRecord,
  ErrorType extends Error = Error,
>(props: InPlaceEditorProps<RecordType, ErrorType>) {
  const {
    source,
    mutationMode,
    mutationOptions = {},
    cancelOnBlur = true,
    className,
    showButtons = false,
    notifyOnSuccess,
    children = source ? <TextField source={source} /> : null,
    editor = source ? (
      <TextInput source={source} label={false} helperText={false} autoFocus />
    ) : null,
  } = props;

  if (!source && !children && !editor) {
    throw new Error(
      "InPlaceEditor requires either a source prop, children, or an editor prop",
    );
  }

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [state, dispatch] = useReducer(
    (
      _: InPlaceEditorState,
      action: InPlaceEditorAction,
    ): InPlaceEditorState => {
      switch (action.type) {
        case "edit":
          return { state: "editing" };
        case "save":
          return { state: "saving", values: action.values };
        case "error":
        case "success":
        case "cancel":
          return { state: "reading" };
        default:
          throw new Error("Unhandled InPlaceEditor action");
      }
    },
    { state: "reading" } as InPlaceEditorState,
  );

  const record = useRecordContext<RecordType>(props);
  const resource = useResourceContext(props);
  const notify = useNotify();
  const translate = useTranslate();
  const [update] = useUpdate<RecordType, ErrorType>();

  const {
    meta: mutationMeta,
    onSuccess = () => {
      dispatch({ type: "success" });
      if (mutationMode !== "undoable" && !notifyOnSuccess) return;
      notify("ra.notification.updated", {
        type: "info",
        messageArgs: { smart_count: 1 },
        undoable: mutationMode === "undoable",
      });
    },
    onError = (error: ErrorType) => {
      notify("ra.notification.http_error", {
        type: "error",
        messageArgs: { _: (error as Error)?.message },
      });
      dispatch({ type: "error", error });
    },
    ...otherMutationOptions
  } = mutationOptions;

  const handleSave = async (values: FieldValues) => {
    if (!record) {
      throw new Error("InPlaceEditor: no record found in context");
    }
    if (isEqual(values, record)) {
      dispatch({ type: "cancel" });
      return;
    }
    dispatch({ type: "save", values });
    update(
      resource,
      {
        id: record.id,
        data: values as Partial<RecordType>,
        previousData: record,
        meta: mutationMeta,
      },
      {
        onSuccess,
        onError,
        mutationMode,
        ...otherMutationOptions,
      },
    );
  };

  const handleEdit = () => {
    dispatch({ type: "edit" });
  };
  const handleCancel = () => {
    dispatch({ type: "cancel" });
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      dispatch({ type: "cancel" });
    }
  };
  const handleBlur = (event: React.FocusEvent) => {
    if (event.relatedTarget) {
      return;
    }
    if (cancelOnBlur) {
      dispatch({ type: "cancel" });
      return;
    }
    if (state.state === "editing") {
      // trigger submit to commit the change
      submitButtonRef.current?.click();
    }
  };

  // translate save/cancel labels (used for aria-labels)
  const saveLabel = translate("ra.action.save", { _: "Save" });
  const cancelLabel = translate("ra.action.cancel", { _: "Cancel" });

  const renderContent = () => {
    switch (state.state) {
      case "reading":
        return (
          // biome-ignore lint/a11y/useSemanticElements: click-to-edit wrapper around arbitrary (possibly interactive) children; a native <button> can't contain interactive content, so role="button" with keyboard support is the accessible trigger
          <div
            role="button"
            tabIndex={0}
            aria-label={translate("ra.action.edit", { _: "Edit" })}
            onClick={handleEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleEdit();
              }
            }}
            className={cn(
              "cursor-pointer rounded px-1 py-0.5 hover:bg-muted/50",
            )}
            data-slot="in-place-editor-reading"
          >
            {children}
          </div>
        );
      case "editing":
        return (
          <Form onSubmit={handleSave} record={record}>
            {/* biome-ignore lint/a11y/noStaticElementInteractions: presentational wrapper around the edit form; onKeyDown/onBlur manage form keyboard behavior (Escape-cancel, blur-commit) for the nested controls, they are not a primary interaction */}
            <div
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="flex items-center gap-1"
              data-slot="in-place-editor-editing"
            >
              {editor}
              {/* Hidden submit button — used both as the implicit submit target
                  (when `showButtons` is false) and as the blur-commit handle
                  (when `cancelOnBlur` is false). */}
              <button
                type="submit"
                ref={submitButtonRef}
                style={{ display: "none" }}
                aria-hidden
                tabIndex={-1}
              />
              {showButtons ? (
                <>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    aria-label={saveLabel}
                    className="size-7"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleCancel}
                    aria-label={cancelLabel}
                    className="size-7"
                  >
                    <X className="size-4" />
                  </Button>
                </>
              ) : null}
            </div>
          </Form>
        );
      case "saving":
        // Preview the new value with reduced opacity to avoid flicker
        return (
          <RecordContextProvider value={state.values}>
            <div
              className="opacity-50 px-1 py-0.5"
              data-slot="in-place-editor-saving"
            >
              {children}
            </div>
          </RecordContextProvider>
        );
      default:
        throw new Error("Unhandled InPlaceEditor state");
    }
  };

  return (
    <div className={cn("inline-block", className)} data-slot="in-place-editor">
      {renderContent()}
    </div>
  );
}

export {
  InPlaceEditor,
  type InPlaceEditorAction,
  type InPlaceEditorState,
  type InPlaceEditorProps,
};
