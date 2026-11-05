"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  PackagePlus,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { formatCurrency, calculateCartTotal } from "@/lib/pricing";

type TeaProduct = {
  id: string;
  title: string;
  salePrice: number;
  cost: number | null;
  targetStock: number;
};

type Batch = {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  cost: number | null;
  notes: string;
};

type Sale = {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  payment: string;
  notes: string;
};

type Settings = {
  reservePerBottle: number;
  products: TeaProduct[];
};

const STORAGE_KEY = "fervo-demo-gestor-v1";

const INITIAL_PRODUCTS: TeaProduct[] = PRODUCTS.map(product => ({id: product.id, title: product.title, salePrice: product.unitPrice, cost: 2, targetStock: 12}));

const INITIAL_SETTINGS: Settings = {
  reservePerBottle: 4,
  products: INITIAL_PRODUCTS,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function numberFromInput(value: string) {
  return Number(value.replace(",", ".")) || 0;
}

function mergeProducts(saved?: TeaProduct[]) {
  const savedById = new Map((saved ?? []).map((product) => [product.id, product]));
  return INITIAL_PRODUCTS.map((product) => ({
    ...product,
    ...savedById.get(product.id),
    salePrice: product.salePrice,
  }));
}

export default function GestorPage() {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [batches, setBatches] = useState<Batch[]>(PRODUCTS.map(product => ({id: `demo-${product.id}`,date: "2026-01-01",productId:product.id,quantity:12,cost:2,notes:"Lote ficticio"})));
  const [sales, setSales] = useState<Sale[]>([{id:"demo-sale",date:"2026-01-01",productId:PRODUCTS[0].id,quantity:3,unitPrice:9,payment:"Simulado",notes:"Venda ficticia"}]);
  const [loaded, setLoaded] = useState(false);

  const [batchProductId, setBatchProductId] = useState(INITIAL_PRODUCTS[0]?.id ?? "");
  const [batchQuantity, setBatchQuantity] = useState(13);
  const [batchNotes, setBatchNotes] = useState("");

  const [saleProductId, setSaleProductId] = useState(INITIAL_PRODUCTS[0]?.id ?? "");
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [salePayment, setSalePayment] = useState("Pix");
  const [saleNotes, setSaleNotes] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as {
          settings?: Settings;
          batches?: Batch[];
          sales?: Sale[];
        };

        setSettings({
          reservePerBottle:
            saved.settings?.reservePerBottle ?? INITIAL_SETTINGS.reservePerBottle,
          products: mergeProducts(saved.settings?.products),
        });
        setBatches(saved.batches ?? []);
        setSales(saved.sales ?? []);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings, batches, sales }),
    );
  }, [settings, batches, sales, loaded]);

  const productById = useMemo(
    () => new Map(settings.products.map((product) => [product.id, product])),
    [settings.products],
  );

  const stockRows = useMemo(
    () =>
      settings.products.map((product) => {
        const produced = batches
          .filter((batch) => batch.productId === product.id)
          .reduce((sum, batch) => sum + batch.quantity, 0);
        const sold = sales
          .filter((sale) => sale.productId === product.id)
          .reduce((sum, sale) => sum + sale.quantity, 0);
        const stock = produced - sold;
        const needed = Math.max(0, product.targetStock - stock);

        return {
          product,
          produced,
          sold,
          stock,
          needed,
          restockCost: product.cost === null ? null : needed * product.cost,
        };
      }),
    [batches, sales, settings.products],
  );

  const metrics = useMemo(() => {
    const revenue = sales.reduce(
      (sum, sale) => sum + sale.quantity * sale.unitPrice,
      0,
    );
    const reserve = sales.reduce(
      (sum, sale) => sum + sale.quantity * settings.reservePerBottle,
      0,
    );
    const producedCost = batches.reduce(
      (sum, batch) => sum + batch.quantity * (batch.cost ?? 0),
      0,
    );
    const soldUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const readyStock = stockRows.reduce((sum, row) => sum + row.stock, 0);
    const restockCost = stockRows.reduce((sum, row) => sum + (row.restockCost ?? 0), 0);

    return {
      revenue,
      reserve,
      producedCost,
      freeCash: revenue - reserve,
      soldUnits,
      readyStock,
      restockCost,
    };
  }, [batches, sales, settings.reservePerBottle, stockRows]);

  const selectedSaleProduct = productById.get(saleProductId) ?? settings.products[0];
  const selectedBatchProduct = productById.get(batchProductId) ?? settings.products[0];

  const nextAction = useMemo(() => {
    if (metrics.readyStock <= 6) {
      return {
        title: "Produzir primeiro",
        body: "Estoque pronto esta baixo. Faca uma leva pequena antes de gastar energia divulgando.",
        tone: "danger" as const,
      };
    }

    if (metrics.reserve < metrics.restockCost) {
      return {
        title: "Guardar reposicao",
        body: "Ainda nao trate a sobra como lucro livre. Primeiro separe dinheiro para recomprar o proximo lote.",
        tone: "warning" as const,
      };
    }

    return {
      title: "Vender e puxar proximo passo",
      body: "Estoque e reposicao estao sob controle. Agora a meta e vender o que esta pronto e guardar sobra para sanduiches.",
      tone: "ok" as const,
    };
  }, [metrics.readyStock, metrics.reserve, metrics.restockCost]);

  function addBatch() {
    if (!selectedBatchProduct || batchQuantity < 1) {
      return;
    }

    setBatches((current) => [
      {
        id: makeId("lote"),
        date: today(),
        productId: selectedBatchProduct.id,
        quantity: batchQuantity,
        cost: selectedBatchProduct.cost,
        notes: batchNotes.trim(),
      },
      ...current,
    ]);
    setBatchQuantity(13);
    setBatchNotes("");
  }

  function addSale() {
    if (!selectedSaleProduct || !Number.isInteger(saleQuantity) || saleQuantity < 1 || saleQuantity > (stockRows.find(row => row.product.id === saleProductId)?.stock ?? 0)) {
      return;
    }

    setSales((current) => [
      {
        id: makeId("venda"),
        date: today(),
        productId: selectedSaleProduct.id,
        quantity: saleQuantity,
        unitPrice: calculateCartTotal([{product: PRODUCTS.find(p => p.id === selectedSaleProduct.id)!, quantity: saleQuantity}]).total / saleQuantity,
        payment: salePayment.trim() || "Pix",
        notes: saleNotes.trim(),
      },
      ...current,
    ]);
    setSaleQuantity(1);
    setSaleNotes("");
  }

  function updateProduct(
    id: string,
    field: keyof Pick<TeaProduct, "salePrice" | "cost" | "targetStock">,
    value: number,
  ) {
    if (field === "salePrice") return;
    setSettings((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id ? { ...product, [field]: Math.max(0, value) } : product,
      ),
    }));
  }

  function deleteBatch(id: string) {
    setBatches((current) => current.filter((batch) => batch.id !== id));
  }

  function deleteSale(id: string) {
    setSales((current) => current.filter((sale) => sale.id !== id));
  }

  return (
    <main className="min-h-screen bg-fervo-cream px-4 py-6 text-fervo-green sm:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <a href="../">Voltar ao cardapio demonstrativo</a>
        <header className="flex flex-col gap-4 border-b border-fervo-green/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fervo-olive">
              gestor simples
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-4xl font-semibold sm:text-5xl">
              Cha, estoque e caixa
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-fervo-green/65">
              Use so para a rotina de agora: registrar lote, registrar venda,
              ver estoque pronto e separar dinheiro de reposicao.
            </p>
          </div>
          <StatusCard tone={nextAction.tone} title={nextAction.title} body={nextAction.body} />
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="Estoque pronto" value={`${metrics.readyStock} garrafas`} />
          <Metric label="Vendido" value={`${metrics.soldUnits} garrafas`} />
          <Metric label="Entrou" value={formatCurrency(metrics.revenue)} />
          <Metric label="Separar reposicao" value={formatCurrency(metrics.reserve)} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Panel
            icon={PackagePlus}
            eyebrow="producao"
            title="Lancar lote pronto"
            helper="Quando engarrafar, lance aqui. Isso aumenta o estoque."
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <SelectInput
                label="Sabor"
                value={batchProductId}
                onChange={setBatchProductId}
                options={settings.products.map((product) => ({
                  value: product.id,
                  label: product.title,
                }))}
              />
              <NumberInput label="Garrafas" value={batchQuantity} onChange={setBatchQuantity} />
            </div>
            <TextInput
              label="Observacao"
              value={batchNotes}
              onChange={setBatchNotes}
              placeholder="Ex.: lote 4L rendeu 13 garrafas"
            />
            <ActionButton onClick={addBatch} icon={Plus}>
              Adicionar lote
            </ActionButton>
          </Panel>

          <Panel
            icon={ShoppingCart}
            eyebrow="venda"
            title="Lancar venda"
            helper="Quando vender, lance aqui. Isso baixa estoque e calcula caixa."
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_100px_110px]">
              <SelectInput
                label="Sabor"
                value={saleProductId}
                onChange={setSaleProductId}
                options={settings.products.map((product) => ({
                  value: product.id,
                  label: product.title,
                }))}
              />
              <NumberInput label="Qtd." value={saleQuantity} onChange={setSaleQuantity} />
              <TextInput label="Pagamento" value={salePayment} onChange={setSalePayment} />
            </div>
            <TextInput
              label="Observacao"
              value={saleNotes}
              onChange={setSaleNotes}
              placeholder="Ex.: cliente, ponto de venda, combo"
            />
            <ActionButton onClick={addSale} icon={Plus}>
              Adicionar venda
            </ActionButton>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-fervo-green/10 bg-white/75 shadow-[0_10px_30px_rgba(14,47,36,0.07)]">
            <div className="border-b border-fervo-green/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fervo-olive">
                estoque
              </p>
              <h2 className="text-xl font-semibold">O que tem pronto e o que falta</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-fervo-green text-fervo-cream">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Sabor</th>
                    <th className="px-4 py-3 text-right font-semibold">Pronto</th>
                    <th className="px-4 py-3 text-right font-semibold">Meta</th>
                    <th className="px-4 py-3 text-right font-semibold">Falta</th>
                    <th className="px-4 py-3 text-right font-semibold">Custo p/ repor</th>
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map((row) => (
                    <tr key={row.product.id} className="border-t border-fervo-green/10">
                      <td className="px-4 py-4 font-semibold">{row.product.title}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{row.stock}</td>
                      <td className="px-4 py-4 text-right tabular-nums">{row.product.targetStock}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">
                        {row.needed}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {row.restockCost === null ? "Custo desconhecido" : formatCurrency(row.restockCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            <Panel
              icon={WalletCards}
              eyebrow="caixa"
              title="Dinheiro da venda"
              helper="Nao e lucro livre enquanto a reposicao nao estiver separada."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <MoneyBox label="Entrou" value={metrics.revenue} />
                <MoneyBox label="Guardar" value={metrics.reserve} />
                <MoneyBox label="Sobra antes dos gastos" value={metrics.freeCash} />
              </div>
              <div className="rounded-xl border border-fervo-green/10 bg-fervo-cream/70 p-3 text-sm leading-6 text-fervo-green/70">
                Regra atual: guardar{" "}
                <CurrencyInput
                  value={settings.reservePerBottle}
                  onChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      reservePerBottle: Math.max(0, value),
                    }))
                  }
                />{" "}
                por garrafa vendida para recomprar rotulo, garrafa, mate, acucar,
                polpa e gengibre.
              </div>
            </Panel>

            <Panel
              icon={Save}
              eyebrow="precos"
              title="Ajustar ficha rapida"
              helper="Quando voce descobrir o preco real da polpa, troque o custo aqui."
            >
              <div className="space-y-3">
                {settings.products.map((product) => (
                  <div
                    key={product.id}
                    className="grid gap-2 rounded-xl border border-fervo-green/10 bg-fervo-cream/65 p-3 sm:grid-cols-[1fr_92px_92px_92px]"
                  >
                    <p className="self-center text-sm font-semibold leading-5">
                      {product.title}
                    </p>
                    <CurrencyField
                      label="Venda"
                      value={product.salePrice}
                      onChange={(value) => updateProduct(product.id, "salePrice", value)}
                    />
                    <p className="text-sm">{product.cost === null ? "Custo desconhecido" : "Custo local informado"}</p>
                    <CurrencyField
                      label="Custo local (opcional)"
                      value={product.cost ?? 0}
                      onChange={(value) => updateProduct(product.id, "cost", value)}
                    />
                    <SmallNumberField
                      label="Meta"
                      value={product.targetStock}
                      onChange={(value) => updateProduct(product.id, "targetStock", value)}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <HistoryPanel
            title="Ultimos lotes"
            empty="Nenhum lote lancado ainda."
            items={batches.map((batch) => ({
              id: batch.id,
              title: productById.get(batch.productId)?.title ?? batch.productId,
              detail: `${batch.quantity} garrafas - custo ${formatCurrency(
                batch.quantity * (batch.cost ?? 0),
              )}`,
              meta: batch.notes || batch.date,
              onDelete: () => deleteBatch(batch.id),
            }))}
          />
          <HistoryPanel
            title="Ultimas vendas"
            empty="Nenhuma venda lancada ainda."
            items={sales.map((sale) => ({
              id: sale.id,
              title: productById.get(sale.productId)?.title ?? sale.productId,
              detail: `${sale.quantity} un - ${formatCurrency(
                sale.quantity * sale.unitPrice,
              )} - ${sale.payment}`,
              meta: sale.notes || sale.date,
              onDelete: () => deleteSale(sale.id),
            }))}
          />
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-fervo-green/10 bg-white/75 p-4 shadow-[0_10px_30px_rgba(14,47,36,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fervo-olive">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  body,
}: {
  tone: "ok" | "warning" | "danger";
  title: string;
  body: string;
}) {
  const classes =
    tone === "danger"
      ? "border-fervo-terracotta/25 bg-fervo-terracotta/10 text-fervo-terracotta"
      : tone === "warning"
        ? "border-fervo-olive/35 bg-fervo-olive/15 text-fervo-green"
        : "border-fervo-green/15 bg-fervo-green/10 text-fervo-green";

  return (
    <div className={`rounded-2xl border p-4 lg:max-w-sm ${classes}`}>
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle aria-hidden="true" size={17} />
        {title}
      </div>
      <p className="mt-2 text-sm leading-5 text-fervo-green/70">{body}</p>
    </div>
  );
}

function Panel({
  icon: Icon,
  eyebrow,
  title,
  helper,
  children,
}: {
  icon: typeof PackagePlus;
  eyebrow: string;
  title: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-fervo-green/10 bg-white/75 p-5 shadow-[0_10px_30px_rgba(14,47,36,0.07)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fervo-green text-fervo-cream">
          <Icon aria-hidden="true" size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fervo-olive">
            {eyebrow}
          </p>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-fervo-green/60">{helper}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: typeof Plus;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-fervo-green px-5 py-3 text-sm font-semibold text-fervo-cream transition hover:bg-fervo-terracotta"
    >
      <Icon aria-hidden="true" size={17} />
      {children}
    </button>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-xl border border-fervo-green/15 bg-fervo-cream px-3 py-2 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 min-h-11 w-full rounded-xl border border-fervo-green/15 bg-fervo-cream px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-11 w-full rounded-xl border border-fervo-green/15 bg-fervo-cream px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

function CurrencyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      value={String(value).replace(".", ",")}
      onChange={(event) => onChange(numberFromInput(event.target.value))}
      className="mx-1 inline-block w-16 rounded-lg border border-fervo-green/15 bg-white px-2 py-1 text-center font-semibold tabular-nums outline-none"
    />
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-fervo-green/55">{label}</span>
      <input
        value={String(value).replace(".", ",")}
        onChange={(event) => onChange(numberFromInput(event.target.value))}
        className="mt-1 min-h-10 w-full rounded-lg border border-fervo-green/15 bg-white px-2 py-2 text-right text-sm tabular-nums outline-none"
      />
    </label>
  );
}

function SmallNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-fervo-green/55">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-1 min-h-10 w-full rounded-lg border border-fervo-green/15 bg-white px-2 py-2 text-right text-sm tabular-nums outline-none"
      />
    </label>
  );
}

function MoneyBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-fervo-green/10 bg-fervo-cream/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fervo-olive">
        {label}
      </p>
      <p className="mt-1 font-semibold tabular-nums">{formatCurrency(value)}</p>
    </div>
  );
}

function HistoryPanel({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{
    id: string;
    title: string;
    detail: string;
    meta: string;
    onDelete: () => void;
  }>;
}) {
  return (
    <section className="rounded-2xl border border-fervo-green/10 bg-white/75 p-5 shadow-[0_10px_30px_rgba(14,47,36,0.07)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fervo-green text-fervo-cream">
          <ClipboardList aria-hidden="true" size={18} />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fervo-green/20 px-4 py-5 text-sm text-fervo-green/60">
          {empty}
        </p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-fervo-green/10 bg-fervo-cream/60 p-3 text-sm"
            >
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-fervo-green/65">{item.detail}</p>
                <p className="mt-1 text-xs text-fervo-green/50">{item.meta}</p>
              </div>
              <button
                type="button"
                onClick={item.onDelete}
                className="flex h-9 w-9 items-center justify-center rounded-full text-fervo-terracotta transition hover:bg-fervo-terracotta/10"
                aria-label="Excluir lancamento"
              >
                <Trash2 aria-hidden="true" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
