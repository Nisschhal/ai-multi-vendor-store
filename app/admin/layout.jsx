import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs"
import AdminLayout from "@/components/admin/AdminLayout"
export const metadata = {
  title: "aiCart. - Admin",
  description: "aiCart. - Admin",
}

export default function RootAdminLayout({ children }) {
  return (
    <>
      <SignedIn>
        <AdminLayout>{children}</AdminLayout>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignIn fallbackRedirectUrl="/admin" routing="hash" />
        </div>
      </SignedOut>
    </>
  )
}
