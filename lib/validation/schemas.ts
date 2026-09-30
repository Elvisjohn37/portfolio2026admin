import * as yup from "yup"
import { emailField, objectId, optionalText, optionalUrl, requiredText } from "./common"

/* ------------------------------------ auth ---------------------------------- */

export const loginSchema = yup.object({
    email: emailField("Email"),
    password: yup.string().required("Password is required"),
})

export type LoginValues = yup.InferType<typeof loginSchema>

export const profileSchema = yup.object({
    name: requiredText("Name", 120),
    email: emailField("Email"),
    role: yup.string().oneOf(["admin", "editor"]).default("admin"),
    isActive: yup.boolean().default(true),
})

export const changePasswordSchema = yup.object({
    currentPassword: yup.string().required("Your current password is required"),
    password: yup
        .string()
        .required("A new password is required")
        .min(8, "Use at least 8 characters")
        .matches(/[a-z]/, "Include at least one lowercase letter")
        .matches(/[A-Z]/, "Include at least one uppercase letter")
        .matches(/[0-9]/, "Include at least one number"),
    passwordConfirmation: yup
        .string()
        .required("Please confirm the new password")
        .oneOf([yup.ref("password")], "Passwords do not match"),
})

export type ChangePasswordValues = yup.InferType<typeof changePasswordSchema>

/**
 * Own account details. The API validates this with the same `profileSchema` as
 * the Team endpoints, where role/isActive carry defaults - `AccountView` always
 * sends the current ones so saving a name can never rewrite a role.
 */
export const accountProfileSchema = yup.object({
    name: requiredText("Name", 120).min(2, "Name is too short"),
    email: emailField("Email"),
})

export type AccountProfileValues = yup.InferType<typeof accountProfileSchema>


/* ----------------------------------- profile -------------------------------- */

export const aboutSchema = yup.object({
    firstName: requiredText("First name", 80),
    middleName: optionalText(80),
    lastName: requiredText("Last name", 80),
    position: optionalText(120),
    about1: optionalText(1200),
    about2: optionalText(2500),
    address: optionalText(200),
    province: optionalText(120),
    country: optionalText(120),
    degree: optionalText(200),
    school: optionalText(200),
    schoolYear: optionalText(80),
    avatar: optionalText(400),
    email: yup
        .string()
        .trim()
        .default("")
        .test("is-email-or-empty", "Enter a valid email address", value =>
            !value ? true : /^\S+@\S+\.\S+$/.test(value),
        ),
    phone: optionalText(60),
    github: optionalUrl("GitHub link"),
    linkedin: optionalUrl("LinkedIn link"),
    resumeUrl: optionalText(400),
    yearsOfExperience: yup
        .number()
        .typeError("Years of experience must be a number")
        .min(0, "Cannot be negative")
        .max(80, "That looks too high")
        .default(0),
})

export type AboutValues = yup.InferType<typeof aboutSchema>

/* -------------------------------- tech stacks ------------------------------- */

export const techStackSchema = yup.object({
    techStack: requiredText("Tech stack name", 60),
    order: yup.number().typeError("Order must be a number").integer("Use a whole number").default(0),
})

export type TechStackValues = yup.InferType<typeof techStackSchema>

export const aboutBlockSchema = yup.object({
    name: requiredText("Name", 80),
    description: requiredText("Description", 600),
    about: objectId("Profile"),
    techStack: objectId("Stack group"),
    order: yup.number().typeError("Order must be a number").integer("Use a whole number").default(0),
    isPublished: yup.boolean().default(true),
})

export type AboutBlockValues = yup.InferType<typeof aboutBlockSchema>

/* --------------------------------- projects --------------------------------- */

const techStackNames = yup
    .array()
    .of(yup.string().trim().max(60, "Keep names short").required())
    .default([])

export const projectSchema = yup.object({
    name: requiredText("Project name", 140),
    description: optionalText(140),
    info: optionalText(3000),
    logoSrc: optionalText(400),
    thumbnail: optionalText(400),
    images: yup.array().of(yup.string().trim().max(400).required()).default([]),
    url: optionalUrl("Project link"),
    techStacks: yup
        .object({
            frontend: techStackNames,
            backend: techStackNames,
            tools: techStackNames,
        })
        .default({ frontend: [], backend: [], tools: [] }),
    featured: yup.boolean().default(true),
    isPublished: yup.boolean().default(true),
    order: yup.number().typeError("Order must be a number").integer("Use a whole number").default(0),
})

export type ProjectValues = yup.InferType<typeof projectSchema>

/* ------------------------------ work experience ----------------------------- */

export const workExperienceSchema = yup.object({
    title: requiredText("Role title", 140),
    company: requiredText("Company", 140),
    start: requiredText("Start label", 60),
    startDate: optionalText(20),
    end: optionalText(60),
    endDate: optionalText(20),
    focus: optionalText(400),
    highlights: yup.array().of(yup.string().trim().max(600).required()).default([]),
    skills: yup.array().of(yup.string().trim().max(80).required()).default([]),
    projects: yup.array().of(yup.string().trim().matches(/^[0-9a-fA-F]{24}$/)).default([]),
    isPublished: yup.boolean().default(true),
    order: yup.number().typeError("Order must be a number").integer("Use a whole number").default(0),
})

export type WorkExperienceValues = yup.InferType<typeof workExperienceSchema>

/* --------------------------------- messages --------------------------------- */

export const messageUpdateSchema = yup.object({
    status: yup.string().oneOf(["new", "read", "replied", "archived"]).required(),
    starred: yup.boolean().default(false),
})

/* ----------------------------------- team ----------------------------------- */

/** Mirrors `profileSchema` on the API (name / email / role / isActive). */
export const teamMemberSchema = yup.object({
    name: requiredText("Name", 120),
    email: emailField("Email"),
    role: yup.string().oneOf(["admin", "editor"]).default("editor"),
    isActive: yup.boolean().default(true),
})

const PASSWORD_HINT =
    "Use at least 8 characters with an uppercase letter, a lowercase letter and a number"

const isStrongPassword = (value: string) =>
    value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value)

/**
 * One schema drives both Team dialogs: the password is mandatory (and strength
 * checked) only while creating, because the API's update endpoint ignores it.
 */
export const memberFormSchema = (isCreate: boolean) =>
    teamMemberSchema.shape({
        password: yup
            .string()
            .default("")
            .test("password-required", "Password is required", value =>
                !isCreate || Boolean(value?.trim()),
            )
            .test(
                "password-strength",
                PASSWORD_HINT,
                value => !isCreate || !value || isStrongPassword(value),
            ),
    })

/** Kept for API-shape parity: the create payload always carries a password. */
export const createTeamMemberSchema = memberFormSchema(true)

export type TeamMemberValues = yup.InferType<typeof createTeamMemberSchema>
export type TeamMemberEditValues = yup.InferType<typeof teamMemberSchema>
/** Shared values of the create/edit member dialog (`password` is "" on edit). */
export type TeamMemberFormValues = TeamMemberValues
export { PASSWORD_HINT }

