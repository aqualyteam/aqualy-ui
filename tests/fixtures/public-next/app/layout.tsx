import type {Metadata} from "next"
import "@aqualy/ui/styles.css"
import "./host.css"
export const metadata:Metadata={title:"Aqualy UI C0 consumer",icons:{icon:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='4' fill='%23294e59'/%3E%3C/svg%3E"}}
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
