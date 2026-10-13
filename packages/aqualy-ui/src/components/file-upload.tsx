"use client"

import * as React from "react"
import { FileText, Upload, X, RotateCcw } from "lucide-react"
import { Button } from "#components/button"
import { Badge } from "#components/badge"
import { Field, FieldHeader, FieldLabel, FieldDescription, FieldError } from "#components/field"
import { cn } from "#lib/utils"
import { validateUploadFiles, formatFileSize, type UploadPolicy, type FileRejection } from "#lib/file-upload-model"
export { validateUploadFiles, formatFileSize } from "#lib/file-upload-model"
export type { UploadPolicy, FileRejection, FileRejectionCode } from "#lib/file-upload-model"

export type UploadStatus = "queued" | "uploading" | "processing" | "uploaded" | "failed" | "cancelled"
export interface UploadEntry { id: string; file: File; status: UploadStatus; progress: number; error?: string }
export type UploadHandler = (file: File, context: { signal: AbortSignal; onProgress: (percent: number) => void }) => Promise<void>
export interface UseFileUploadOptions extends UploadPolicy {
  uploadFile: UploadHandler; autoUpload?: boolean; disabled?: boolean
  failureMessage?: string; onFilesChange?: (files: readonly UploadEntry[]) => void
  onUploadComplete?: (file: File) => void; onUploadError?: (file: File, error: unknown) => void
}
export function useFileUpload(options: UseFileUploadOptions) {
  const [files, setFiles] = React.useState<UploadEntry[]>([]), [rejections, setRejections] = React.useState<FileRejection[]>([])
  const entries = React.useRef<UploadEntry[]>([]), controllers = React.useRef(new Map<string, AbortController>()), mounted = React.useRef(true)
  const counter = React.useRef(0), prefix = React.useId()
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; controllers.current.forEach(controller => controller.abort()); controllers.current.clear() } }, [])
  const commit = (next: UploadEntry[]) => { if (!mounted.current) return; entries.current = next; setFiles(next); options.onFilesChange?.(next) }
  const patch = (id: string, changes: Partial<UploadEntry>) => commit(entries.current.map(entry => entry.id === id ? { ...entry, ...changes } : entry))
  const start = async (id: string) => {
    const entry = entries.current.find(item => item.id === id)
    if (options.disabled || !entry || !["queued", "failed", "cancelled"].includes(entry.status) || controllers.current.has(id)) return
    const controller = new AbortController(); controllers.current.set(id, controller); patch(id, { status: "uploading", progress: 0, error: undefined })
    const active = () => mounted.current && !controller.signal.aborted && controllers.current.get(id) === controller
    let confirmed = false
    try {
      await options.uploadFile(entry.file, { signal: controller.signal, onProgress: percent => {
        if (!active() || !Number.isFinite(percent)) return
        const previous = entries.current.find(item => item.id === id)?.progress ?? 0
        const progress = Math.max(previous, Math.min(100, Math.max(0, percent)))
        patch(id, { progress, status: progress === 100 ? "processing" : "uploading" })
      } })
      if (active()) { patch(id, { status: "uploaded", progress: 100 }); confirmed = true }
    } catch (error: unknown) {
      if (active()) { patch(id, { status: "failed", error: options.failureMessage ?? "Upload failed. Retry this file or choose another." }); options.onUploadError?.(entry.file, error) }
    } finally { if (controllers.current.get(id) === controller) controllers.current.delete(id) }
    // Consumer callbacks cannot turn a confirmed transfer into a retryable failure.
    if (confirmed) options.onUploadComplete?.(entry.file)
  }
  const addFiles = (selected: readonly File[]) => {
    if (options.disabled) return
    const result = validateUploadFiles(selected, entries.current.map(entry => entry.file), options)
    setRejections(result.rejected)
    const added = result.accepted.map(file => ({ id: `${prefix}-${++counter.current}`, file, progress: 0, status: "queued" as const }))
    if (added.length) { commit([...entries.current, ...added]); if (options.autoUpload) added.forEach(entry => { void start(entry.id) }) }
  }
  const cancel = (id: string) => {
    const entry = entries.current.find(item => item.id === id)
    if (options.disabled || !entry || !["uploading", "queued"].includes(entry.status)) return
    controllers.current.get(id)?.abort(); controllers.current.delete(id); patch(id, { status: "cancelled" })
  }
  const remove = (id: string) => {
    if (options.disabled || entries.current.find(item => item.id === id)?.status === "processing") return
    controllers.current.get(id)?.abort(); controllers.current.delete(id); commit(entries.current.filter(item => item.id !== id))
  }
  return { files, rejections, addFiles, start, cancel, remove, startAll: () => entries.current.forEach(entry => { void start(entry.id) }), clear: () => entries.current.forEach(entry => remove(entry.id)) }
}

