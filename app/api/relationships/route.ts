import { and, eq } from "drizzle-orm";
import { ensureDb } from "../../../db";
import { people, relationships } from "../../../db/schema";

export const dynamic = "force-dynamic";
const headers={"Cache-Control":"private, no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
export const OPTIONS=()=>new Response(null,{status:204,headers});

export async function POST(request:Request){
  try{
    const body=await request.json() as {personId?:number;relatedPersonId?:number;type?:string};
    let personId=Number(body.personId), relatedPersonId=Number(body.relatedPersonId);
    const type=body.type;
    if(!Number.isInteger(personId)||!Number.isInteger(relatedPersonId)||personId===relatedPersonId||!(["parent","partner"].includes(type||"")))return Response.json({error:"Невалидна семейна връзка."},{status:400,headers});
    if(type==="partner"&&personId>relatedPersonId)[personId,relatedPersonId]=[relatedPersonId,personId];
    const db=await ensureDb();
    const existingPeople=await db.select({id:people.id}).from(people).where(eq(people.id,personId));
    const relatedPeople=await db.select({id:people.id}).from(people).where(eq(people.id,relatedPersonId));
    if(!existingPeople.length||!relatedPeople.length)return Response.json({error:"Човекът не е намерен."},{status:404,headers});
    const existing=await db.select().from(relationships).where(and(eq(relationships.personId,personId),eq(relationships.relatedPersonId,relatedPersonId),eq(relationships.type,type as "parent"|"partner")));
    if(existing.length)return Response.json({relationship:existing[0]},{headers});
    const [relationship]=await db.insert(relationships).values({personId,relatedPersonId,type:type as "parent"|"partner"}).returning();
    return Response.json({relationship},{status:201,headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно записване"},{status:500,headers})}
}
