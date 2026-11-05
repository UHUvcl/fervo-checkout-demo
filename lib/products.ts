export type ProductCategory = "chas" | "breakfast" | "sanduiches" | "marmitas" | "secos";

export type MealComponent = {
  label: string;
  weight: string;
  detail: string;
};

export type MealDetails = {
  weight: string;
  container: string;
  components: MealComponent[];
  note?: string;
};

export type MealSizeGuide = {
  title: string;
  weight: string;
  container: string;
  components: Array<{
    label: string;
    weight: string;
  }>;
  note: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  profile: string;
  unitPrice: number;
  category: ProductCategory;
  badge?: string;
  comboEligible?: boolean;
  mealDetails?: MealDetails;
};

export type CategoryConfig = {
  id: ProductCategory;
  title: string;
  eyebrow: string;
  description: string;
};

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: "chas",
    title: "Chas gelados",
    eyebrow: "pronta entrega",
    description:
      "Retomada enxuta da FERVO: chas de 300 ml a R$10, receita padronizada e custo medido por lote.",
  },
];

export const MEAL_SIZE_GUIDES: MealSizeGuide[] = [
  {
    title: "Marmita 350g",
    weight: "350g",
    container: "embalagem 500ml",
    components: [
      { label: "Proteina", weight: "125g" },
      { label: "Carboidrato", weight: "110g" },
      { label: "Legumes/vegetais", weight: "90g" },
      { label: "Molho/finalizacao", weight: "25g" },
    ],
    note: "Boa para refeicao mais leve, mantendo medida justa.",
  },
  {
    title: "Marmita 450g",
    weight: "450g",
    container: "embalagem 700ml",
    components: [
      { label: "Proteina", weight: "160g" },
      { label: "Carboidrato", weight: "140g" },
      { label: "Legumes/vegetais", weight: "120g" },
      { label: "Molho/finalizacao", weight: "30g" },
    ],
    note: "Mais reforcada para quem treina pesado ou quer mais volume.",
  },
];

const FIT_350_NOTE = "Pesado cozido/pronto. Total final: 350g.";
const TREINO_450_NOTE = "Pesado cozido/pronto. Total final: 450g.";

export const PRODUCTS: Product[] = [
{id:"mate-limao",title:"Cha Aurora",description:"Bebida ficticia de limao",profile:"Produto demonstrativo",unitPrice:10,category:"chas"},
{id:"mate-gengibre-limao",title:"Cha Jardim",description:"Bebida ficticia de gengibre",profile:"Produto demonstrativo",unitPrice:10,category:"chas"}
];
export const PRODUCT_BY_ID = new Map(PRODUCTS.map(product => [product.id, product]));