const DEFAULT_LABELS = { choose: "Choose files or drag them here", drop: "Drop files here", upload: "Upload files", cancel: "Cancel", retry: "Retry", remove: "Remove", clear: "Clear queue", queue: "Upload queue", queued: "Queued", uploading: "Uploading", processing: "Confirming", uploaded: "Uploaded", failed: "Failed", cancelled: "Cancelled", empty: "No files selected.", folders: "Folders are not supported. Choose individual files." }
export type FileUploadLabels = typeof DEFAULT_LABELS
export interface FileUploadProps extends UseFileUploadOptions, Omit<React.ComponentProps<"div">, "children" | "onError"> {
  label: React.ReactNode; description?: React.ReactNode; policyDescription?: React.ReactNode; compact?: boolean; labels?: Partial<FileUploadLabels>
}
function FileThumbnail({ file }: { file: File }) {
  const [url, setUrl] = React.useState<string>()
  React.useEffect(() => {
    // Only supported raster images are previewed; SVG/HTML remain ordinary file rows.
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return
    const address = URL.createObjectURL(file); setUrl(address); return () => URL.revokeObjectURL(address)
  }, [file])
  return <span className="aq-upload-thumbnail" aria-hidden="true">{url ? <img src={url} alt="" /> : <FileText />}</span>
}
export function FileUpload({ label, description, policyDescription, labels: overrides, compact, className, id: suppliedId, uploadFile, accept, maxSize = 10 * 1048576, maxFiles = 5, multiple = false, autoUpload = false, disabled = false, failureMessage, onFilesChange, onUploadComplete, onUploadError, ...props }: FileUploadProps) {
  const generatedId = React.useId(), id = suppliedId ?? generatedId, labels = { ...DEFAULT_LABELS, ...overrides }
  const queue = useFileUpload({ uploadFile, accept, maxSize, maxFiles, multiple, autoUpload, disabled, failureMessage, onFilesChange, onUploadComplete, onUploadError })
  const input = React.useRef<HTMLInputElement>(null), depth = React.useRef(0), [dragging, setDragging] = React.useState(false), [folderError, setFolderError] = React.useState(false)
  const descriptionId = `${id}-help`, errorId = `${id}-error`, policyId = `${id}-policy`
  const limit = multiple ? maxFiles : 1, invalid = folderError || queue.rejections.length > 0
  const active = queue.files.some(entry => ["queued", "uploading", "processing"].includes(entry.status))
  const summary = queue.files.length ? `${queue.files.filter(entry => entry.status === "uploaded").length} / ${queue.files.length} ${labels.uploaded.toLowerCase()}` : labels.empty
  const percent = queue.files.length ? Math.round(queue.files.reduce((sum, entry) => sum + entry.progress, 0) / queue.files.length) : 0
  return <div {...props} className={cn("aq-file-upload", className)} data-slot="file-upload" data-compact={compact || undefined} data-has-files={queue.files.length > 0 || undefined}>
    <Field data-disabled={disabled || undefined} data-invalid={invalid || undefined}><FieldHeader><FieldLabel htmlFor={`${id}-choose`}>{label}</FieldLabel>{description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}{invalid && <FieldError id={errorId}>{folderError && <p>{labels.folders}</p>}{queue.rejections.map((rejection, index) => <p key={index}><bdi>{rejection.file.name}</bdi>: {rejection.message}</p>)}</FieldError>}</FieldHeader>
      <button id={`${id}-choose`} type="button" disabled={disabled} className="aq-upload-dropzone" data-dragging={dragging || undefined} aria-invalid={invalid || undefined} aria-describedby={[description ? descriptionId : null, policyId, invalid ? errorId : null].filter(Boolean).join(" ")} onClick={() => input.current?.click()}
        onDragEnter={event => { event.preventDefault(); if (!disabled && event.dataTransfer.types.includes("Files")) { depth.current++; setDragging(true) } }} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? "none" : "copy" }} onDragLeave={event => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false) }} onDrop={event => {
          event.preventDefault(); depth.current = 0; setDragging(false); if (disabled) return
          const folders = Array.from(event.dataTransfer.items).some(item => item.webkitGetAsEntry?.()?.isDirectory)
          setFolderError(folders); queue.addFiles(Array.from(event.dataTransfer.files).filter(file => file.size > 0 || !folders))
        }}><span className="aq-upload-icon" aria-hidden="true"><Upload /></span><span><strong>{dragging ? labels.drop : labels.choose}</strong><span className="aq-upload-policy" id={policyId}>{policyDescription ?? <bdi>{accept || "Any file type"} · {formatFileSize(maxSize)} each · Maximum {limit}</bdi>}</span></span></button>
      <input ref={input} className="aq-sr-only" tabIndex={-1} type="file" accept={accept} multiple={multiple} disabled={disabled} aria-label={`${typeof label === "string" ? label : labels.queue} files`} onChange={event => { setFolderError(false); queue.addFiles(Array.from(event.target.files ?? [])); event.target.value = "" }} />
    </Field>
    {queue.files.length > 0 && <><ul className="aq-upload-list" aria-label={labels.queue}>{queue.files.map(entry => <li data-status={entry.status} key={entry.id} className="aq-upload-entry"><div className="aq-upload-file-main"><FileThumbnail file={entry.file} /><div className="aq-upload-copy"><bdi>{entry.file.name}</bdi><small><bdi>{formatFileSize(entry.file.size)}</bdi></small></div><Badge size="sm" loading={["uploading", "processing"].includes(entry.status)} variant={entry.status === "failed" ? "danger" : entry.status === "uploaded" ? "success" : entry.status === "processing" || entry.status === "uploading" ? "info" : "secondary"}>{labels[entry.status]}</Badge></div>
      {entry.status !== "queued" && <div role="progressbar" aria-label={`${entry.file.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={entry.progress} aria-valuetext={`${entry.progress}% · ${labels[entry.status]}`} className="aq-upload-track"><span style={{ inlineSize: `${entry.progress}%` }} /></div>}
      <div className="aq-upload-bottom">{entry.error && <span className="aq-upload-error">{entry.error}</span>}<div className="aq-upload-actions">{["uploading", "queued"].includes(entry.status) && <Button size="xs" variant="ghost" disabled={disabled} aria-label={`${labels.cancel} ${entry.file.name}`} onClick={() => queue.cancel(entry.id)}>{labels.cancel}</Button>}{["failed", "cancelled"].includes(entry.status) && <Button size="xs" variant="outline" disabled={disabled} aria-label={`${labels.retry} ${entry.file.name}`} onClick={() => { void queue.start(entry.id) }}><RotateCcw data-icon="inline-start" />{labels.retry}</Button>}<Button size="icon-xs" variant="ghost" disabled={disabled || entry.status === "processing"} aria-label={`${labels.remove} ${entry.file.name}`} onClick={() => queue.remove(entry.id)}><X /></Button></div></div>
    </li>)}</ul><div className="aq-upload-batch"><span>{summary}</span><div role="progressbar" aria-label="Batch upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="aq-upload-track"><span style={{ inlineSize: `${percent}%` }} /></div></div><div className="aq-upload-footer"><Button size="sm" disabled={disabled || !queue.files.some(entry => entry.status === "queued")} onClick={queue.startAll}><Upload data-icon="inline-start" />{labels.upload}</Button><Button size="sm" variant="ghost" disabled={disabled || queue.files.some(entry => entry.status === "processing")} onClick={queue.clear}>{labels.clear}</Button></div></>}
    <p role="status" aria-atomic="true" className="aq-upload-announcement">{summary}{active ? ` · ${queue.files.filter(entry => entry.status === "uploading").length} ${labels.uploading.toLowerCase()}` : ""}</p>
  </div>
}
