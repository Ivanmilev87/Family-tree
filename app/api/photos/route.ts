import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { ensureDb } from "../../../db";
import { people } from "../../../db/schema";

export const dynamic = "force-dynamic";
type PhotoEnv={PHOTOS:R2Bucket};
const photoEnv=()=>env as unknown as PhotoEnv;

export async function GET(request:Request){const key=new URL(request.url).searchParams.get("key");if(!key)return new Response("Липсва снимка",{status:400});const object=await photoEnv().PHOTOS.get(key);if(!object)return new Response("Снимката не е намерена",{status:404});return new Response(object.body,{headers:{"content-type":object.httpMetadata?.contentType||"image/jpeg","cache-control":"private, max-age=3600","x-content-type-options":"nosniff"}})}
export async function POST(request:Request){try{const data=await request.formData(),personId=Number(data.get("personId")),file=data.get("photo");if(!Number.isInteger(personId)||!(file instanceof File))return Response.json({error:"Невалидна снимка"},{status:400});if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5_000_000)return Response.json({error:"Използвай JPG, PNG или WEBP до 5 MB."},{status:400});const ext=file.type.split("/")[1].replace("jpeg","jpg"),key=`people/${personId}/${crypto.randomUUID()}.${ext}`;await photoEnv().PHOTOS.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});const db=await ensureDb();await db.update(people).set({photoKey:key}).where(eq(people.id,personId));return Response.json({photoKey:key},{status:201,headers:{"Cache-Control":"private, no-store"}})}catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно качване"},{status:500})}}
