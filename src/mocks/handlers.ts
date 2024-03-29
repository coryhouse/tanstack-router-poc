import { HttpResponse, http } from "msw";

export type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "Product 1", price: 100 },
  { id: 2, name: "Product 2", price: 200 },
];

export const handlers = [
  http.get("api/products", () => {
    return HttpResponse.json(products);
  }),

  http.get("api/products/:id", ({ params }) => {
    const { id } = params;
    const product = products.find((p) => p.id === parseInt(id.toString()));
    // if (!product) {
    //   return HttpResponse.json(
    //     { message: "Product not found" },
    //     {
    //       status: 404,
    //     }
    //   );
    // }
    return HttpResponse.json(product);
  }),

  http.delete("api/products/:id", ({ params }) => {
    const { id } = params;
    products.splice(parseInt(id.toString()), 1);
    return HttpResponse.json(products);
  }),

  http.post("api/products", async ({ request }) => {
    const { name, price } = (await request.json()) as Omit<Product, "id">;
    products.push({ id: products.length + 1, name, price });
    return HttpResponse.json(products);
  }),

  http.put("api/products/:id", async ({ request }) => {
    const product = (await request.json()) as Product;
    products.forEach((p) => {
      if (p.id === product.id) p = product;
    });

    return HttpResponse.json(products);
  }),
];
