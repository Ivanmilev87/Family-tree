import { asc, eq } from "drizzle-orm";
import { ensureDb } from "../../../db";
import { people, personFields, relationships } from "../../../db/schema";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"content-type", "Access-Control-Allow-Methods":"GET, POST, PATCH, OPTIONS" };
export const OPTIONS=()=>new Response(null,{status:204,headers});
const clean = (value: unknown, max=1000) => typeof value === "string" ? value.trim().slice(0,max) : "";
const year = (value: unknown) => { const n=Number(value); return Number.isInteger(n)&&n>=1700&&n<=2100?n:null };
const gender = (value: unknown) => value === "female" || value === "male" ? value : "unspecified";
const url = (value: unknown) => { const candidate=clean(value,500); if(!candidate)return ""; try { const parsed=new URL(candidate); return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : ""; } catch { return ""; } };
const customFields = (value:unknown) => Array.isArray(value) ? value.slice(0,30).map((field,index)=>{
  const item=field&&typeof field==="object"?field as Record<string,unknown>:{};
  return {label:clean(item.label,80),value:clean(item.value,500),position:index};
}).filter(field=>field.label&&field.value) : [];

export async function GET() {
  try {
    const db=await ensureDb();
    const rows=await db.select().from(people).orderBy(asc(people.generation),asc(people.birthYear),asc(people.id));
    const links=await db.select().from(relationships).orderBy(asc(relationships.id));
    const fields=await db.select().from(personFields).orderBy(asc(personFields.personId),asc(personFields.position),asc(personFields.id));
    const enriched=rows.map(person=>({...person,customFields:fields.filter(field=>field.personId===person.id).map(({label,value})=>({label,value}))}));
    return Response.json({people:enriched,relationships:links},{headers});
  } catch (error) {
    return Response.json({error:error instanceof Error?error.message:"Неуспешно зареждане"},{status:500,headers});
  }
}

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>; const firstName=clean(body.firstName,80), lastName=clean(body.lastName,80);
    if(!firstName||!lastName)return Response.json({error:"Името и фамилията са задължителни."},{status:400,headers});
    const generation=Math.min(12,Math.max(0,Number(body.generation)||0));
    const db=await ensureDb();
    const [person]=await db.insert(people).values({firstName,lastName,birthYear:year(body.birthYear),deathYear:year(body.deathYear),generation,branch:clean(body.branch,80),relation:clean(body.relation,120),description:clean(body.description,1500),story:clean(body.story,2000),traits:clean(body.traits,500),healthNotes:clean(body.healthNotes,1000),healthPrivate:1,gender:gender(body.gender),phone:clean(body.phone,80),email:clean(body.email,160),facebookUrl:url(body.facebookUrl),instagramUrl:url(body.instagramUrl),otherUrl:url(body.otherUrl)}).returning();
    const fields=customFields(body.customFields);
    if(fields.length)await db.insert(personFields).values(fields.map(field=>({...field,personId:person.id})));
    return Response.json({person:{...person,customFields:fields.map(({label,value})=>({label,value}))}},{status:201,headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно записване"},{status:500,headers})}
}

export async function PATCH(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>, id=Number(body.id),firstName=clean(body.firstName,80),lastName=clean(body.lastName,80);
    if(!Number.isInteger(id))return Response.json({error:"Липсва човек."},{status:400,headers});
    if(!firstName||!lastName)return Response.json({error:"Името и фамилията са задължителни."},{status:400,headers});
    const db=await ensureDb();
    const generation=Math.min(12,Math.max(0,Number(body.generation)||0));
    const [person]=await db.update(people).set({firstName,lastName,birthYear:year(body.birthYear),deathYear:year(body.deathYear),generation,branch:clean(body.branch,80),relation:clean(body.relation,120),description:clean(body.description,1500),story:clean(body.story,2000),traits:clean(body.traits,500),healthNotes:clean(body.healthNotes,1000),gender:gender(body.gender),phone:clean(body.phone,80),email:clean(body.email,160),facebookUrl:url(body.facebookUrl),instagramUrl:url(body.instagramUrl),otherUrl:url(body.otherUrl)}).where(eq(people.id,id)).returning();
    if(!person)return Response.json({error:"Човекът не е намерен."},{status:404,headers});
    const fields=customFields(body.customFields);
    await db.delete(personFields).where(eq(personFields.personId,id));
    if(fields.length)await db.insert(personFields).values(fields.map(field=>({...field,personId:id})));
    return Response.json({person:{...person,customFields:fields.map(({label,value})=>({label,value}))}},{headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно обновяване"},{status:500,headers})}
}
