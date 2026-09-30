import cls from "classnames"
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from "react"
import { Icon } from "@/components/ui/Icons"

type FieldProps = {
    label: string
    htmlFor: string
    error?: string
    hint?: string
    required?: boolean
    className?: string
    children: ReactNode
}

/** Label + control + inline error. Every form control goes through this. */
const Field = ({ label, htmlFor, error, hint, required, className, children }: FieldProps) => (
    <div className={cls("min-w-0", className)}>
        <label className="admin-label" htmlFor={htmlFor}>
            {label}
            {required ? <span className="text-[var(--primary)]"> *</span> : null}
        </label>
        {children}
        {error ? (
            <p className="admin-error" id={`${htmlFor}-error`}>
                {error}
            </p>
        ) : hint ? (
            <p className="admin-hint">{hint}</p>
        ) : null}
    </div>
)

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    id: string
    invalid?: boolean
}

const TextInput = ({ id, invalid, className, ...props }: InputProps) => (
    <input
        id={id}
        name={props.name ?? id}
        className={cls("admin-input", className)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        {...props}
    />
)

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    id: string
    invalid?: boolean
}

const Textarea = ({ id, invalid, className, rows = 4, ...props }: TextareaProps) => (
    <textarea
        id={id}
        name={props.name ?? id}
        rows={rows}
        className={cls("admin-textarea", className)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        {...props}
    />
)

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    id: string
    invalid?: boolean
    options: Option[]
    placeholder?: string
}

const Select = ({
    id,
    invalid,
    options,
    placeholder,
    className,
    ...props
}: SelectProps) => (
    <select
        id={id}
        name={props.name ?? id}
        className={cls("admin-select", className)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        {...props}
    >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
)

type SwitchFieldProps = {
    id: string
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    hint?: string
    disabled?: boolean
}

const SwitchField = ({
    id,
    label,
    checked,
    onChange,
    hint,
    disabled,
}: SwitchFieldProps) => (
    <div className="min-w-0">
        <label className="admin-switch" htmlFor={id}>
            <input
                id={id}
                name={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={event => onChange(event.target.checked)}
            />
            <span className="admin-switch__track" aria-hidden="true" />
            <span>{label}</span>
        </label>
        {hint ? <p className="admin-hint">{hint}</p> : null}
    </div>
)

const FormAlert = ({ message }: { message?: string }) =>
    message ? (
        <div className="admin-alert admin-alert--danger" role="alert">
            <Icon name="alert" size={16} />
            <span>{message}</span>
        </div>
    ) : null

export { Field, TextInput, Textarea, Select, SwitchField, FormAlert }
export default Field
