import {Button} from "@aqualy/ui/components/button"
import {Preview} from "./preview"
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const q=await searchParams,product=q.product==='professional'||q.product==='diver'?q.product:'workspace',theme=q.theme==='dark'?'dark':'light',dir=q.dir==='rtl'?'rtl':'ltr'
 return <Preview product={product} theme={theme} dir={dir} serverAction={<Button variant="outline">Server-rendered action</Button>}/>
}
