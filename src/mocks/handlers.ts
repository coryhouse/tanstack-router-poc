import { HttpResponse, http } from "msw";

type Product = {
  id: number;
  name: string;
  price: number;
};

export const handlers = [
  http.get("/products", () => {
    const products: Product[] = [
      { id: 1, name: "Product 1", price: 100 },
      { id: 2, name: "Product 2", price: 200 },
    ];

    return HttpResponse.json(products);
  }),
];
