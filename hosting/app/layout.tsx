import type { ReactNode } from "react";
export const metadata={title:"DayBuoy",description:"Live beach forecast"};
export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}
