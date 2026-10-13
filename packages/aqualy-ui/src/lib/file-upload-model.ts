export interface UploadPolicy { accept?: string; maxSize?: number; maxFiles?: number; multiple?: boolean }
export type FileRejectionCode = "empty" | "type" | "size" | "count" | "duplicate"
export interface FileRejection { file: File; code: FileRejectionCode; message: string }
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`
  return `${Number((bytes / 1048576).toFixed(1))} MB`
}
export const fileIdentity = (file: File) => JSON.stringify([file.name, file.size, file.type, file.lastModified])
export function validateUploadFiles(files: readonly File[], existing: readonly File[], policy: UploadPolicy) {
  const maxFiles = policy.multiple ? policy.maxFiles ?? 5 : 1
  const maxSize = policy.maxSize ?? 10 * 1048576
  if (!Number.isInteger(maxFiles) || maxFiles < 1 || !Number.isFinite(maxSize) || maxSize <= 0) throw new RangeError("Upload limits must be positive; maxFiles must be an integer.")
  const tokens = (policy.accept ?? "").split(",").map(token => token.trim().toLowerCase()).filter(Boolean)
  const seen = new Set(existing.map(fileIdentity)), accepted: File[] = [], rejected: FileRejection[] = []
  for (const file of files) {
    let code: FileRejectionCode | undefined, message = ""
    if (!file.size) { code = "empty"; message = "Empty files cannot be uploaded." }
    else if (tokens.length && !tokens.some(token => token.startsWith(".") ? file.name.toLowerCase().endsWith(token) : token.endsWith("/*") ? file.type.toLowerCase().startsWith(token.slice(0, -1)) : file.type.toLowerCase() === token)) { code = "type"; message = "This file type is not supported." }
    else if (file.size > maxSize) { code = "size"; message = `File exceeds the ${formatFileSize(maxSize)} limit.` }
    else if (seen.has(fileIdentity(file))) { code = "duplicate"; message = "This file is already in the queue." }
    else if (existing.length + accepted.length >= maxFiles) { code = "count"; message = `Maximum ${maxFiles} ${maxFiles === 1 ? "file" : "files"}. Remove an existing file first.` }
    if (code) rejected.push({ file, code, message })
    else { accepted.push(file); seen.add(fileIdentity(file)) }
  }
  return { accepted, rejected }
}
