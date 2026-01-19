# Next.js Setup

    - added all pages, components, and assets

# Clerk Setup for Authentication

    - installed @clerk/nextjs
    - copied clerk env variables from .env.local to .env
    - added Clerk middleware [proxy.ts] at root level
    - wrapped Layout.tsx with ClerkProvider at root level

# Prisma Setup with Postgres Neon Database

    - follow https://www.prisma.io/docs/getting-started/prisma-orm/add-to-existing-project/prisma-postgres
    - install deps
    - init prisma
    - run prisma migrate dev --name <migration_name> : creates migration file



    ## Prisma Client
        - npx prisma generate : creates /generated/prisma/client.ts
            - configure were to output this client in prisma.schema file
        - create instance of prisma client
            - follow [https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help)
            - you need to add adapter in new PrismaClient() as mentioned in [https://www.prisma.io/docs/guides/multiple-databases#3-prepare-the-application-to-use-multiple-prisma-clients](https://www.prisma.io/docs/guides/multiple-databases#3-prepare-the-application-to-use-multiple-prisma-clients)
            - install `npm i @prisma/adapter-pg`
            - final output of single instance of prisma client would be
                ```JS
                    import { PrismaClient } from "@/prisma/generated/prisma/client"
                    import { PrismaPg } from "@prisma/adapter-pg"

                    const adapter = new PrismaPg({
                    connectionString: process.env.PPG_USER_DATABASE_URL,
                    })

                    const globalForPrisma = global as unknown as { prisma: PrismaClient }

                    export const prisma =
                    globalForPrisma.prisma ||
                    new PrismaClient({
                        adapter,
                    })

                    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

                 ```

# Ingest

    - create account
    - Go to Clerk dashboard -> Developer -> Webhook
    - dropdown Webhook to Ingest
    - connect and approve ingest popup window
    **Get the Event Key and Signing Key**
    - click Key icon in your side nav bar -> Event Key
    - Click to Default Key and Copy

    - Now again click the Key icon in your side nav bar -> Signing Key
    - Click to Default Signing Key and Copy

    Connect the Ingest URL to the Next.js App
    - Follow [https://www.inngest.com/docs/getting-started/nextjs-quick-start](https://www.inngest.com/docs/getting-started/nextjs-quick-start)
    - install ingest `npm install inngest`

    Create Ingest Client in /ingest/client.ts
    Create Ingest Api in /app/api/ingest/route.ts
        - make sure ingest is in route.ts is coming from the create /ingest/client.ts
    Create an ingest function in /ingest/function.ts
        - make function to sync clerk user to our database: create, update, delete

## Ingest Trigger for the ingest to trigger we need live url/api/ingest/route.ts so it will be triggered on every request: clerk user create, update, delete

    - for now deploy to vercel
    - Make sure the change the script in package.json for vercel
    ``` JS
         "scripts": {
        "dev": "next dev",
        "build": "prisma generate && next build",
        "start": "next start",
        "lint": "eslint",
        "postinstall": "prisma generate"
    },
    ```
    - now deploy to vercel
