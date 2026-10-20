import { handleMcp } from "@/lib/api/mcp-http";

export const dynamic = "force-dynamic";
export const POST = (req: Request) => handleMcp(req);
export const GET = (req: Request) => handleMcp(req);
export const DELETE = (req: Request) => handleMcp(req);
export const OPTIONS = (req: Request) => handleMcp(req);
