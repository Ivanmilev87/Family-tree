import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";
type PhotoEnv={PHOTOS:R2Bucket;DB:D1Database};
const platform=()=>env as unknown as PhotoEnv;
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS"};
export const OPTIONS=()=>new Response(null,{status:204,headers:cors});

export async function GET(request:Request){
  const key=new URL(request.url).searchParams.get("key");
  if(key){const object=await platform().PHOTOS.get(key);if(!object)return new Response("Фонът не е намерен",{status:404,headers:cors});return new Response(object.body,{headers:{...cors,"content-type":object.httpMetadata?.contentType||"image/jpeg","cache-control":"public, max-age=3600","x-content-type-options":"nosniff"}})}
  await platform().DB.prepare("CREATE TABLE IF NOT EXISTS family_settings (id integer PRIMARY KEY NOT NULL, background_key text, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)").run();
  const result=await platform().DB.prepare("SELECT background_key FROM family_settings WHERE id=1").first<{background_key:string|null}>();
  return Response.json({backgroundKey:result?.background_key||null},{headers:{...cors,"Cache-Control":"no-store"}});
}

export async function POST(request:Request){try{
  const data=await request.formData(),file=data.get("background");
  if(!(file instanceof File))return Response.json({error:"Избери изображение."},{status:400,headers:cors});
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8_000_000)return Response.json({error:"Използвай JPG, PNG или WEBP до 8 MB."},{status:400,headers:cors});
  const ext=file.type.split("/")[1].replace("jpeg","jpg"),key=`background/${crypto.randomUUID()}.${ext}`;
  await platform().PHOTOS.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type}});
  await platform().DB.prepare("CREATE TABLE IF NOT EXISTS family_settings (id integer PRIMARY KEY NOT NULL, background_key text, updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)").run();
  await platform().DB.prepare("INSERT INTO family_settings (id, background_key, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET background_key=excluded.background_key, updated_at=CURRENT_TIMESTAMP").bind(key).run();
  return Response.json({backgroundKey:key},{status:201,headers:{...cors,"Cache-Control":"no-store"}});
}catch(error){return Response.json({error:error instanceof Error?error.message:"Неуспешно качване"},{status:500,headers:cors})}}
