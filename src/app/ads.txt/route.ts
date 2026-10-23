import { site } from "@/lib/site";

// AdSense checks /ads.txt to confirm this site may sell its ad space.
export function GET() {
  const publisher = site.ads.client.replace(/^ca-/, "");
  const body = publisher ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
