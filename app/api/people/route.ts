import { asc } from "drizzle-orm";
import { ensureDb } from "../../../db";
import { people } from "../../../db/schema";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const clean = (value: unknown, max=1000) => typeof value === "string" ? value.trim().slice(0,max) : "";
const year = (value: unknown) => { const n=Number(value); return Number.isInteger(n)&&n>=1700&&n<=2100?n:null };

export async function GET() {
  try {
    const db=await ensureDb();
    const rows=await db.select().from(people).orderBy(asc(people.generation),asc(people.birthYear),asc(people.id));
    return Response.json({people:rows},{headers});
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
    const [person]=await db.insert(people).values({firstName,lastName,birthYear:year(body.birthYear),deathYear:year(body.deathYear),generation,branch:clean(body.branch,80),relation:clean(body.relation,120),description:clean(body.description,1500),story:clean(body.story,2000),traits:clean(body.traits,500),healthNotes:clean(body.healthNotes,1000),healthPrivate:1}).returning();
    return Response.json({person},{status:201,headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно записване"},{status:500,headers})}
}
