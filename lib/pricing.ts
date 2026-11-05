import { PRODUCT_BY_ID, Product } from "@/lib/products";

export const TEA_COMBO_SIZE = 3;
export const TEA_COMBO_PRICE = 27;

export type CartEntry = {
  product: Product;
  quantity: number;
};

export function calculateTotalUnits(entries: CartEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}

export function calculateCartTotal(entries: CartEntry[]) {
  const teaUnits = entries
    .filter(
      (entry) =>
        entry.product.category === "chas" && entry.product.comboEligible !== false,
    )
    .reduce((sum, entry) => sum + entry.quantity, 0);

  const teaCombos = Math.floor(teaUnits / TEA_COMBO_SIZE);
  const teaRemainder = teaUnits % TEA_COMBO_SIZE;
  const teaUnitPrice = PRODUCT_BY_ID.get("mate-limao")?.unitPrice ?? 10;
  const teaTotal = teaCombos * TEA_COMBO_PRICE + teaRemainder * teaUnitPrice;

  const regularTotal = entries
    .filter(
      (entry) =>
        entry.product.category !== "chas" || entry.product.comboEligible === false,
    )
    .reduce((sum, entry) => sum + entry.quantity * entry.product.unitPrice, 0);

  return {
    total: teaTotal + regularTotal,
    teaCombos,
    teaUnits,
  };
}

export function normalizeCart(quantities: Record<string, unknown>): CartEntry[] {
  return Array.from(PRODUCT_BY_ID.entries())
    .map(([productId, product]) => {
      const rawQuantity = quantities[productId];
      const quantity =
        typeof rawQuantity === "number" && Number.isInteger(rawQuantity)
          ? rawQuantity
          : 0;

      return {
        product,
        quantity: Math.max(0, Math.min(quantity, 50)),
      };
    })
    .filter((entry) => entry.quantity > 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
