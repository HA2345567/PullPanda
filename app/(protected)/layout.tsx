import { requireAuth } from "../../features/auth/actions";

export const instant = false;

export default async function AuthLayout({
    children
}:{
    children: React.ReactNode
}){
    await requireAuth()

    
  return <div className="min-h-svh" suppressHydrationWarning>{children}</div>;
}