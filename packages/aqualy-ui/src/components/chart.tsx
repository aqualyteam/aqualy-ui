"use client"

import * as React from "react"
import { ResponsiveContainer,AreaChart,Area,BarChart,Bar,LineChart,Line,PieChart,Pie,RadarChart,Radar,RadialBarChart,RadialBar,CartesianGrid,XAxis,YAxis,PolarGrid,PolarAngleAxis,PolarRadiusAxis,Tooltip } from "recharts"
import { Accordion,AccordionItem,AccordionTrigger,AccordionContent } from "#components/accordion"
import { Spinner } from "#components/spinner"
import { Alert,AlertTitle,AlertDescription } from "#components/alert"
import { Button } from "#components/button"
import { useAqualyUIScope } from "#components/aqualy-ui-scope"
import { cn } from "#lib/utils"

export type ChartConfig = Record<string,{label:string;color?:string}>
const ChartContext=React.createContext<ChartConfig>({})
export function ChartContainer({config,label,compact=false,className,children,...props}:Omit<React.ComponentProps<"div">,"children">&{config:ChartConfig;label:string;compact?:boolean;children:React.ReactElement}) {
  return <ChartContext.Provider value={config}><div {...props} data-slot="chart" data-compact={compact||undefined} className={cn("aq-chart",className)} role="region" aria-label={label}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:320,height:compact?64:248}}>{children}</ResponsiveContainer>
  </div></ChartContext.Provider>
}
type TooltipRow={dataKey?:string|number;name?:string|number;value?:string|number; color?:string}
export function ChartTooltipContent({active,payload,label,unit=""}:{active?:boolean;payload?:readonly TooltipRow[];label?:React.ReactNode;unit?:string}) {
  const config=React.useContext(ChartContext)
  if(!active||!payload?.length)return null
  return <div className="aq-chart-tooltip" data-slot="chart-tooltip"><strong><bdi>{label}</bdi></strong>{payload.filter(row=>row.value!=null).map((row,index)=><div key={`${row.dataKey}-${index}`}><span><i className="aq-chart-dot" style={{background:config[String(row.dataKey)]?.color??row.color}}/>{config[String(row.dataKey)]?.label??row.name}</span><bdi>{row.value} {unit}</bdi></div>)}</div>
}
export const ChartTooltip=Tooltip
export function ChartLegend({config,hidden=[],onToggle}:{config:ChartConfig;hidden?:string[];onToggle?:(key:string)=>void}) {
  return <div className="aq-chart-legend" role="group" aria-label="Chart series">{Object.entries(config).map(([key,series])=>onToggle?<Button key={key} size="xs" variant="ghost" aria-pressed={!hidden.includes(key)} disabled={!hidden.includes(key)&&hidden.length===Object.keys(config).length-1} onClick={()=>onToggle(key)}><i className="aq-chart-dot" style={{background:series.color}}/>{series.label}</Button>:<span key={key}><i className="aq-chart-dot" style={{background:series.color}}/>{series.label}</span>)}</div>
}
export function ChartData({data,columns,caption,label="View data"}:{data:ReadonlyArray<Record<string,string|number|null>>;columns:{key:string;label:string}[];caption:string;label?:string}) {
  return <Accordion><AccordionItem value="data"><AccordionTrigger>{label}</AccordionTrigger><AccordionContent><div className="aq-chart-data" tabIndex={0} role="region" aria-label={caption}><table><caption>{caption}</caption><thead><tr>{columns.map(column=><th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{data.map((row,index)=><tr key={index}>{columns.map((column,index)=>index===0?<th scope="row" key={column.key}><bdi>{row[column.key]??"Not recorded"}</bdi></th>:<td key={column.key}><bdi>{row[column.key]??"Not recorded"}</bdi></td>)}</tr>)}</tbody></table></div></AccordionContent></AccordionItem></Accordion>
}
export interface DataChartProps {type:"area"|"bar"|"line"|"pie"|"radar"|"radial";data:ReadonlyArray<Record<string,string|number|null>>;config:ChartConfig;categoryKey:string;label:string;compact?:boolean;unit?:string;hiddenSeries?:string[];donut?:boolean;radialMax?:number;status?:"ready"|"loading"|"error";onRetry?:()=>void;className?:string}
export function DataChart({type,data,config,categoryKey,label,compact=false,unit="",hiddenSeries=[],donut=true,radialMax=100,status="ready",onRetry,className}:DataChartProps) {
  const {dir}=useAqualyUIScope(),rtl=dir==="rtl"
  if(status!=="ready"||!data.length)return <div className={cn("aq-chart-state",className)} data-compact={compact||undefined} role="status" aria-label={label}>
    {status==="loading"?<><Spinner/> Loading chart…</>:status==="error"?<Alert variant="danger"><AlertTitle>Chart unavailable</AlertTitle><AlertDescription>Try loading the data again.</AlertDescription>{onRetry&&<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</Alert>:<>No data for this period.</>}
  </div>
  const shown=Object.entries(config).filter(([key])=>!hiddenSeries.includes(key))
  if(!shown.length)return <div className="aq-chart-state" role="status">No visible series selected.</div>
  if(type==="radial"&&(!Number.isFinite(radialMax)||radialMax<=0))throw new RangeError("radialMax must be positive and finite")
  const color=(key:string,index:number)=>config[key]?.color??`var(--chart-${index%4+1})`
  const tooltip=<Tooltip content={<ChartTooltipContent unit={unit}/>} cursor={type==="bar"?{fill:"var(--subtle)",stroke:"none"}:{stroke:"var(--control)",strokeWidth:1}} isAnimationActive={false}/>
  const axis={axisLine:false,tickLine:false,tick:{fill:"var(--muted)",fontSize:10},tickMargin:8}
  const grid=!compact&&<CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3"/>
  const axes=!compact&&<><XAxis dataKey={categoryKey} {...axis} reversed={rtl} minTickGap={14}/><YAxis {...axis} width={32} orientation={rtl?"right":"left"}/></>
  const chartProps={data:[...data],accessibilityLayer:true,margin:{top:8,right:rtl?0:8,bottom:0,left:rtl?8:0}}
  let plot:React.ReactElement
  if(type==="area")plot=<AreaChart {...chartProps}>{grid}{axes}{tooltip}{shown.map(([key,series],index)=><Area key={key} type="linear" dataKey={key} name={series.label} stroke={color(key,index)} fill={color(key,index)} fillOpacity={index===0?.18:.1} strokeWidth={2} stackId="total" isAnimationActive={false} connectNulls={false}/>)}</AreaChart>
  else if(type==="bar")plot=<BarChart {...chartProps} barCategoryGap="28%" barGap={3}>{grid}{axes}{tooltip}{shown.map(([key,series],index)=><Bar key={key} dataKey={key} name={series.label} fill={color(key,index)} radius={[3,3,0,0]} maxBarSize={22} isAnimationActive={false}/>)}</BarChart>
  else if(type==="line")plot=<LineChart {...chartProps}>{grid}{axes}{tooltip}{shown.map(([key,series],index)=><Line key={key} type="linear" dataKey={key} name={series.label} stroke={color(key,index)} strokeWidth={2} strokeDasharray={index?"4 3":undefined} dot={compact?false:{r:3,fill:"var(--surface)"}} isAnimationActive={false} connectNulls={false}/>)}</LineChart>
  else if(type==="pie")plot=<PieChart accessibilityLayer><Pie data={data.map((row,index)=>({...row,fill:`var(--chart-${index%4+1})`}))} dataKey={shown[0]?.[0]} nameKey={categoryKey} innerRadius={donut?"60%":0} outerRadius="83%" paddingAngle={3} stroke="var(--surface)" strokeWidth={2} cornerRadius={3} isAnimationActive={false}/>{tooltip}</PieChart>
  else if(type==="radar")plot=<RadarChart {...chartProps} outerRadius="64%"><PolarGrid stroke="var(--chart-grid)"/><PolarAngleAxis dataKey={categoryKey} tick={{fill:"var(--muted)",fontSize:10,textAnchor:"middle"}}/><PolarRadiusAxis tick={false} axisLine={false}/>{shown.map(([key,series],index)=><Radar key={key} dataKey={key} name={series.label} stroke={color(key,index)} fill={color(key,index)} fillOpacity={index?.04:.13} strokeWidth={2} isAnimationActive={false}/>)}{tooltip}</RadarChart>
  else plot=<RadialBarChart {...chartProps} data={data.map(row=>({...row,fill:color(shown[0]?.[0]??"",0)}))} innerRadius="72%" outerRadius="88%" startAngle={90} endAngle={-270}><PolarAngleAxis type="number" domain={[0,radialMax]} tick={false}/><RadialBar dataKey={shown[0]?.[0]} background={{fill:"var(--subtle)"}} cornerRadius={6} isAnimationActive={false}/>{tooltip}</RadialBarChart>
  return <ChartContainer config={config} label={label} compact={compact} className={className}>{plot}</ChartContainer>
}
