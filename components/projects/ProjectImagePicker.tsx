"use client"

import { useEffect, useRef, useState } from "react"
import { portfolioMediaUrl } from "@/lib/portfolio-url"
import Button from "@/components/ui/Button"

export type SelectedImage = { file?: File; url?: string; name: string }

function Preview({ image }: { image: SelectedImage }) {
    const [localUrl, setLocalUrl] = useState("")
    useEffect(() => {
        if (!image.file) return
        const url = URL.createObjectURL(image.file)
        setLocalUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [image.file])
    const src = image.file ? localUrl : portfolioMediaUrl(image.url ?? "")
    // eslint-disable-next-line @next/next/no-img-element
    return src ? <img src={src} alt={image.name} width={140} height={90} style={{ width: "100%", height: 90, objectFit: "contain", borderRadius: 8 }} /> : null
}

export default function ProjectImagePicker({ label, images, multiple = false, disabled, onChange }: {
    label: string; images: SelectedImage[]; multiple?: boolean; disabled: boolean; onChange: (images: SelectedImage[]) => void
}) {
    const input = useRef<HTMLInputElement>(null)
    const [error, setError] = useState("")
    return (
        <section style={{ padding: 16, border: "1px dashed var(--border-subtle)", borderRadius: 12, display: "grid", gap: 12 }} aria-label={label}>
            <div className="admin-row" style={{ justifyContent: "space-between" }}>
                <strong>{label}</strong>
                <Button type="button" variant="soft" disabled={disabled} onClick={() => input.current?.click()}>
                    {multiple ? "Choose gallery images" : `Choose ${label.toLowerCase()}`}
                </Button>
            </div>
            <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple={multiple}
                hidden disabled={disabled} aria-label={`Choose ${label.toLowerCase()} from device`}
                onChange={event => {
                    const files = Array.from(event.target.files ?? [])
                    event.target.value = ""
                    if (!files.length) return
                    if (files.some(file => !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 3 * 1024 * 1024 || !file.size)) {
                        setError("Choose PNG, JPEG, WebP, or GIF images, up to 3 MB each."); return
                    }
                    setError("")
                    const selected = files.map(file => ({ file, name: file.name }))
                    onChange(multiple ? [...images, ...selected] : selected.slice(0, 1))
                }} />
            <p className="admin-cell__sub">Select from your device. PNG, JPEG, WebP or GIF · up to 3 MB each. Uploaded when you save.</p>
            {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                {images.map((image, index) => <div key={`${image.name}-${index}`} style={{ minWidth: 0 }}>
                    <Preview image={image} />
                    <p className="admin-cell__sub truncate" title={image.name}>{image.name}</p>
                    <Button variant="ghost" size="sm" disabled={disabled} aria-label={`Remove ${image.name}`} onClick={() => onChange(images.filter((_, i) => i !== index))}>Remove</Button>
                </div>)}
            </div>
        </section>
    )
}
