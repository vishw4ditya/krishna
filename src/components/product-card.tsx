import Link from "next/link";
import { currency } from "@/src/lib/format";

export type ProductCardData = {
  _id: string;
  title: string;
  images: string[];
  price: number;
  category: string;
  stock: number;
  branchId?: { name?: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <img
        src={product.images[0] ?? "https://placehold.co/600x400?text=Product"}
        alt={product.title}
        className="h-44 w-full rounded-lg object-cover"
      />
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 font-semibold">{product.title}</h3>
        <p className="text-xs text-zinc-500">{product.category}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{product.branchId?.name ?? "Branch"}</p>
        <p className="font-bold text-emerald-600">{currency(product.price)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={product.stock > 0 ? "text-emerald-600" : "text-red-600"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
        <Link href={`/products/${product._id}`} className="rounded-md bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-black">
          View
        </Link>
      </div>
    </article>
  );
}
