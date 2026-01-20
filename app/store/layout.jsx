import StoreLayout from "@/components/store/StoreLayout"
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs"
export const metadata = {
  title: "aiCart. - Store Dashboard",
  description: "aiCart. - Store Dashboard",
}

export default function RootAdminLayout({ children }) {
  return (
    <>
      <SignedIn>
        <StoreLayout>{children}</StoreLayout>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center h-screen">
          <SignIn fallbackRedirectUrl={"/store"} routing="hash" />
        </div>
      </SignedOut>
    </>
  )
}
