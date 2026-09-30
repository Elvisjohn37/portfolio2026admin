import type { Metadata } from "next"
import MessagesView from "@/components/messages/MessagesView"

export const metadata: Metadata = {
    title: "Messages",
    description: "Messages sent from the portfolio contact form.",
}

const MessagesPage = () => <MessagesView />

export default MessagesPage
