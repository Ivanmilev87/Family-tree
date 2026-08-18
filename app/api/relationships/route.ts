import { and, eq, ne } from "drizzle-orm";
import { ensureDb } from "../../../db";
import { people, relationships } from "../../../db/schema";

export const dynamic = "force-dynamic";
const headers={"Cache-Control":"private, no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, PATCH, DELETE, OPTIONS"};
export const OPTIONS=()=>new Response(null,{status:204,headers});
const clean=(value:unknown,max=1500)=>typeof value==="string"?value.trim().slice(0,max):"";

export async function POST(request:Request){
  try{
    const body=await request.json() as {personId?:number;relatedPersonId?:number;type?:string;eventLabel?:string};
    let personId=Number(body.personId), relatedPersonId=Number(body.relatedPersonId);
    const type=body.type;
    if(!Number.isInteger(personId)||!Number.isInteger(relatedPersonId)||personId===relatedPersonId||!(["parent","partner"].includes(type||"")))return Response.json({error:"Невалидна семейна връзка."},{status:400,headers});
    if(type==="partner"&&personId>relatedPersonId)[personId,relatedPersonId]=[relatedPersonId,personId];
    const db=await ensureDb();
    const existingPeople=await db.select({id:people.id}).from(people).where(eq(people.id,personId));
    const relatedPeople=await db.select({id:people.id}).from(people).where(eq(people.id,relatedPersonId));
    if(!existingPeople.length||!relatedPeople.length)return Response.json({error:"Човекът не е намерен."},{status:404,headers});
    const existing=await db.select().from(relationships).where(and(eq(relationships.personId,personId),eq(relationships.relatedPersonId,relatedPersonId),eq(relationships.type,type as "parent"|"partner")));
    if(existing.length){const [relationship]=await db.update(relationships).set({eventLabel:clean(body.eventLabel,100)}).where(eq(relationships.id,existing[0].id)).returning();return Response.json({relationship},{headers});}
    const [relationship]=await db.insert(relationships).values({personId,relatedPersonId,type:type as "parent"|"partner",eventLabel:clean(body.eventLabel,100)}).returning();
    return Response.json({relationship},{status:201,headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно записване"},{status:500,headers})}
}

export async function PATCH(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>,id=Number(body.id);
    if(!Number.isInteger(id))return Response.json({error:"Липсва семейна връзка."},{status:400,headers});
    const db=await ensureDb();
    const current=await db.select().from(relationships).where(eq(relationships.id,id));
    if(!current.length)return Response.json({error:"Връзката не е намерена."},{status:404,headers});
    let personId=Number(body.personId??current[0].personId),relatedPersonId=Number(body.relatedPersonId??current[0].relatedPersonId);
    if(!Number.isInteger(personId)||!Number.isInteger(relatedPersonId)||personId===relatedPersonId)return Response.json({error:"Избери двама различни души."},{status:400,headers});
    if(current[0].type==="partner"&&personId>relatedPersonId)[personId,relatedPersonId]=[relatedPersonId,personId];
    const selectedPeople=await db.select({id:people.id}).from(people).where(eq(people.id,personId)),otherPeople=await db.select({id:people.id}).from(people).where(eq(people.id,relatedPersonId));
    if(!selectedPeople.length||!otherPeople.length)return Response.json({error:"Човекът не е намерен."},{status:404,headers});
    const duplicate=await db.select({id:relationships.id}).from(relationships).where(and(eq(relationships.personId,personId),eq(relationships.relatedPersonId,relatedPersonId),eq(relationships.type,current[0].type),ne(relationships.id,id)));
    if(duplicate.length)return Response.json({error:"Тази връзка вече съществува."},{status:409,headers});
    const [relationship]=await db.update(relationships).set({personId,relatedPersonId,story:clean(body.story,2500),eventLabel:clean(body.eventLabel,100),eventDate:clean(body.eventDate,80),place:clean(body.place,150),sourceUrl:clean(body.sourceUrl,500)}).where(eq(relationships.id,id)).returning();
    return Response.json({relationship},{headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно обновяване"},{status:500,headers})}
}

export async function DELETE(request:Request){
  try{
    const id=Number(new URL(request.url).searchParams.get("id"));
    if(!Number.isInteger(id))return Response.json({error:"Липсва семейна връзка."},{status:400,headers});
    const db=await ensureDb();
    const removed=await db.delete(relationships).where(eq(relationships.id,id)).returning({id:relationships.id});
    if(!removed.length)return Response.json({error:"Връзката не е намерена."},{status:404,headers});
    return Response.json({removed:true},{headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно премахване"},{status:500,headers})}
}
