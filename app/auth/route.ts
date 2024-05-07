import { getDeeplink, getToken } from "@/libs/app_request";
import {NextRequest, NextResponse} from "next/server";

export async function GET (request: NextRequest) {
    // const greeting = "Hello World!!"
    // const json = {
    //     greeting
    // };
    
    // return NextResponse.json(json);
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code') as  string;
    console.log(`Code: ${code}`);
    const { access_token: accessToken } = await getToken(code, '')
    console.log(`Access token: ${accessToken}`);
    const deeplink = await getDeeplink(accessToken)
    console.log(`Deeplink: ${deeplink}`);
   return NextResponse.redirect(deeplink)
}