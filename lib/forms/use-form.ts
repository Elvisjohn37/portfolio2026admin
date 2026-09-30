"use client"

import { useCallback, useMemo, useState } from "react"
import * as yup from "yup"
import { ApiError } from "@/lib/api"

type FieldValues = Record<string, unknown>

type UseFormOptions<T extends FieldValues> = {
    initialValues: T
    validationSchema: yup.ObjectSchema<T>
    onSubmit: (values: T) => Promise<void> | void
}

type FormApi<T extends FieldValues> = {
    values: T
    errors: Record<string, string>
    isSubmitting: boolean
    isDirty: boolean
    /** Nested-safe setter: `setValue("techStacks.frontend", [...])`. */
    setValue: <K extends keyof T>(name: K, value: T[K]) => void
    setError: (name: string, message: string) => void
    clearError: (name: string) => void
    reset: (next?: Partial<T>) => void
    handleSubmit: (event?: { preventDefault: () => void }) => Promise<void>
}

const setDeep = (target: FieldValues, path: string, value: unknown) => {
    const keys = path.split(".")
    const last = keys.pop() as string
    let cursor: FieldValues = target

    keys.forEach(key => {
        cursor[key] =
            cursor[key] && typeof cursor[key] === "object" ? { ...(cursor[key] as FieldValues) } : {}
        cursor = cursor[key] as FieldValues
    })

    cursor[last] = value
}

/**
 * Tiny yup-powered form state: validates locally before hitting the API and
 * merges back the `errors` object returned by the server (422 responses).
 */
const useForm = <T extends FieldValues>({
    initialValues,
    validationSchema,
    onSubmit,
}: UseFormOptions<T>): FormApi<T> => {
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [
        initialValues,
        values,
    ])

    const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
        setValues(previous => {
            const next = { ...previous }
            setDeep(next as FieldValues, String(name), value)
            return next
        })
        setErrors(previous => {
            if (!previous[String(name)]) return previous
            const next = { ...previous }
            delete next[String(name)]
            return next
        })
    }, [])

    const setError = useCallback((name: string, message: string) => {
        setErrors(previous => ({ ...previous, [name]: message }))
    }, [])

    const clearError = useCallback((name: string) => {
        setErrors(previous => {
            if (!previous[name]) return previous
            const next = { ...previous }
            delete next[name]
            return next
        })
    }, [])

    const reset = useCallback(
        (next?: Partial<T>) => {
            setValues({ ...initialValues, ...next })
            setErrors({})
        },
        [initialValues],
    )

    const handleSubmit = useCallback(
        async (event?: { preventDefault: () => void }) => {
            event?.preventDefault()

            try {
                await validationSchema.validate(values, { abortEarly: false })
            } catch (validationError) {
                if (validationError instanceof yup.ValidationError) {
                    const mapped: Record<string, string> = {}

                    validationError.inner.forEach(issue => {
                        if (issue.path && !mapped[issue.path]) mapped[issue.path] = issue.message
                    })

                    setErrors(mapped)
                }

                return
            }

            setErrors({})
            setIsSubmitting(true)

            try {
                await onSubmit(values)
            } catch (error) {
                if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
                    setErrors(error.errors)
                } else if (error instanceof ApiError) {
                    setErrors({ form: error.message })
                } else {
                    setErrors({ form: "Something went wrong - please try again" })
                }
            } finally {
                setIsSubmitting(false)
            }
        },
        [onSubmit, validationSchema, values],
    )

    return {
        values,
        errors,
        isSubmitting,
        isDirty,
        setValue,
        setError,
        clearError,
        reset,
        handleSubmit,
    }
}

export { useForm }
export default useForm
