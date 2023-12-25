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
import { Product } from "./mocks/handlers";

async function enableMocking() {
  if (import.meta.env.PROD) return;

  const { worker } = await import("./mocks/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

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
  loader: async () => {
    const resp = await fetch("/api/products");
    return (await resp.json()) as Product[];
  },
  component: () => {
    const products = productsRoute.useLoaderData();
    return (
      <>
        <h1>Products</h1>
        <ul>
          {products.map((p) => (
            <li>
              <Link
                to={productRoute.to}
                params={{
                  productId: p.id.toString(),
                }}
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  },
});

const productRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "products/$productId",
  loader: async ({ params }) => {
    const resp = await fetch(`/api/products/${params.productId}`);
    return (await resp.json()) as Product;
  },
  onError: (error) => {
    console.log(error);
  },
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
  defaultPendingMs: 500, // Defaults to 1 second, but I prefer showing pending UI more quickly.
  defaultPendingMinMs: 0, // Defaults to showing any pending component for 500 to avoid a flash, but I'm not a fan since that means the user has to wait up to 499ms extra before seeing anything once the pending component displays.
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
