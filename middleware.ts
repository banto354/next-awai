import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. 公開しても良いページ（ログイン不要で見れるページ）を定義
// 例: サインイン画面、トップページ(LandingPage)など
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/stream(.*)',
  '/', // もしトップページも未ログインで見せたい場合
]);

export default clerkMiddleware((auth, req) => {
  // 2. 公開ルート「以外」へのアクセスで、かつ未ログインなら保護する
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.jsの内部ファイルや静的ファイルを除外して、全てのルートに適用
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};