import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  Link,
  NotFoundRoute,
  Outlet,
  RootRoute,
  Route,
  Router,
  RouterProvider,
} from "@tanstack/react-router";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      }))
    );

const rootRoute = new RootRoute({
  component: () => (
    <>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
      |{" "}
      <Link to="products" className="[&.active]:font-bold">
        Products
      </Link>{" "}
      |{" "}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
      <Outlet />
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Home</h1>,
});

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => <h1>About</h1>,
});

const productsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "products",
  component: () => (
    <>
      <h1>Products</h1>
      <Link
        to={productRoute.to}
        params={{
          productId: "1",
        }}
      >
        Product 1
      </Link>
    </>
  ),
});

const productRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "products/$productId",
  component: () => {
    const { productId } = productRoute.useParams();
    return (
      <>
        <h1>Product Details</h1>
        <p>Product ID: {productId}</p>
      </>
    );
  },
});

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => <h1>404</h1>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  productsRoute,
  productRoute,
]);

const router = new Router({
  routeTree,
  notFoundRoute,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
