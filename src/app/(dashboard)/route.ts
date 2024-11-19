export function GET(request: Request) {
  const url = request.url;
  return Response.redirect(url);
}
