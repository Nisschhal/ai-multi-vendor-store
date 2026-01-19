import { inngest } from "@/ingest/client"
import {
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
} from "@/ingest/functions"
import { serve } from "inngest/next"

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncUserCreation, syncUserUpdate, syncUserDeletion],
})
