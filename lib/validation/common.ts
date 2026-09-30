import * as yup from "yup"

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/

/** Free text that may legitimately be empty (mirrors the API schema). */
const optionalText = (max = 5000) =>
    yup
        .string()
        .trim()
        .max(max, `Must be ${max} characters or fewer`)
        .default("")

/** Absolute http(s) URL, or an empty string. */
const optionalUrl = (label = "URL") =>
    yup
        .string()
        .trim()
        .default("")
        .test(
            "is-url-or-empty",
            `${label} must start with http:// or https://`,
            value => !value || /^https?:\/\/[^\s]+$/i.test(value),
        )

/** Free text that must be filled in. */
const requiredText = (label: string, max = 200) =>
    yup
        .string()
        .trim()
        .required(`${label} is required`)
        .max(max, `${label} must be ${max} characters or fewer`)

const emailField = (label = "Email") =>
    yup
        .string()
        .trim()
        .required(`${label} is required`)
        .email(`${label} must be valid`)

const objectId = (label = "Id") =>
    yup
        .string()
        .trim()
        .matches(OBJECT_ID_PATTERN, `${label} is required`)
        .required(`${label} is required`)

const stringArray = (max = 500) =>
    yup
        .array()
        .of(yup.string().trim().max(max, `Each entry must be ${max} characters or fewer`).required())
        .default([])

const numberField = (label: string, { min = 0, max = 100000 } = {}) =>
    yup
        .number()
        .typeError(`${label} must be a number`)
        .min(min, `${label} cannot be lower than ${min}`)
        .max(max, `${label} looks too high`)
        .default(0)

/** Password policy shared by sign-up and password changes. */
const passwordField = (label = "Password") =>
    yup
        .string()
        .required(`${label} is required`)
        .min(8, "Use at least 8 characters")
        .matches(/[a-z]/, "Include at least one lowercase letter")
        .matches(/[A-Z]/, "Include at least one uppercase letter")
        .matches(/[0-9]/, "Include at least one number")

export {
    OBJECT_ID_PATTERN,
    optionalText,
    optionalUrl,
    requiredText,
    emailField,
    objectId,
    stringArray,
    numberField,
    passwordField,
}
