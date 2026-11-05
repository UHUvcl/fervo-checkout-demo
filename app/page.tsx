"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  Clock,
  Coffee,
  Leaf,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Snowflake,
  Utensils,
} from "lucide-react";
import {
  CATEGORY_CONFIG,
  MEAL_SIZE_GUIDES,
  PRODUCTS,
  ProductCategory,
} from "@/lib/products";
import {
  TEA_COMBO_PRICE,
  TEA_COMBO_SIZE,
  calculateCartTotal,
  formatCurrency,
} from "@/lib/pricing";

type Fulfillment = "pickup" | "delivery";

type CheckoutResponse = {
  whatsappUrl?: string;
  orderCode?: string;
  pixKey?: string;
  error?: string;
};

const CATEGORY_ICON: Record<ProductCategory, typeof Leaf> = {
  chas: Leaf,
  breakfast: Coffee,
  sanduiches: Utensils,
  marmitas: Snowflake,
  secos: Package,
};

export default function Home() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("Cliente Exemplo");
  const [whatsapp, setWhatsapp] = useState("00000000000");
  const [notes, setNotes] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [address, setAddress] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("chas");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastOrder, setLastOrder] = useState("");

  const cartItems = useMemo(
    () =>
      PRODUCTS.map((product) => ({
        product,
        quantity: quantities[product.id] ?? 0,
      })).filter((entry) => entry.quantity > 0),
    [quantities],
  );

  const totalUnits = cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const pricing = calculateCartTotal(cartItems);

  function changeQuantity(productId: string, delta: number) {
    setQuantities((current) => {
      const nextValue = Math.max(0, (current[productId] ?? 0) + delta);
      return {
        ...current,
        [productId]: nextValue,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLastOrder("");

    if (totalUnits === 0) {
      setError("Escolha pelo menos um item.");
      return;
    }

    if (!customerName.trim() || !whatsapp.trim()) {
      setError("Informe nome e WhatsApp para finalizar.");
      return;
    }

    if (fulfillment === "delivery" && !address.trim()) {
      setError("Informe o endereco para delivery.");
      return;
    }

    setIsSubmitting(true);

    try {
      const code = `DEMO-${Date.now()}`;
      window.localStorage.setItem("fervo-demo-last-order", JSON.stringify({code, items: cartItems.map(entry => ({title:entry.product.title,quantity:entry.quantity})),total:pricing.total}));
      setLastOrder(code);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Nao foi possivel montar o pedido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-fervo-cream text-fervo-green">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-36 pt-5 sm:px-8 lg:grid lg:grid-cols-[1fr_390px] lg:gap-10 lg:pb-12 lg:pt-8">
        <section className="space-y-8">
          <header className="relative min-h-[410px] overflow-hidden rounded-[1.5rem] bg-fervo-green px-6 py-7 text-fervo-cream shadow-soft sm:px-8">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/fervo-iced-tea-hero.jpg`}
              alt="Cha gelado com limao e gelo em mesa iluminada"
              fill
              priority
              sizes="(min-width: 1024px) 860px, 100vw"
              className="object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-fervo-green/95 via-fervo-green/70 to-fervo-green/25" />
            <div className="relative flex min-h-[350px] flex-col justify-between">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-fervo-cream/75">
                    cha gelado natural + comida pratica
                  </p>
                  <h1 className="mt-2 font-[var(--font-serif)] text-5xl font-semibold leading-none sm:text-7xl">
                    FERVO
                  </h1>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fervo-cream text-fervo-green">
                  <Leaf aria-hidden="true" size={22} />
                </div>
              </div>

              <div>
                <p className="max-w-2xl text-base leading-7 text-fervo-cream/88">
                  Cardapio enxuto para a retomada: chas gelados de 300 ml com
                  receita padronizada, embalagem certa e producao em lote pequeno.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-fervo-cream/88">
                  <span className="rounded-full border border-fervo-cream/35 bg-fervo-cream/10 px-3 py-1 backdrop-blur">
                    Pagamento simulado
                  </span>
                  <span className="rounded-full border border-fervo-cream/35 bg-fervo-cream/10 px-3 py-1 backdrop-blur">
                    {TEA_COMBO_SIZE} chas 300 ml por {formatCurrency(TEA_COMBO_PRICE)}
                  </span>
                  <span className="rounded-full border border-fervo-cream/35 bg-fervo-cream/10 px-3 py-1 backdrop-blur">
                    individual a R$ 10
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_CONFIG.map((category) => {
              const Icon = CATEGORY_ICON[category.id];
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category.id
                      ? "border-fervo-green bg-fervo-green text-fervo-cream"
                      : "border-fervo-green/15 bg-white/65 text-fervo-green hover:border-fervo-terracotta"
                  }`}
                >
                  <Icon aria-hidden="true" size={16} />
                  {category.title}
                </button>
              );
            })}
          </div>

          {CATEGORY_CONFIG.map((category) => {
            const products = PRODUCTS.filter((product) => product.category === category.id);

            return (
              <section
                key={category.id}
                className={activeCategory === category.id ? "space-y-4" : "hidden"}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fervo-olive">
                      {category.eyebrow}
                    </p>
                    <h2 className="mt-1 font-[var(--font-serif)] text-3xl font-semibold">
                      {category.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-fervo-green/65">
                      {category.description}
                    </p>
                  </div>
                  {category.id === "chas" ? (
                    <p className="hidden rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-fervo-green/70 sm:block">
                      {TEA_COMBO_SIZE} garrafas 300 ml por {formatCurrency(TEA_COMBO_PRICE)}
                    </p>
                  ) : null}
                </div>

                {category.id === "marmitas" ? (
                  <div className="space-y-3 border-l-4 border-fervo-terracotta bg-white/55 px-4 py-4">
                    <div>
                      <h3 className="font-semibold">Regra para montar qualquer sabor</h3>
                      <p className="mt-1 text-xs leading-5 text-fervo-green/60">
                        A quantidade abaixo e pesada com a comida cozida/pronta, nao crua.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {MEAL_SIZE_GUIDES.map((guide) => (
                        <div key={guide.title} className="bg-fervo-cream/65 px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold">{guide.title}</h4>
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fervo-olive">
                              {guide.container}
                            </span>
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {guide.components.map((component) => (
                              <div key={component.label}>
                                <dt className="text-fervo-green/55">{component.label}</dt>
                                <dd className="font-semibold">{component.weight}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => {
                    const quantity = quantities[product.id] ?? 0;

                    return (
                      <article
                        key={product.id}
                        className="rounded-2xl border border-fervo-green/10 bg-white/65 p-5 shadow-[0_10px_30px_rgba(14,47,36,0.07)]"
                      >
                        <div className="flex min-h-full flex-col justify-between gap-5">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-xl font-semibold leading-tight">
                                {product.title}
                              </h3>
                              {product.badge ? (
                                <span className="shrink-0 rounded-full bg-fervo-terracotta/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-fervo-terracotta">
                                  {product.badge}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-fervo-green/70">
                              {product.description}
                            </p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-fervo-olive">
                              {product.profile}
                            </p>
                            {product.mealDetails ? (
                              <div className="mt-4 border-t border-fervo-green/10 pt-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-fervo-green/65">
                                  <span>
                                    {product.mealDetails.weight}{" "}
                                    {product.category === "marmitas" ? "pronto" : "medidos"}
                                  </span>
                                  <span aria-hidden="true">-</span>
                                  <span>embalagem {product.mealDetails.container}</span>
                                </div>
                                <dl className="mt-3 space-y-2 text-sm">
                                  {product.mealDetails.components.map((component) => (
                                    <div
                                      key={`${component.label}-${component.weight}`}
                                      className="grid grid-cols-[86px_1fr] gap-3"
                                    >
                                      <dt className="font-semibold text-fervo-green">
                                        {component.weight}
                                      </dt>
                                      <dd className="text-fervo-green/68">
                                        <span className="font-medium text-fervo-green/80">
                                          {component.label}:
                                        </span>{" "}
                                        {component.detail}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                                {product.mealDetails.note ? (
                                  <p className="mt-3 text-xs leading-5 text-fervo-green/55">
                                    {product.mealDetails.note}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <p className="text-lg font-semibold">
                              {formatCurrency(product.unitPrice)}
                            </p>
                            <div className="flex h-12 items-center rounded-full border border-fervo-green/15 bg-fervo-cream">
                              <button
                                type="button"
                                onClick={() => changeQuantity(product.id, -1)}
                                disabled={quantity === 0}
                                className="flex h-12 w-12 items-center justify-center rounded-full text-fervo-green transition hover:bg-fervo-green hover:text-fervo-cream disabled:cursor-not-allowed disabled:text-fervo-green/25 disabled:hover:bg-transparent"
                                aria-label={`Diminuir ${product.title}`}
                              >
                                <Minus aria-hidden="true" size={18} />
                              </button>
                              <span className="w-9 text-center text-base font-semibold tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => changeQuantity(product.id, 1)}
                                className="flex h-12 w-12 items-center justify-center rounded-full text-fervo-green transition hover:bg-fervo-green hover:text-fervo-cream"
                                aria-label={`Adicionar ${product.title}`}
                              >
                                <Plus aria-hidden="true" size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start" id="pedido">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="rounded-2xl border border-fervo-green/10 bg-[#FFFDF8] p-5 shadow-soft sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fervo-green text-fervo-cream">
                <ShoppingBag aria-hidden="true" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fervo-olive">
                  Pedido
                </p>
                <h2 className="text-2xl font-semibold">Sua encomenda</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {cartItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-fervo-olive/35 px-4 py-5 text-sm leading-6 text-fervo-green/60">
                  Adicione itens para ver o total e enviar o pedido.
                </p>
              ) : (
                cartItems.map((entry) => (
                  <div
                    key={entry.product.id}
                    className="flex items-start justify-between gap-3 border-b border-fervo-green/10 pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium leading-tight">{entry.product.title}</p>
                      <p className="mt-1 text-sm text-fervo-green/55">
                        {entry.quantity} un.
                      </p>
                      {entry.product.mealDetails ? (
                        <p className="mt-1 text-xs leading-5 text-fervo-green/45">
                          {entry.product.mealDetails.weight} - embalagem{" "}
                          {entry.product.mealDetails.container}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-semibold">
                      {formatCurrency(entry.quantity * entry.product.unitPrice)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-fervo-green px-5 py-4 text-fervo-cream">
              <div className="flex items-center justify-between">
                <span className="text-sm text-fervo-cream/75">Itens</span>
                <span className="font-semibold tabular-nums">{totalUnits}</span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <span className="text-sm text-fervo-cream/75">Total estimado</span>
                <span className="text-3xl font-semibold tabular-nums">
                  {formatCurrency(pricing.total)}
                </span>
              </div>
              {pricing.teaCombos > 0 ? (
                <p className="mt-3 text-xs text-fervo-cream/70">
                  {pricing.teaCombos} combo{pricing.teaCombos > 1 ? "s" : ""} de 3
                  chas por {formatCurrency(TEA_COMBO_PRICE)} aplicado
                  {pricing.teaCombos > 1 ? "s" : ""}.
                </p>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold">Nome</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-fervo-green/15 bg-fervo-cream px-4 py-3 outline-none transition focus:border-fervo-terracotta focus:ring-2 focus:ring-fervo-terracotta/20"
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">WhatsApp</span>
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-fervo-green/15 bg-fervo-cream px-4 py-3 outline-none transition focus:border-fervo-terracotta focus:ring-2 focus:ring-fervo-terracotta/20"
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>

              <div>
                <span className="text-sm font-semibold">Entrega</span>
                <div className="mt-2 grid grid-cols-2 rounded-2xl border border-fervo-green/15 bg-fervo-cream p-1">
                  {(["pickup", "delivery"] as Fulfillment[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFulfillment(option)}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                        fulfillment === option
                          ? "bg-fervo-terracotta text-white"
                          : "text-fervo-green/65"
                      }`}
                    >
                      {option === "pickup" ? "Retirada" : "Delivery"}
                    </button>
                  ))}
                </div>
              </div>

              {fulfillment === "delivery" ? (
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin aria-hidden="true" size={16} />
                    Endereco
                  </span>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-fervo-green/15 bg-fervo-cream px-4 py-3 outline-none transition focus:border-fervo-terracotta focus:ring-2 focus:ring-fervo-terracotta/20"
                    placeholder="Rua, numero, bairro e complemento"
                    autoComplete="street-address"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold">Observacoes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-fervo-green/15 bg-fervo-cream px-4 py-3 outline-none transition focus:border-fervo-terracotta focus:ring-2 focus:ring-fervo-terracotta/20"
                  placeholder="Ex.: quero congelado, retirar as 15h, sem milho"
                />
              </label>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl bg-fervo-terracotta/10 px-4 py-3 text-sm font-medium text-fervo-terracotta">
                {error}
              </p>
            ) : null}

            {lastOrder ? (
              <p className="mt-4 rounded-2xl bg-fervo-green/10 px-4 py-3 text-sm font-medium text-fervo-green">
                Pedido {lastOrder} simulado com sucesso. Nenhum envio ou pagamento foi realizado.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || totalUnits === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-fervo-green px-5 py-4 font-semibold text-fervo-cream transition hover:bg-fervo-terracotta disabled:cursor-not-allowed disabled:bg-fervo-green/35"
            >
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
              ) : (
                <MessageCircle aria-hidden="true" size={18} />
              )}
              {isSubmitting ? "Montando pedido..." : "Simular pedido"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs leading-5 text-fervo-green/55">
              <Clock aria-hidden="true" size={14} />
              Demonstracao ficticia. Nenhuma cobranca.
            </p>
          </form>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-fervo-green/10 bg-[#FFFDF8]/95 px-4 py-3 shadow-[0_-12px_35px_rgba(14,47,36,0.14)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fervo-olive">
              Pedido
            </p>
            <p className="truncate text-lg font-semibold">
              {totalUnits} item{totalUnits === 1 ? "" : "s"} - {formatCurrency(pricing.total)}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || totalUnits === 0}
            className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-fervo-green px-5 py-3 text-sm font-semibold text-fervo-cream disabled:bg-fervo-green/35"
          >
            {isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            ) : (
              <MessageCircle aria-hidden="true" size={17} />
            )}
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}
