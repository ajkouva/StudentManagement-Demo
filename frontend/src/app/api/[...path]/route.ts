import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, await params);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, await params);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, await params);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, await params);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, await params);
}

async function proxy(req: NextRequest, params: { path: string[] }) {
    const path = params.path.join("/");
    const search = req.nextUrl.search;
    const targetUrl = `${BACKEND_URL}/${path}${search}`;

    // Forward the cookie from the incoming request to the backend
    const headers = new Headers();
    headers.set("Content-Type", req.headers.get("Content-Type") || "application/json");
    const cookie = req.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

    const backendRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
        credentials: "include",
    });

    // Forward ALL response headers (including Set-Cookie) back to the browser
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
        resHeaders.append(key, value);
    });

    const responseBody = await backendRes.text();

    return new NextResponse(responseBody, {
        status: backendRes.status,
        headers: resHeaders,
    });
}
