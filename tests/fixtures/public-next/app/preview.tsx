"use client"
import * as React from "react"
import {AqualyUIScope,type AqualyProduct,type AqualyTheme,type AqualyDirection} from "@aqualy/ui/components/aqualy-ui-scope"
import {Loading} from "@aqualy/ui/components/loading"
import {Button} from "@aqualy/ui/components/button"
import {InputField} from "@aqualy/ui/components/input-group"
import {InputOTP} from "@aqualy/ui/components/input-otp"
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@aqualy/ui/components/select"
import {Popover,PopoverTrigger,PopoverContent,PopoverTitle,PopoverDescription} from "@aqualy/ui/components/popover"
import {TooltipProvider,Tooltip,TooltipTrigger,TooltipContent} from "@aqualy/ui/components/tooltip"
export function Preview({product,theme,dir,serverAction}:{product:AqualyProduct;theme:AqualyTheme;dir:AqualyDirection;serverAction:React.ReactNode}) {
 const [ready,setReady]=React.useState(false),[name,setName]=React.useState("Sample participant"),[agency,setAgency]=React.useState("PADI"),[motion,setMotion]=React.useState(true),[verified,setVerified]=React.useState(false)
 React.useEffect(()=>setReady(true),[])
 return <AqualyUIScope product={product} theme={theme} dir={dir} className="consumer-scope" data-ready={ready}><TooltipProvider delay={0} closeDelay={0}><main>
 <p className="consumer-copy">MIT SDK · Installed tarball · {product} / {theme} / {dir}</p><h1 className="aq-type-heading">Reusable identity. Aqualy precision.</h1>
 <p className="consumer-copy">No official artwork is bundled. Page Loading, fields and floating controls share the same scoped tokens.</p>
 <div className="row">{serverAction}<Button data-testid="motion-toggle" variant="secondary" onClick={()=>setMotion(v=>!v)}>{motion?"Pause motion":"Resume motion"}</Button></div>
 <div className="panel-grid"><section className="panel"><h2>Neutral page Loading</h2><div className="loading-demo"><Loading data-testid="neutral-loading" label="Preparing dive sessions" description="Loading the upcoming schedule." motion={motion}/></div><p>Use for page or region loading; action-level progress uses Spinner.</p></section>
 <section className="panel"><h2>Consumer identity</h2><div className="loading-demo"><Loading data-testid="custom-loading" label="Preparing documents" size="section" identity={state=><svg data-custom-motion={state.motion} data-custom-id={state.clipId} viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="4"/><circle cx="32" cy="32" r="6" fill="currentColor"/></svg>}/></div><p>Inject identity from a client adapter; request readiness remains consumer-owned.</p></section>
 <section className="panel"><h2>Form composition</h2><InputField label="Participant name" value={name} onChange={e=>setName(e.target.value)} clearable clearLabel="Clear participant" description="A synthetic example, not a customer record."/>
 <div className="row"><InputOTP label="Verification code" length={6} onComplete={()=>setVerified(true)}/><span role="status">{verified?"Verified sample code":"Enter six digits"}</span></div><Loading data-testid="static-loading" label="Preparing locally" size="section" motion={false}/></section>
 <section className="panel"><h2>Sequential floating controls</h2><Select value={agency} onValueChange={v=>{if(v)setAgency(v)}} items={[{value:'PADI',label:'PADI'},{value:'SSI',label:'SSI'}]}><SelectTrigger aria-label="Training agency"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PADI">PADI</SelectItem><SelectItem value="SSI">SSI</SelectItem></SelectContent></Select>
 <div className="row"><Popover><PopoverTrigger render={<Button variant="outline"/>}>Inspect briefing</PopoverTrigger><PopoverContent><PopoverTitle>Session briefing</PopoverTitle><PopoverDescription>Meet at the shore access point at 08:00.</PopoverDescription></PopoverContent></Popover>
 <Tooltip><TooltipTrigger data-testid="context-tip" render={<Button variant="ghost"/>}>Document context</TooltipTrigger><TooltipContent>Version 2.3 · Synthetic briefing</TooltipContent></Tooltip></div><p>Keyboard and touch open/close flows are tested repeatedly in one mounted page.</p></section></div>
 </main></TooltipProvider></AqualyUIScope>
}
