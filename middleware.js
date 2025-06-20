// middleware.js (in your project root)
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Define protected routes and their allowed user types
const protectedRoutes = {
  // Restaurant owner routes
  "/restaurant": ["restaurant_owner"],
  "/restaurant/dashboard": ["restaurant_owner"],
  "/restaurant/orders": ["restaurant_owner"],
  "/restaurant/menu": ["restaurant_owner"],
  "/restaurant/settings": ["restaurant_owner"],

  // Delivery driver routes
  "/delivery": ["delivery_driver"],
  "/delivery/dashboard": ["delivery_driver"],
  "/delivery/deliveries": ["delivery_driver"],
  "/delivery/earnings": ["delivery_driver"],
  "/delivery/profile": ["delivery_driver"],

  // Customer routes
  "/profile": ["end_user", "restaurant_owner", "delivery_driver"],
  "/cart": ["end_user"],
  "/checkout": ["end_user"],
  "/orders": ["end_user"],
  "/order-history": ["end_user"],

  // Admin routes (if you have any)
  "/admin": ["admin"],
  "/admin/dashboard": ["admin"],
  "/admin/users": ["admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/restaurants",
  "/menu",
  "/about",
  "/contact",
  "/forgot-password",
  "/reset-password",
];

// Routes that redirect authenticated users away (auth pages)
const authRoutes = ["/login", "/register"];

// API routes to exclude from middleware processing
const apiRoutes = ["/api", "/_next", "/favicon.ico", "/images", "/icons"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  // Skip middleware for API routes, static files, etc.
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Helper function to redirect
  const redirect = (url) => {
    return NextResponse.redirect(new URL(url, request.url));
  };

  // Helper function to get user type from token
  const getUserTypeFromToken = async (token) => {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET
      );
      const { payload } = await jwtVerify(token, secret);
      return payload.userType || payload.type || "end_user";
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  };

  // If user is on auth routes and already authenticated, redirect to appropriate dashboard
  if (authRoutes.includes(pathname) && token) {
    const userType = await getUserTypeFromToken(token);
    if (userType) {
      switch (userType) {
        case "restaurant_owner":
          return redirect("/restaurant");
        case "delivery_driver":
          return redirect("/delivery");
        default:
          return redirect("/");
      }
    } else {
      // Invalid token, clear it and continue to auth page
      const response = NextResponse.next();
      response.cookies.delete("authToken");
      response.cookies.delete("userData");
      return response;
    }
  }

  // Check if route is protected
  const matchedRoute = Object.keys(protectedRoutes).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (matchedRoute) {
    // No token, redirect to login with callback URL
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return redirect(loginUrl.toString());
    }

    // Verify token and check user type
    const userType = await getUserTypeFromToken(token);

    if (!userType) {
      // Invalid token, clear cookies and redirect to login
      const response = redirect("/login");
      response.cookies.delete("authToken");
      response.cookies.delete("userData");
      return response;
    }

    // Check if user type is allowed for this route
    const allowedUserTypes = protectedRoutes[matchedRoute];

    if (!allowedUserTypes.includes(userType)) {
      // User not authorized for this route, redirect to appropriate dashboard
      switch (userType) {
        case "restaurant_owner":
          return redirect("/restaurant");
        case "delivery_driver":
          return redirect("/delivery");
        case "admin":
          return redirect("/admin");
        default:
          return redirect("/");
      }
    }

    // User is authorized, continue
    return NextResponse.next();
  }

  // Public route or not protected, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};
