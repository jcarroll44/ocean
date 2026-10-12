export const PLUS_ENTITLEMENT='daybuoy_plus';
export const PLUS_PRODUCTS={monthly:'com.jacobcarroll.daybuoy.plus.monthly',annual:'com.jacobcarroll.daybuoy.plus.annual'};
export function entitlementState(info,now=Date.now()){
 const e=info?.entitlements?.active?.[PLUS_ENTITLEMENT],expires=Date.parse(e?.expirationDate||'');
 return {active:!!e?.isActive&&Number.isFinite(expires)&&expires>now,expires:Number.isFinite(expires)?expires:0,renewing:e?.willRenew===true};
}
export function plusAccess(time,dayStart,nextDay,active){return active||(time>=dayStart&&time<nextDay);}
export function offeringPlans(offerings,eligibility={}){
 const packages=offerings?.current?.availablePackages||[];
 return Object.entries(PLUS_PRODUCTS).map(([id,productId])=>{
  const p=packages.find(p=>p.product.identifier===productId),intro=p?.product.introPrice;
  const sevenDays=intro?.price===0&&((intro.periodUnit==='DAY'&&intro.periodNumberOfUnits===7)||(intro.periodUnit==='WEEK'&&intro.periodNumberOfUnits===1));
  return {id,productId,price:p?.product.priceString||null,available:!!p,trial:eligibility[productId]?.status===2&&sevenDays,package:p};
 });
}
