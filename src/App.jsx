import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  Trash2,
  Truck,
  Upload,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  X,
} from "lucide-react";
import {
  contractTemplates,
  goals,
  initialState,
  navItems,
  reportTemplates,
  stages,
} from "./data.js";
import {
  createRemoteUser,
  getRemoteSession,
  getRemoteToken,
  loadRemoteState,
  loginRemote,
  logoutRemote,
  remoteApiEnabled,
  saveRemoteState,
  setRemoteToken,
} from "./remote-api.js";

const navIcons = {
  dashboard: LayoutDashboard,
  crm: Users,
  sales: ShoppingCart,
  warehouse: Warehouse,
  deliveries: Truck,
  finance: Wallet,
  invoices: FileText,
  accounting: BarChart3,
  tax: CalendarClock,
  credits: CreditCard,
  receivables: Wallet,
  vendors: Building2,
  projects: BarChart3,
  production: Package,
  hr: UserCog,
  kpi: TrendingUp,
  contracts: FileText,
  reports: BarChart3,
  support: MessageSquare,
  help: FileText,
  onboarding: ShieldCheck,
  messages: MessageSquare,
  notifications: Bell,
  api: ShieldCheck,
  settings: Settings,
};

const pageMeta = {
  dashboard: {
    title: "İdarəetmə Paneli",
    subtitle: "Satış, anbar, maliyyə və HR göstəricilərinin real vaxt icmalı.",
    action: "Yeni sifariş",
  },
  crm: {
    title: "CRM — Müştəri İdarəetməsi",
    subtitle: "FİN kodu, borc limiti, kateqoriya və 360° müştəri görünüşü.",
    action: "Yeni müştəri",
  },
  sales: {
    title: "Satış Modulu",
    subtitle: "Sifarişlər, satıcı bölgüsü, bonuslar və stok uyğunluğu.",
    action: "Yeni sifariş",
  },
  warehouse: {
    title: "Anbar qalıqları",
    subtitle: "Məhsul və anbar üzrə cari qalıq, rezerv, mövcud stok və dəyər nəzarəti.",
    action: "Yeni anbar",
  },
  deliveries: {
    title: "Təhvil İdarəetməsi",
    subtitle: "Zavoddan müştəriyə qədər 6 mərhələli workflow tracker.",
    action: "Yeni təhvil",
  },
  finance: {
    title: "Maliyyə Modulu",
    subtitle: "Xərc təsdiq axını və cash balans idarəetməsi.",
    action: "Yeni xərc",
  },
  invoices: {
    title: "Faktura & E-qaimə",
    subtitle: "Satış sifarişlərindən avtomatik faktura, ƏDV bölgüsü və e-qaimə hazırlığı.",
    action: "Faktura yarat",
  },
  accounting: {
    title: "Mühasibat",
    subtitle: "Hesablar planı, jurnal yazılışları, balans, P&L və cash flow görünüşü.",
    action: "Jurnal export",
  },
  tax: {
    title: "Vergi Təqvimi",
    subtitle: "ƏDV, DSMF, əmək haqqı və rüblük vergi öhdəliklərinin izlənməsi.",
    action: "Təqvimi yoxla",
  },
  credits: {
    title: "Kredit İdarəetməsi",
    subtitle: "Avtomatik kredit cədvəli və SMS xatırlatma sistemi.",
    action: "Yeni kredit satış",
  },
  receivables: {
    title: "Debitor & Kreditor",
    subtitle: "Müştəri borcları, vendor öhdəlikləri və gecikmə risklərinin vahid reyestri.",
    action: "Balansı yenilə",
  },
  vendors: {
    title: "Vendorlar & Kvota",
    subtitle: "Vendor müqavilələri, SKU portfeli və satış kvota izləməsi.",
    action: "Yeni vendor",
  },
  projects: {
    title: "Layihə ROI",
    subtitle: "Kampaniya, layihə və təşəbbüslər üzrə gəlir, xərc və rentabellik.",
    action: "ROI export",
  },
  production: {
    title: "İstehsalat & Maya Dəyəri",
    subtitle: "BOM, xammal sərfi, istehsal gücü və vahid maya dəyəri.",
    action: "Yeni istehsal planı",
  },
  hr: {
    title: "İnsan Resursları",
    subtitle: "Əməkdaş məlumat bazası, maaş fondu və performans.",
    action: "Yeni əməkdaş",
  },
  kpi: {
    title: "KPI & Performans",
    subtitle: "Şöbələr və əməkdaşlar üzrə açar performans göstəriciləri.",
    action: "Hədəf əlavə et",
  },
  contracts: {
    title: "Müqavilələr",
    subtitle: "Şablondan avtomatik hazırlama və PDF/DOCX ixracı.",
    action: "Yeni müqavilə",
  },
  reports: {
    title: "Hesabatlar & Analitika",
    subtitle: "Bütün modullar üzrə hesabat, cədvəl və ixrac.",
    action: "PDF export",
  },
  support: {
    title: "Support & Task",
    subtitle: "Daxili dəstək sorğuları, SLA, məsul şəxs və tətbiq tapşırıqları.",
    action: "Yeni sorğu",
  },
  help: {
    title: "Kömək Mərkəzi",
    subtitle: "Modul izahları, FAQ və istifadəçi təlimatı.",
    action: "Məqalə əlavə et",
  },
  onboarding: {
    title: "Onboarding Wizard",
    subtitle: "Yeni şirkət qurulumu, ilkin data və təlim addımlarının idarəsi.",
    action: "Addımı tamamla",
  },
  messages: {
    title: "Daxili Mesajlaşma",
    subtitle: "Şöbələrarası qeydlər, sifarişə bağlı müzakirələr və qərarlar.",
    action: "Yeni mesaj",
  },
  notifications: {
    title: "Bildirişlər",
    subtitle: "Push, SMS və daxili sistem xəbərdarlıqları.",
    action: "Hamısını oxu",
  },
  api: {
    title: "API & Webhook",
    subtitle: "Modul hadisələri, inteqrasiya endpoint-ləri və avtomatik göndəriş növbəsi.",
    action: "Webhook test",
  },
  settings: {
    title: "Tənzimləmələr",
    subtitle: "Şirkət məlumatları, inteqrasiyalar, rollar və icazələr.",
    action: "Yadda saxla",
  },
};

const creditTermOptions = [2, 3, 4, 5, 6, 12, 18, 24, 36, 48];
const currentBusinessDate = formatDateInput(new Date());
const currentBusinessYear = currentBusinessDate.slice(0, 4);
const currentBusinessQuarter = Math.floor(new Date().getMonth() / 3) + 1;
const baseCreditDate = currentBusinessDate;
const baseDeliveryDate = currentBusinessDate;
const baseCashBalance = 0;
const baseFinanceDate = currentBusinessDate;
const dayInMs = 24 * 60 * 60 * 1000;
const localDbKey = "erpaz.local.backend.v1";
const localDbSchemaVersion = 2;
const localDbBaselineVersion = 1;
const targetDbProvider = String(import.meta.env?.VITE_DB_PROVIDER || "sqlite").trim();
const defaultDbProvider = "Local persistent DB";
const deploymentToolkitReady = true;

const permissionCatalog = [
  { key: "crm.manage", label: "CRM idarəsi" },
  { key: "sales.create", label: "Satış yaratmaq" },
  { key: "warehouse.manage", label: "Anbar idarəsi" },
  { key: "delivery.complete", label: "Təhvil tamamlamaq" },
  { key: "finance.manage", label: "Maliyyə təsdiqi" },
  { key: "invoices.manage", label: "Faktura/e-qaimə" },
  { key: "accounting.manage", label: "Mühasibat" },
  { key: "tax.manage", label: "Vergi təqvimi" },
  { key: "credits.manage", label: "Kredit idarəsi" },
  { key: "receivables.manage", label: "Debitor/kreditor" },
  { key: "vendors.manage", label: "Vendor idarəsi" },
  { key: "vendors.po", label: "PO yarat/təsdiq et" },
  { key: "projects.manage", label: "ROI layihələri" },
  { key: "production.manage", label: "İstehsalat" },
  { key: "hr.manage", label: "HR idarəsi" },
  { key: "kpi.manage", label: "KPI idarəsi" },
  { key: "contracts.manage", label: "Müqavilə idarəsi" },
  { key: "support.manage", label: "Support/Task" },
  { key: "onboarding.manage", label: "Onboarding" },
  { key: "api.manage", label: "API/Webhook" },
  { key: "system.backup", label: "Backup və integrity" },
  { key: "settings.manage", label: "Ayarlar və rollar" },
];

const defaultRoles = [
  {
    name: "Super Admin",
    users: "2 istifadəçi",
    scope: "Bütün modullar",
    permissions: permissionCatalog.map((item) => item.key),
  },
  {
    name: "Satış Meneceri",
    users: "12 istifadəçi",
    scope: "CRM, Satış, Kredit oxunuşu",
    permissions: ["crm.manage", "sales.create", "contracts.manage"],
  },
  {
    name: "Anbar İşçisi",
    users: "8 istifadəçi",
    scope: "Anbar və təhvil",
    permissions: ["warehouse.manage", "delivery.complete", "production.manage", "support.manage"],
  },
  {
    name: "Maliyyəçi",
    users: "4 istifadəçi",
    scope: "Maliyyə və kredit kassası",
    permissions: [
      "finance.manage",
      "invoices.manage",
      "accounting.manage",
      "tax.manage",
      "credits.manage",
      "receivables.manage",
      "projects.manage",
      "api.manage",
      "support.manage",
    ],
  },
  {
    name: "HR Mütəxəssisi",
    users: "3 istifadəçi",
    scope: "HR və KPI",
    permissions: ["hr.manage", "kpi.manage", "support.manage", "onboarding.manage"],
  },
];

function money(value) {
  return `${new Intl.NumberFormat("az-AZ").format(value)} ₼`;
}

function percent(value) {
  return `${new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 1 }).format(value)}%`;
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("az-AZ");
}

function formatPaymentDate(date) {
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsePaymentDate(value) {
  const text = String(value ?? "").trim();
  if (!text || text === "—") return null;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const local = text.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (local) {
    return new Date(Number(local[3]), Number(local[2]) - 1, Number(local[1]));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateInputValue(value) {
  return formatDateInput(parsePaymentDate(value));
}

function addMonths(dateValue, months) {
  const date = parsePaymentDate(dateValue) || new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date;
}

function shiftPaymentDate(value, months) {
  const date = parsePaymentDate(value);
  if (!date) return baseCreditDate;
  date.setMonth(date.getMonth() + months);
  return formatDateInput(date);
}

function getCreditPlanStartDate(credit) {
  const nextDate = parsePaymentDate(credit.next);
  if (!nextDate) return baseCreditDate;
  const nextInstallmentNumber = Math.max(1, Number(credit.paidMonths || 0) + 1);
  return shiftPaymentDate(formatDateInput(nextDate), -nextInstallmentNumber);
}

function buildCreditPlan({ total, initialPayment = 0, months = 12, startDate = baseCreditDate }) {
  const term = creditTermOptions.includes(Number(months)) ? Number(months) : 12;
  const totalAmount = Math.max(0, Math.round(Number(total || 0)));
  const upfront = Math.min(totalAmount, Math.max(0, Math.round(Number(initialPayment || 0))));
  const balance = Math.max(0, totalAmount - upfront);
  let regularPayment = balance > 0 ? Math.round(balance / term) : 0;

  if (term > 1 && regularPayment * (term - 1) >= balance) {
    regularPayment = Math.floor(balance / term);
  }

  const installments = [];
  let accumulated = 0;

  for (let month = 1; month <= term; month += 1) {
    const isLast = month === term;
    const amount = isLast ? Math.max(0, balance - accumulated) : regularPayment;
    accumulated += amount;
    installments.push({
      month,
      amount,
      due: formatPaymentDate(addMonths(startDate, month)),
    });
  }

  return {
    total: totalAmount,
    initialPayment: upfront,
    balance,
    months: term,
    monthly: installments[0]?.amount || 0,
    lastPayment: installments[installments.length - 1]?.amount || 0,
    installments,
  };
}

function getCreditDisplayPlan(credit) {
  const paidMonths = Number(credit.paidMonths || 0);
  const plan =
    Array.isArray(credit.installments) && credit.installments.length > 0
      ? {
          total: Number(credit.total || 0),
          initialPayment: Number(credit.initialPayment || 0),
          balance: Number(credit.balance ?? Math.max(0, credit.total - Number(credit.initialPayment || 0))),
          months: Number(credit.months || credit.installments.length),
          monthly: Number(credit.monthly ?? credit.installments[0]?.amount ?? 0),
          lastPayment: Number(
            credit.lastPayment ?? credit.installments[credit.installments.length - 1]?.amount ?? credit.monthly ?? 0,
          ),
          installments: credit.installments,
        }
      : (() => {
          const generatedPlan = buildCreditPlan({
          total: credit.total,
          initialPayment: credit.initialPayment || 0,
          months: credit.months,
          startDate: getCreditPlanStartDate(credit),
          });
          const installments = generatedPlan.installments.map((installment, index) =>
            index < paidMonths ? { ...installment, amount: 0 } : installment,
          );
          const paidPrincipal = generatedPlan.installments
            .slice(0, paidMonths)
            .reduce((sum, installment) => sum + Number(installment.amount || 0), 0);

          return {
            ...generatedPlan,
            balance:
              credit.balance === undefined
                ? Math.max(0, generatedPlan.balance - paidPrincipal)
                : Number(credit.balance || 0),
            installments,
          };
        })();

  return plan;
}

function daysBetween(from, to) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / dayInMs);
}

function addDays(dateValue, days) {
  const parsed = parsePaymentDate(dateValue);
  const date = parsed ? new Date(parsed.getTime()) : new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return parsePaymentDate(currentBusinessDate) || new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return date;
}

function roundMoney(value) {
  return Math.round(Number(value || 0));
}

function getCreditPaymentState(credit, plan = getCreditDisplayPlan(credit)) {
  if (normalize(credit.status).includes("tamam")) {
    return {
      nextInstallment: null,
      dueDate: null,
      daysOverdue: 0,
      isDueToday: false,
      isOverdue: false,
    };
  }

  const nextIndex = Math.min(Number(credit.paidMonths || 0), Math.max(0, plan.installments.length - 1));
  const scheduled = plan.installments[nextIndex] || plan.installments[0] || null;
  const due = credit.next && credit.next !== "—" ? credit.next : scheduled?.due;
  const nextInstallment = scheduled ? { ...scheduled, due } : null;
  const dueDate = parsePaymentDate(due);
  const today = parsePaymentDate(baseCreditDate);
  const dayDelta = dueDate && today ? daysBetween(dueDate, today) : 0;
  const statusOverdue = normalize(credit.status).includes("gecik");

  return {
    nextInstallment,
    dueDate,
    daysOverdue: Math.max(0, dayDelta),
    isDueToday: Boolean(dueDate && today && dayDelta === 0),
    isOverdue: Boolean((dueDate && today && dayDelta > 0) || statusOverdue),
  };
}

function getCreditSourceLabel(credit) {
  return credit.salesSource || credit.orderId ? "Satışdan gələn" : "Manual kredit";
}

function getCreditPaidTotal(plan) {
  return Math.max(0, Number(plan.total || 0) - Number(plan.balance || 0));
}

function getCreditRiskLabel(item) {
  if (item.paymentState.isOverdue) return `${item.paymentState.daysOverdue} gün gecikib`;
  if (item.paymentState.isDueToday) return "Bu gün yığım";
  if (normalize(item.credit.status).includes("tamam")) return "Tamamlanıb";
  return "Aktiv izləmə";
}

function matchesCreditDashboardFilter(item, filter) {
  if (filter === "Bu günə olan ödənişlər") return item.paymentState.isDueToday;
  if (filter === "Gecikən ödənişlər") return item.paymentState.isOverdue;
  if (filter === "Aktiv") return normalize(item.credit.status).includes("aktiv");
  if (filter === "Tamamlanan") return normalize(item.credit.status).includes("tamam");
  if (filter === "Satışdan gələn") return getCreditSourceLabel(item.credit) === "Satışdan gələn";
  if (filter === "Yüksək qalıq") return Number(item.plan.balance || 0) >= 3000;
  return true;
}

function matchesCreditSourceFilter(item, sourceFilter) {
  return sourceFilter === "Bütün mənbələr" || getCreditSourceLabel(item.credit) === sourceFilter;
}

const monthNamesAz = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

function getCreditRowDate(item) {
  return parsePaymentDate(item.paymentState.nextInstallment?.due || item.credit.next || item.credit.date);
}

function matchesCreditManagementFilter(item, filter) {
  if (filter === "Aktiv") return normalize(item.credit.status).includes("aktiv");
  if (filter === "Gözləyən") {
    return (
      !item.paymentState.isOverdue &&
      !item.paymentState.isDueToday &&
      !normalize(item.credit.status).includes("tamam")
    );
  }
  if (filter === "Gecikmiş") return item.paymentState.isOverdue;
  if (filter === "Bağlanmış") return normalize(item.credit.status).includes("tamam");
  if (filter === "Bugünkü") return item.paymentState.isDueToday;
  if (filter === "Cari ay") {
    const date = getCreditRowDate(item);
    const today = parsePaymentDate(baseCreditDate);
    return Boolean(date && today && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth());
  }
  return true;
}

function matchesCreditSearch(item, query) {
  if (!query.trim()) return true;
  const q = normalize(query);
  const credit = item.credit;
  return normalize([
    credit.id,
    credit.customer,
    credit.fin,
    credit.contractId,
    credit.product,
    credit.device,
    credit.orderId,
    credit.warehouseName,
  ].join(" ")).includes(q);
}

function getCreditInitials(name = "") {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("az-AZ");
}

function getCreditManagementStatus(item) {
  if (item.paymentState.isOverdue) return `${item.paymentState.daysOverdue} gün gecikib`;
  if (item.paymentState.isDueToday) return "Bugünkü ödəniş";
  if (normalize(item.credit.status).includes("tamam")) return "Bağlanmış";
  return item.credit.status || "Aktiv";
}

function applyCreditPrincipalPayment(credit, principalAmount) {
  const plan = getCreditDisplayPlan(credit);
  const requestedPrincipal = Math.max(0, Math.round(Number(principalAmount || 0)));
  const appliedPrincipal = Math.min(requestedPrincipal, plan.balance);
  let remainingPrincipal = appliedPrincipal;
  const startIndex = Math.min(Number(credit.paidMonths || 0), Math.max(0, plan.installments.length - 1));
  const currentDueBefore = Number(plan.installments[startIndex]?.amount || 0);
  const installments = plan.installments.map((installment, index) => ({
    ...installment,
    amount: index < startIndex ? 0 : Number(installment.amount || 0),
  }));

  for (let index = startIndex; index < installments.length && remainingPrincipal > 0; index += 1) {
    const dueAmount = Number(installments[index].amount || 0);
    const appliedToMonth = Math.min(dueAmount, remainingPrincipal);
    installments[index] = {
      ...installments[index],
      amount: Math.max(0, dueAmount - appliedToMonth),
    };
    remainingPrincipal -= appliedToMonth;
  }

  const nextIndex = installments.findIndex((installment) => Number(installment.amount || 0) > 0);
  const nextInstallment = nextIndex >= 0 ? installments[nextIndex] : null;
  const nextBalance = Math.max(0, plan.balance - appliedPrincipal);
  const extraPrincipal = Math.max(0, appliedPrincipal - currentDueBefore);

  return {
    appliedPrincipal,
    currentDueBefore,
    extraPrincipal,
    installments,
    nextBalance,
    nextPaidMonths: nextIndex >= 0 ? nextIndex : plan.months,
    nextDue: nextInstallment?.due || "—",
    nextMonthly: nextInstallment?.amount || 0,
    status: nextBalance <= 0 ? "Tamamlandı" : "Aktiv",
  };
}

function summarizeOrderProducts(order) {
  if (Array.isArray(order.productLines) && order.productLines.length > 0) {
    return order.productLines
      .map((line) => `${line.product}${Number(line.qty || 1) > 1 ? ` x${Number(line.qty)}` : ""}`)
      .join(", ");
  }
  return order.products || "Cihaz qeyd edilməyib";
}

function getCreditIdForOrder(order) {
  return order.creditId || `KR-${String(order.id || "").replace(/\D/g, "")}`;
}

function buildSalesCreditRecord(order, storedCredit) {
  const totalAmount = Number(order.amount || storedCredit?.total || 0);
  const initialPayment = Number(order.initialPayment ?? order.paid ?? storedCredit?.initialPayment ?? 0);
  const months = Number(order.creditMonths || storedCredit?.months || 12);
  const basePlan = buildCreditPlan({ total: totalAmount, initialPayment, months });
  const productSummary = summarizeOrderProducts(order);

  return {
    ...(storedCredit || {}),
    id: storedCredit?.id || getCreditIdForOrder(order),
    salesSource: true,
    createdFrom: "Satış modulu",
    orderId: order.id,
    customer: order.customer,
    fin: order.fin,
    contractId: order.contractId || storedCredit?.contractId || `MQ-${order.id}`,
    product: productSummary,
    device: productSummary,
    productLines: order.productLines || [],
    seller: order.seller,
    warehouseName: order.warehouseName,
    total: totalAmount,
    initialPayment,
    balance: storedCredit?.balance ?? order.creditBalance ?? basePlan.balance,
    monthly: storedCredit?.monthly ?? order.creditMonthly ?? basePlan.monthly,
    lastPayment: storedCredit?.lastPayment ?? order.creditLastPayment ?? basePlan.lastPayment,
    months,
    paidMonths: storedCredit?.paidMonths ?? 0,
    rate: storedCredit?.rate ?? 0,
    next: storedCredit?.next || basePlan.installments[0]?.due || "—",
    status: storedCredit?.status || "Aktiv",
    installments: storedCredit?.installments || basePlan.installments,
    payments: storedCredit?.payments || [],
  };
}

function buildSalesCreditRecords(orders, storedCredits) {
  const storedByOrderId = new Map(storedCredits.filter((credit) => credit.orderId).map((credit) => [credit.orderId, credit]));
  const storedById = new Map(storedCredits.map((credit) => [credit.id, credit]));

  return orders
    .filter((order) => order.paymentMethod === "Kredit" || order.creditId)
    .map((order) => {
      const storedCredit = storedByOrderId.get(order.id) || storedById.get(order.creditId) || storedById.get(getCreditIdForOrder(order));
      return buildSalesCreditRecord(order, storedCredit);
    });
}

function buildAllCreditRecords(orders, storedCredits) {
  const salesRecords = buildSalesCreditRecords(orders, storedCredits);
  const salesRecordIds = new Set(salesRecords.map((credit) => credit.id));
  const salesOrderIds = new Set(salesRecords.map((credit) => credit.orderId).filter(Boolean));
  const manualRecords = storedCredits.filter((credit) => {
    if (salesRecordIds.has(credit.id)) return false;
    if (credit.orderId && salesOrderIds.has(credit.orderId)) return false;
    return true;
  });

  return [...salesRecords, ...manualRecords];
}

function parseSellerBonusText(text) {
  return String(text || "")
    .split(",")
    .map((part) => {
      const match = part.trim().match(/(.+?)\s+(\d+(?:\.\d+)?)%/);
      if (!match) return null;
      return {
        seller: match[1].trim(),
        bonus: Number(match[2] || 0),
      };
    })
    .filter(Boolean);
}

function getOrderSellerBonuses(order) {
  if (Array.isArray(order.sellerBonuses) && order.sellerBonuses.length > 0) {
    return order.sellerBonuses;
  }
  return parseSellerBonusText(order.seller);
}

function buildSalesBonusRows(orders) {
  return orders.flatMap((order) => {
    const paid = Number(order.paid || 0);
    return getOrderSellerBonuses(order).map((sellerBonus) => {
      const rate = Number(sellerBonus.bonus || 0);
      return {
        id: `${order.id}-${sellerBonus.seller}-${rate}`,
        orderId: order.id,
        date: order.date,
        customer: order.customer,
        product: summarizeOrderProducts(order),
        paymentMethod: order.paymentMethod || "Nağd",
        seller: sellerBonus.seller,
        rate,
        paid,
        bonusAmount: Math.round((paid * rate) / 100),
        status: order.status,
      };
    });
  });
}

function getCustomerRelatedCredits(customer, credits) {
  return credits.filter(
    (credit) => credit.fin === customer.fin || normalize(credit.customer) === normalize(customer.name),
  );
}

function getCustomerOrders(customer, orders) {
  return orders.filter(
    (order) => order.fin === customer.fin || normalize(order.customer) === normalize(customer.name),
  );
}

function getCustomerContracts(customer, contracts = []) {
  return contracts.filter(
    (contract) => contract.fin === customer.fin || normalize(contract.customer) === normalize(customer.name),
  );
}

function getOrderCredit(order, credits = []) {
  return credits.find(
    (credit) =>
      credit.orderId === order.id ||
      credit.id === order.creditId ||
      (order.contractId && credit.contractId === order.contractId),
  );
}

function getOrderProductRows(order) {
  if (Array.isArray(order.productLines) && order.productLines.length > 0) {
    return order.productLines.map((line) => {
      const qty = Math.max(1, Number(line.qty || 1));
      const amount = Math.max(0, Number(line.price || 0) * qty);
      return {
        product: line.product || order.products || "Cihaz qeyd edilməyib",
        qty,
        amount,
        serials: Array.isArray(line.serials) ? line.serials.filter(Boolean) : [],
      };
    });
  }

  return [
    {
      product: order.products || "Cihaz qeyd edilməyib",
      qty: 1,
      amount: Number(order.amount || 0),
      serials: [],
    },
  ];
}

function buildCustomer360(customer, { credits = [], orders = [], contracts = [] }) {
  const customerOrders = getCustomerOrders(customer, orders);
  const customerCredits = getCustomerRelatedCredits(customer, credits);
  const customerContracts = getCustomerContracts(customer, contracts);
  const contractByOrderId = new Map(customerContracts.filter((contract) => contract.orderId).map((contract) => [contract.orderId, contract]));
  const contractById = new Map(customerContracts.map((contract) => [contract.id, contract]));

  const deviceRows = customerOrders.flatMap((order) => {
    const linkedCredit = getOrderCredit(order, customerCredits);
    const plan = linkedCredit ? getCreditDisplayPlan(linkedCredit) : null;
    const paidTotal = linkedCredit ? getCreditPaidTotal(plan) : Number(order.paid || 0);
    const balanceTotal = linkedCredit ? Number(plan.balance || 0) : getOrderBalance(order);
    const lineRows = getOrderProductRows(order);
    const lineTotal = lineRows.reduce((sum, line) => sum + Number(line.amount || 0), 0) || Number(order.amount || 0) || 1;

    return lineRows.map((line) => {
      const lineAmount = Number(line.amount || 0) || Math.round(Number(order.amount || 0) / Math.max(1, lineRows.length));
      const ratio = Math.min(1, Math.max(0, lineAmount / lineTotal));
      const contract = contractByOrderId.get(order.id) || contractById.get(order.contractId);
      return {
        id: `${order.id}-${line.product}-${line.qty}`,
        product: line.product,
        qty: line.qty,
        serials: line.serials,
        orderId: order.id,
        contractId: order.contractId || contract?.id || linkedCredit?.contractId || "—",
        creditId: linkedCredit?.id || "—",
        date: order.date,
        status: order.status,
        amount: Math.round(lineAmount),
        paid: Math.round(paidTotal * ratio),
        balance: Math.round(balanceTotal * ratio),
      };
    });
  });

  const totalPurchased = deviceRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalPaid = deviceRows.reduce((sum, row) => sum + Number(row.paid || 0), 0);
  const totalBalance = deviceRows.reduce((sum, row) => sum + Number(row.balance || 0), 0);

  return {
    orders: customerOrders,
    credits: customerCredits,
    contracts: customerContracts,
    devices: deviceRows,
    totalPurchased,
    totalPaid,
    totalBalance,
  };
}

function getLatestOrder(orders) {
  return [...orders].sort((a, b) => {
    const dateA = parsePaymentDate(a.date)?.getTime() || 0;
    const dateB = parsePaymentDate(b.date)?.getTime() || 0;
    return dateB - dateA;
  })[0];
}

function buildCrmPipelineRows(customers, credits, orders) {
  return customers.map((customer, index) => {
    const customerCredits = getCustomerRelatedCredits(customer, credits);
    const customerOrders = getCustomerOrders(customer, orders);
    const latestOrder = getLatestOrder(customerOrders);
    const activeCreditCount = customerCredits.filter((credit) => !normalize(credit.status).includes("tamam")).length;
    const totalBalance = customerCredits.reduce((sum, credit) => sum + Number(getCreditDisplayPlan(credit).balance || 0), 0);
    const overdueCredit = customerCredits.find((credit) =>
      getCreditPaymentState(credit, getCreditDisplayPlan(credit)).isOverdue,
    );
    const limitLeft = Math.max(0, Number(customer.limit || 0) - Number(customer.debt || 0) - totalBalance);
    const openOrders = customerOrders.filter((order) => order.status !== "Təhvil verilib").length;
    const hasDeliveryFollowUp = openOrders > 0;
    const stage = overdueCredit
      ? "Risk follow-up"
      : hasDeliveryFollowUp
        ? "Təhvil sonrası"
        : customer.category === "Platin"
          ? "Upsell"
          : limitLeft > 3000
            ? "Təklif"
            : "Kredit uyğunluğu";
    const probability =
      stage === "Upsell" ? 82 : stage === "Təklif" ? 68 : stage === "Təhvil sonrası" ? 56 : stage === "Risk follow-up" ? 34 : 46;
    const owner = latestOrder?.sellerBonuses?.[0]?.seller || latestOrder?.seller || "Təyin edilməyib";
    const value = Math.max(0, Math.round((limitLeft || Number(customer.limit || 0) * 0.28) / 100) * 100);
    const nextPayment = customerCredits
      .map((credit) => getCreditPaymentState(credit, getCreditDisplayPlan(credit)).nextInstallment)
      .find(Boolean);

    return {
      id: `${customer.fin}-${stage}`,
      customer,
      stage,
      owner,
      value,
      probability,
      source: latestOrder ? `Son sifariş: ${latestOrder.id}` : customer.category,
      nextAction:
        stage === "Risk follow-up"
          ? "Gecikmə üzrə zəng və SMS"
          : stage === "Təhvil sonrası"
            ? "Təhvil sonrası məmnunluq zəngi"
            : stage === "Upsell"
              ? "Premium cihaz təklifi"
              : stage === "Təklif"
                ? "Limitə uyğun kommersiya təklifi"
                : "AKB və limit yoxlaması",
      activeCreditCount,
      totalBalance,
      openOrders,
      limitLeft,
      nextPayment,
      lastOrderId: latestOrder?.id || "Yeni fürsət",
    };
  });
}

function matchesCrmPipelineFilter(row, filter) {
  return filter === "Hamısı" || row.stage === filter;
}

function buildCreditRiskRows(enrichedCredits) {
  return enrichedCredits
    .map((item) => {
      const overdueDays = Number(item.paymentState.daysOverdue || 0);
      const balance = Number(item.plan.balance || 0);
      const monthly = Number(item.paymentState.nextInstallment?.amount || item.plan.monthly || 0);
      const score = Math.min(
        100,
        Math.round(overdueDays * 4 + balance / 150 + monthly / 40 + (item.paymentState.isOverdue ? 22 : 0)),
      );
      const level = score >= 75 ? "Yüksək risk" : score >= 45 ? "Nəzarət" : "Sağlam";
      const bucket =
        overdueDays === 0 ? "Vaxtında" : overdueDays <= 7 ? "1-7 gün" : overdueDays <= 30 ? "8-30 gün" : "30+ gün";

      return {
        ...item,
        riskScore: score,
        riskLevel: level,
        bucket,
        recommendedAction:
          level === "Yüksək risk"
            ? "Kollektor zəngi + restruktur təklifi"
            : level === "Nəzarət"
              ? "SMS və ödəmə linki"
              : "Avtomatik xatırlatma",
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

function buildCreditAgingBuckets(riskRows) {
  const buckets = ["Vaxtında", "1-7 gün", "8-30 gün", "30+ gün"];
  return buckets.map((bucket) => {
    const rows = riskRows.filter((row) => row.bucket === bucket);
    return {
      bucket,
      count: rows.length,
      amount: rows.reduce((sum, row) => sum + Number(row.paymentState.nextInstallment?.amount || 0), 0),
      balance: rows.reduce((sum, row) => sum + Number(row.plan.balance || 0), 0),
    };
  });
}

function buildProductLookup(products = []) {
  return new Map((products || []).map((product) => [normalize(product.name), product]));
}

function getReorderPoint(item = {}, productsByName = new Map()) {
  const catalogProduct = productsByName.get(normalize(item.product));
  const configuredPoint = catalogProduct?.reorderLevel ?? item.reorderLevel;
  if (configuredPoint !== undefined && configuredPoint !== null && configuredPoint !== "") {
    const point = Number(configuredPoint);
    if (Number.isFinite(point)) return Math.max(0, Math.round(point));
  }
  return Number(item.price || 0) >= 2000 ? 5 : 8;
}

function isLowStockItem(item, productsByName = new Map()) {
  const reorderPoint = getReorderPoint(item, productsByName);
  return reorderPoint > 0 && getAvailableQuantity(item) <= reorderPoint;
}

function buildWarehouseWmsRows(items, products = []) {
  const productsByName = buildProductLookup(products);

  return items.map((item, index) => {
    const available = getAvailableQuantity(item);
    const serialSummary = getSerialSummary(item.serials || []);
    const catalogProduct = productsByName.get(normalize(item.product));
    const reorderPoint = getReorderPoint(item, productsByName);
    const serialTracked = catalogProduct?.serialTracked ?? isSerialTrackedProduct(item);
    const reorderQty = Math.max(0, reorderPoint * 2 - available);
    const brandCode = normalize(item.product).replace(/[^a-z0-9]/g, "").slice(0, 5).toLocaleUpperCase("az-AZ");
    const sku = `SKU-${brandCode || index + 1}-${String(index + 1).padStart(3, "0")}`;
    const barcode = `869${String(index + 100000001).padStart(9, "0")}`;
    return {
      sku,
      barcode,
      qrPayload: `ERPZ|${sku}|${item.product}|${available}`,
      product: item.product,
      bin: `${String.fromCharCode(65 + (index % 4))}-${String((index % 6) + 1).padStart(2, "0")}`,
      serialMode: serialTracked ? "IMEI/Serial" : "Batch",
      cycleCount: index % 3 === 0 ? "Bu həftə" : index % 3 === 1 ? "Növbəti həftə" : "Aylıq",
      available,
      reserved: Number(item.reserved || 0),
      serialSummary,
      sampleSerial: item.serials?.find((serial) => serial.status !== "Satılıb")?.imei || "Batch",
      reorderPoint,
      reorderQty,
      status: reorderQty > 0 ? "Sifariş aç" : available <= reorderPoint + 2 ? "Nəzarət" : "Normal",
    };
  });
}

function getPreferredVendorName(product, vendors) {
  const normalizedProduct = normalize(product);
  const direct = vendors.find((vendor) => normalizedProduct.includes(normalize(vendor.name).split(" ")[0]));
  if (direct) return direct.name;
  return vendors[0]?.name || "Vendor təyin edilməyib";
}

function buildProcurementRows(vendors, warehouseStock, orders, products = []) {
  const productsByName = buildProductLookup(products);
  const byProduct = new Map();

  Object.values(warehouseStock).forEach((items) => {
    items.forEach((item) => {
      const current = byProduct.get(item.product) || {
        product: item.product,
        total: 0,
        reserved: 0,
        price: Number(item.price || 0),
      };
      current.total += Number(item.total || 0);
      current.reserved += Number(item.reserved || 0);
      current.price = Number(item.price || current.price || 0);
      byProduct.set(item.product, current);
    });
  });

  const soldByProduct = orders.reduce((map, order) => {
    (order.productLines || []).forEach((line) => {
      map.set(line.product, (map.get(line.product) || 0) + Number(line.qty || 0));
    });
    return map;
  }, new Map());

  return [...byProduct.values()]
    .map((item) => {
      const available = Math.max(0, item.total - item.reserved);
      const sold = soldByProduct.get(item.product) || 0;
      const demand = Math.max(4, sold * 2);
      const reorderPoint = getReorderPoint(item, productsByName);
      const targetQty = Math.max(demand, reorderPoint > 0 ? reorderPoint * 2 : 0);
      const recommendedQty = Math.max(0, targetQty - available);
      return {
        ...item,
        available,
        sold,
        reorderPoint,
        vendor: getPreferredVendorName(item.product, vendors),
        recommendedQty,
        estimatedCost: Math.round(recommendedQty * item.price * 0.76),
        status: recommendedQty > 0 ? "PO hazırla" : reorderPoint > 0 && available <= reorderPoint ? "Nəzarət" : "Kifayət edir",
      };
    })
    .sort((a, b) => b.recommendedQty - a.recommendedQty || a.available - b.available);
}

function buildFinanceScenario({ orders, expenses, credits, cashEntries, openingBalance = 0 }) {
  const ledger = buildFinanceLedger({ orders, expenses, cashEntries });
  const inflow = ledger.filter((row) => row.direction === "in").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const approvedExpense = expenses
    .filter((expense) => expense.status === "Təsdiq edildi" && hasExpenseCashImpact(expense))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const pendingExpense = expenses
    .filter((expense) => expense.status === "Təsdiq gözləyir" && hasExpenseCashImpact(expense))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const creditBalance = credits.reduce((sum, credit) => sum + Number(getCreditDisplayPlan(credit).balance || 0), 0);
  const grossSales = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const estimatedCost = Math.round(grossSales * 0.68);
  const grossProfit = grossSales - estimatedCost;

  return {
    inflow,
    approvedExpense,
    pendingExpense,
    creditBalance,
    grossSales,
    estimatedCost,
    grossProfit,
    margin: grossSales > 0 ? (grossProfit / grossSales) * 100 : 0,
    cashAfterPending: Number(openingBalance || 0) + inflow - approvedExpense - pendingExpense,
  };
}

function hasExpenseCashImpact(expense = {}) {
  if (expense.cashImpact === false) return false;
  return expense.source !== "HR Payroll";
}

function getInvoiceVatRate(invoiceSettings = {}) {
  return Number(invoiceSettings.vatRate || 18) / 100;
}

function buildInvoiceRows({ orders, settings = {}, invoiceSettings = {} }) {
  const vatRate = getInvoiceVatRate(invoiceSettings);
  const prefix = invoiceSettings.prefix || "EQ";
  const paymentTermsDays = Number(invoiceSettings.paymentTermsDays || 7);

  return orders.map((order, index) => {
    const totalAmount = roundMoney(order.amount);
    const netAmount = roundMoney(totalAmount / (1 + vatRate));
    const vatAmount = Math.max(0, totalAmount - netAmount);
    const balance = getOrderBalance(order);
    const dueDate = formatPaymentDate(addDays(order.date || currentBusinessDate, paymentTermsDays));
    const status =
      balance <= 0
        ? "Ödənilib"
        : Number(order.paid || 0) > 0
          ? "Qismən ödənilib"
          : "Ödəniş gözləyir";

    return {
      id: `${prefix}-${String(index + 1).padStart(4, "0")}`,
      orderId: order.id,
      contractId: order.contractId || "—",
      customer: order.customer,
      fin: order.fin,
      seller: settings.company || "ERP+CRM AZ",
      voen: settings.voen || "—",
      date: order.date || currentBusinessDate,
      dueDate,
      products: summarizeOrderProducts(order),
      paymentMethod: getOrderPaymentMethod(order),
      netAmount,
      vatAmount,
      totalAmount,
      paid: Number(order.paid || 0),
      balance,
      currency: invoiceSettings.defaultCurrency || "AZN",
      eTaxStatus: order.eTaxStatus || (balance <= 0 ? "E-qaimə göndərildi" : "Göndərişə hazır"),
      invoiceBatchId: order.invoiceBatchId,
      invoiceSentAt: order.invoiceSentAt,
      status,
    };
  });
}

function buildInvoiceSummary(invoices) {
  const paidRows = invoices.filter((invoice) => invoice.balance <= 0);
  const waitingRows = invoices.filter((invoice) => invoice.balance > 0);

  return {
    count: invoices.length,
    total: total(invoices, "totalAmount"),
    vat: total(invoices, "vatAmount"),
    paid: total(paidRows, "paid"),
    balance: total(waitingRows, "balance"),
    ready: invoices.filter((invoice) => invoice.eTaxStatus === "Göndərişə hazır").length,
  };
}

function buildCurrencyExposureRows({ currencyRates = [], orders, credits, cashEntries }) {
  const salesTotal = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const collectedTotal = orders.reduce((sum, order) => sum + Number(order.paid || 0), 0) + total(cashEntries, "amount");
  const creditBalance = credits.reduce((sum, credit) => sum + Number(getCreditDisplayPlan(credit).balance || 0), 0);

  return currencyRates.map((rate) => {
    const fxRate = Number(rate.rate || 1);
    const foreignSales = fxRate > 0 ? Math.round(salesTotal / fxRate) : salesTotal;
    const openExposure = Math.round((creditBalance / Math.max(fxRate, 1)) * Number(rate.change || 0) / 100);

    return {
      ...rate,
      salesEquivalent: foreignSales,
      collectedEquivalent: fxRate > 0 ? Math.round(collectedTotal / fxRate) : collectedTotal,
      exposureAzn: openExposure,
      status: rate.code === "AZN" ? "Baza" : Math.abs(Number(rate.change || 0)) >= 0.3 ? "Nəzarət" : rate.status,
    };
  });
}

function buildAccountingData({ orders, expenses, cashEntries, credits, stock, invoices, openingBalance = 0 }) {
  const salesRevenue = total(orders, "amount");
  const salesVat = total(invoices, "vatAmount");
  const salesNet = Math.max(0, salesRevenue - salesVat);
  const approvedExpenses = expenses.filter((expense) => expense.status === "Təsdiq edildi");
  const pendingExpenses = expenses.filter((expense) => expense.status === "Təsdiq gözləyir");
  const approvedExpenseTotal = total(approvedExpenses, "amount");
  const approvedCashExpenseTotal = approvedExpenses
    .filter((expense) => hasExpenseCashImpact(expense))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const pendingExpenseTotal = total(pendingExpenses, "amount");
  const pendingCashExpenseTotal = pendingExpenses
    .filter((expense) => hasExpenseCashImpact(expense))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const salesCollected = orders.reduce((sum, order) => sum + Number(order.paid || 0), 0);
  const creditCash = total(cashEntries, "amount");
  const cash = Number(openingBalance || 0) + salesCollected + creditCash - approvedCashExpenseTotal;
  const nonCreditReceivable = orders
    .filter((order) => getOrderPaymentMethod(order) !== "Kredit")
    .reduce((sum, order) => sum + getOrderBalance(order), 0);
  const creditReceivable = credits.reduce((sum, credit) => sum + Number(getCreditDisplayPlan(credit).balance || 0), 0);
  const receivable = nonCreditReceivable + creditReceivable;
  const inventory = stock.reduce(
    (sum, item) => sum + Math.round(getAvailableQuantity(item) * Number(item.price || 0) * 0.68),
    0,
  );
  const costOfGoods = Math.round(salesRevenue * 0.68);
  const penaltyIncome = cashEntries.reduce((sum, entry) => sum + Number(entry.penalty || 0), 0);
  const grossProfit = salesNet - costOfGoods;
  const netProfit = grossProfit + penaltyIncome - approvedExpenseTotal;
  const vatPayable = Math.max(0, salesVat - Math.round((approvedExpenseTotal * 18) / 118));

  const journalRows = [
    ...invoices.slice(0, 8).map((invoice) => ({
      id: `JR-${invoice.id}`,
      date: invoice.date,
      source: invoice.orderId,
      debit: invoice.balance > 0 ? "Kassa / Debitor" : "Kassa",
      credit: "Satış gəliri / ƏDV",
      amount: invoice.totalAmount,
      status: invoice.balance > 0 ? "Açıq" : "Bağlandı",
    })),
    ...cashEntries.slice(0, 4).map((entry) => ({
      id: `JR-${entry.id}`,
      date: entry.date,
      source: entry.creditId,
      debit: "Kassa",
      credit: Number(entry.penalty || 0) > 0 ? "Debitor / Gecikmə gəliri" : "Debitor",
      amount: entry.amount,
      status: "Kassa yazıldı",
    })),
    ...expenses.slice(0, 6).map((expense) => ({
      id: `JR-${expense.id}`,
      date: expense.date,
      source: expense.id,
      debit: expense.category,
      credit: expense.status === "Təsdiq edildi" && hasExpenseCashImpact(expense) ? "Kassa" : "Kreditor",
      amount: expense.amount,
      status: hasExpenseCashImpact(expense) ? expense.status : "Cash təsiri yoxdur",
    })),
  ];

  const chartRows = [
    { code: "1010", account: "Kassa", type: "Aktiv", debit: cash, credit: 0, balance: cash },
    { code: "1210", account: "Debitor borclar", type: "Aktiv", debit: receivable, credit: 0, balance: receivable },
    { code: "2050", account: "Mal ehtiyatları", type: "Aktiv", debit: inventory, credit: 0, balance: inventory },
    { code: "4310", account: "ƏDV öhdəliyi", type: "Öhdəlik", debit: 0, credit: vatPayable, balance: vatPayable },
    { code: "5310", account: "Kreditor borclar", type: "Öhdəlik", debit: 0, credit: pendingExpenseTotal, balance: pendingExpenseTotal },
    { code: "6010", account: "Satış gəliri", type: "Gəlir", debit: 0, credit: salesNet, balance: salesNet },
    { code: "7010", account: "Maya dəyəri", type: "Xərc", debit: costOfGoods, credit: 0, balance: costOfGoods },
    { code: "7310", account: "Əməliyyat xərcləri", type: "Xərc", debit: approvedExpenseTotal, credit: 0, balance: approvedExpenseTotal },
  ];

  return {
    journalRows,
    chartRows,
    balance: {
      assets: cash + receivable + inventory,
      liabilities: vatPayable + pendingExpenseTotal,
      equity: cash + receivable + inventory - vatPayable - pendingExpenseTotal,
    },
    pl: {
      revenue: salesNet,
      vat: salesVat,
      costOfGoods,
      grossProfit,
      penaltyIncome,
      operatingExpenses: approvedExpenseTotal,
      netProfit,
      margin: salesNet > 0 ? (netProfit / salesNet) * 100 : 0,
    },
    cashFlow: {
      opening: Number(openingBalance || 0),
      inflow: salesCollected + creditCash,
      outflow: approvedCashExpenseTotal,
      closing: cash,
      pendingOutflow: pendingCashExpenseTotal,
    },
    vatPayable,
  };
}

function calculatePayrollTax2026(grossValue) {
  const gross = Math.max(0, roundMoney(grossValue));
  const incomeTax =
    gross <= 2500
      ? Math.max(0, Math.round((gross - 200) * 0.03))
      : gross <= 8000
        ? Math.round(75 + (gross - 2500) * 0.1)
        : Math.round(625 + (gross - 8000) * 0.14);
  const employeeSocial = gross <= 200 ? Math.round(gross * 0.03) : Math.round(6 + (gross - 200) * 0.1);
  const employerSocial =
    gross <= 200
      ? Math.round(gross * 0.22)
      : gross <= 8000
        ? Math.round(44 + (gross - 200) * 0.15)
        : Math.round(44 + 7800 * 0.15 + (gross - 8000) * 0.11);
  const employeeUnemployment = Math.round(gross * 0.005);
  const employerUnemployment = Math.round(gross * 0.005);
  const totalDeductions = incomeTax + employeeSocial + employeeUnemployment;

  return {
    gross,
    incomeTax,
    employeeSocial,
    employeeUnemployment,
    totalDeductions,
    net: Math.max(0, gross - totalDeductions),
    employerSocial,
    employerUnemployment,
    employerCost: gross + employerSocial + employerUnemployment,
  };
}

function buildPayrollTaxCalculatorRows(records) {
  return records.map((record) => {
    const gross = Number(record.salary || 0) + Number(record.bonus || 0);
    return {
      employee: record.name,
      department: record.department,
      ...calculatePayrollTax2026(gross),
    };
  });
}

function getTaxAmountByType(type, { invoices, payrollTaxRows, accounting }) {
  const normalized = normalize(type);
  if (normalized.includes("ədv")) return total(invoices, "vatAmount");
  if (normalized.includes("payroll")) {
    return payrollTaxRows.reduce(
      (sum, row) =>
        sum +
        Number(row.incomeTax || 0) +
        Number(row.employeeSocial || 0) +
        Number(row.employeeUnemployment || 0) +
        Number(row.employerSocial || 0) +
        Number(row.employerUnemployment || 0),
      0,
    );
  }
  if (normalized.includes("mənfəət")) return Math.max(0, Math.round(Number(accounting.pl.netProfit || 0) * 0.2));
  if (normalized.includes("sadələşdirilmiş")) return Math.round(Number(accounting.pl.revenue || 0) * 0.02);
  return 0;
}

function buildTaxCalendarRows({ taxCalendar = [], invoices, payrollTaxRows, accounting }) {
  const today = parsePaymentDate(currentBusinessDate);

  return taxCalendar.map((item) => {
    const dueDate = parsePaymentDate(item.dueDate);
    const daysLeft = dueDate && today ? daysBetween(today, dueDate) : 0;
    const status =
      item.paymentStatus ||
      (daysLeft < 0 ? "Gecikib" : daysLeft === 0 ? "Bu gün" : daysLeft <= 7 ? "Yaxınlaşır" : "Planlı");

    return {
      ...item,
      daysLeft,
      amount: getTaxAmountByType(item.type, { invoices, payrollTaxRows, accounting }),
      status,
    };
  });
}

function buildApiWebhookRows({ apiWebhooks = [], invoices, credits, stock, products = [], purchaseOrders, expenses }) {
  const overdueCredits = credits.filter((credit) => getCreditPaymentState(credit, getCreditDisplayPlan(credit)).isOverdue);
  const productsByName = buildProductLookup(products);
  const lowStock = stock.filter((item) => isLowStockItem(item, productsByName));
  const eventCounts = {
    "invoice.paid": invoices.filter((invoice) => invoice.balance <= 0).length,
    "invoice.overdue": invoices.filter((invoice) => {
      const dueDate = parsePaymentDate(invoice.dueDate);
      const today = parsePaymentDate(currentBusinessDate);
      return invoice.balance > 0 && dueDate && today && daysBetween(dueDate, today) > 0;
    }).length,
    "credit.overdue": overdueCredits.length,
    "product.low_stock": lowStock.length,
    "po.approved": (purchaseOrders || []).filter((po) => po.status === "Təsdiq edildi").length,
    "payroll.created": expenses.filter((expense) => expense.source === "HR Payroll").length,
  };

  return apiWebhooks.map((webhook) => {
    const eventCount = eventCounts[webhook.event] || 0;
    const processedCount = Number(webhook.processedCount || 0);
    const queueCount = Math.max(0, eventCount - processedCount);
    const derivedPayload =
      webhook.event === "credit.overdue"
        ? overdueCredits[0]?.id || "Növbə boşdur"
        : webhook.event === "product.low_stock"
          ? lowStock[0]?.product || "Stok normaldır"
          : webhook.event === "invoice.paid"
            ? invoices.find((invoice) => invoice.balance <= 0)?.id || "Ödənilmiş faktura yoxdur"
            : webhook.event === "po.approved"
              ? (purchaseOrders || []).find((po) => po.status === "Təsdiq edildi")?.id || "Təsdiqli PO yoxdur"
              : "Hazır";

    return {
      ...webhook,
      queueCount,
      lastPayload: webhook.lastPayloadOverride || derivedPayload,
      health: webhook.lastTestAt ? "Test OK" : webhook.status === "Aktiv" ? "Canlı" : webhook.status,
    };
  });
}

function buildTodayActionRows({ credits, orders, expenses, stock, products = [], invoices, taxRows }) {
  const creditActions = credits
    .map((credit) => {
      const plan = getCreditDisplayPlan(credit);
      return { credit, paymentState: getCreditPaymentState(credit, plan), plan };
    })
    .filter((item) => item.paymentState.isOverdue || item.paymentState.isDueToday)
    .map((item) => ({
      id: `ACT-${item.credit.id}`,
      module: "credits",
      title: item.paymentState.isOverdue ? "Gecikən kredit" : "Bu gün kredit ödənişi",
      detail: `${item.credit.customer} · ${item.credit.contractId || item.credit.id}`,
      amount: Number(item.paymentState.nextInstallment?.amount || item.plan.monthly || 0),
      priority: item.paymentState.isOverdue ? "Yüksək" : "Orta",
      status: item.paymentState.isOverdue ? `${item.paymentState.daysOverdue} gün gecikib` : "Bu gün",
      icon: CreditCard,
    }));

  const deliveryActions = orders
    .filter((order) => order.status !== "Təhvil verilib" && getDeliveryRisk(enrichDeliveryOrder(order)) !== "Normal")
    .slice(0, 5)
    .map((order) => ({
      id: `ACT-${order.id}`,
      module: "deliveries",
      title: "Təhvil nəzarəti",
      detail: `${order.id} · ${order.customer} · ${summarizeOrderProducts(order)}`,
      amount: getOrderBalance(order),
      priority: getDeliveryAgeDays(order) >= 5 ? "Yüksək" : "Orta",
      status: getDeliveryRisk(order),
      icon: Truck,
    }));

  const expenseActions = expenses
    .filter((expense) => expense.status === "Təsdiq gözləyir")
    .map((expense) => ({
      id: `ACT-${expense.id}`,
      module: "finance",
      title: "Xərc təsdiqi",
      detail: `${expense.description} · ${expense.category}`,
      amount: Number(expense.amount || 0),
      priority: Number(expense.amount || 0) >= 5000 ? "Yüksək" : "Orta",
      status: expense.status,
      icon: Wallet,
    }));

  const productsByName = buildProductLookup(products);
  const stockActions = stock
    .filter((item) => isLowStockItem(item, productsByName))
    .map((item) => ({
      id: `ACT-STOCK-${item.product}`,
      module: "warehouse",
      title: "Aşağı stok",
      detail: `${item.product} · satış üçün ${getAvailableQuantity(item)} ədəd`,
      amount: getAvailableQuantity(item) * Number(item.price || 0),
      priority: getAvailableQuantity(item) <= 3 ? "Yüksək" : "Orta",
      status: "PO/transfer lazımdır",
      icon: Package,
    }));

  const invoiceActions = invoices
    .filter((invoice) => invoice.balance > 0)
    .slice(0, 4)
    .map((invoice) => ({
      id: `ACT-${invoice.id}`,
      module: "invoices",
      title: "Açıq faktura",
      detail: `${invoice.id} · ${invoice.customer}`,
      amount: Number(invoice.balance || 0),
      priority: invoice.status === "Ödəniş gözləyir" ? "Orta" : "Aşağı",
      status: invoice.status,
      icon: FileText,
    }));

  const taxActions = taxRows
    .filter((row) => row.status === "Bu gün" || row.status === "Gecikib" || row.status === "Yaxınlaşır")
    .map((row) => ({
      id: `ACT-${row.id}`,
      module: "tax",
      title: "Vergi öhdəliyi",
      detail: `${row.title} · ${row.period}`,
      amount: Number(row.amount || 0),
      priority: row.status === "Gecikib" || row.status === "Bu gün" ? "Yüksək" : "Orta",
      status: row.status,
      icon: CalendarClock,
    }));

  const priorityOrder = { "Yüksək": 0, Orta: 1, "Aşağı": 2 };
  return [...creditActions, ...taxActions, ...deliveryActions, ...expenseActions, ...stockActions, ...invoiceActions]
    .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9) || Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 12);
}

function buildExecutiveInsights({ orders, credits, vendors, employees }) {
  const creditRows = credits.map((credit) => {
    const plan = getCreditDisplayPlan(credit);
    return { credit, plan, paymentState: getCreditPaymentState(credit, plan) };
  });
  const overdueCount = creditRows.filter((item) => item.paymentState.isOverdue).length;
  const topSeller = [...employees].sort((a, b) => Number(b.kpi || 0) - Number(a.kpi || 0))[0];
  const vendorAtRisk = vendors.filter((vendor) => normalize(vendor.status).includes("risk") || normalize(vendor.status).includes("aşağı"));
  const openDelivery = orders.filter((order) => order.status !== "Təhvil verilib").length;

  return [
    {
      title: "Kredit portfeli",
      value: `${overdueCount} risk`,
      desc: overdueCount > 0 ? "Gecikən müştərilər üzrə kollektor növbəsi yaradın" : "Gecikmə siqnalı yoxdur",
      tone: overdueCount > 0 ? "danger" : "success",
    },
    {
      title: "Təhvil yükü",
      value: `${openDelivery} sifariş`,
      desc: "Anbar çıxışı və sürücü planı ilə izlənir",
      tone: openDelivery > 4 ? "warning" : "info",
    },
    {
      title: "Vendor riski",
      value: vendorAtRisk.length,
      desc: "Kvota və təchizat üzrə zəif vendorlar",
      tone: vendorAtRisk.length > 0 ? "warning" : "success",
    },
    {
      title: "HR/KPI",
      value: topSeller?.name || "Yoxdur",
      desc: topSeller ? `${topSeller.kpi}% KPI ilə lider` : "KPI datası yoxdur",
      tone: "primary",
    },
  ];
}

function buildReceivableRows({ customers, orders, credits, vendors, purchaseOrders }) {
  const customerRows = customers.map((customer) => {
    const relatedOrders = getCustomerOrders(customer, orders);
    const relatedCredits = getCustomerRelatedCredits(customer, credits);
    const orderBalance = relatedOrders.reduce((sum, order) => sum + getOrderBalance(order), 0);
    const creditBalance = relatedCredits.reduce((sum, credit) => sum + Number(getCreditDisplayPlan(credit).balance || 0), 0);
    const overdueCredit = relatedCredits.find((credit) =>
      getCreditPaymentState(credit, getCreditDisplayPlan(credit)).isOverdue,
    );
    const amount = Number(customer.debt || 0) + orderBalance + creditBalance;

    return {
      id: `DB-${customer.fin}`,
      type: "Debitor",
      party: customer.name,
      source: customer.fin,
      amount,
      overdueDays: Math.max(Number(customer.delay || 0), overdueCredit ? getCreditPaymentState(overdueCredit).daysOverdue : 0),
      owner: relatedOrders[0]?.sellerBonuses?.[0]?.seller || "Satış",
      status: overdueCredit || Number(customer.delay || 0) > 0 ? "Gecikmə" : amount > 0 ? "Aktiv" : "Bağlı",
      detail: `${relatedOrders.length} sifariş · ${relatedCredits.length} kredit`,
    };
  });

  const vendorRows = vendors.map((vendor) => {
    const vendorPos = (purchaseOrders || []).filter((po) => po.vendor === vendor.name);
    const pendingAmount = vendorPos
      .filter((po) => po.status !== "Ödənilib")
      .reduce((sum, po) => sum + Number(po.amount || 0), 0);
    const latestPo = vendorPos[0];

    return {
      id: `CR-${vendor.name}`,
      type: "Kreditor",
      party: vendor.name,
      source: vendor.country,
      amount: pendingAmount,
      overdueDays: pendingAmount > 0 && vendor.status !== "Aktiv" ? 5 : 0,
      owner: "Vendor/Maliyyə",
      status: pendingAmount > 0 ? "Ödəniş gözləyir" : vendor.status,
      detail: latestPo ? `${vendorPos.length} PO · son: ${latestPo.id}` : `${vendor.sku} SKU · PO yoxdur`,
    };
  });

  return [...customerRows, ...vendorRows].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
}

function buildProjectRoiRows({ projects, orders, expenses }) {
  return projects.map((project) => {
    const linkedProducts = new Set(project.linkedProducts || []);
    const projectOrders = orders.filter((order) =>
      (order.productLines || []).some((line) => linkedProducts.has(line.product)),
    );
    const revenue = projectOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const collected = projectOrders.reduce((sum, order) => sum + Number(order.paid || 0), 0);
    const productCost = Math.round(revenue * 0.68);
    const projectExpenses = expenses
      .filter((expense) => (project.expenseCategories || []).includes(expense.category))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalCost = productCost + projectExpenses;
    const profit = revenue - totalCost;
    const roi = project.budget > 0 ? (profit / project.budget) * 100 : 0;

    return {
      ...project,
      orders: projectOrders.length,
      revenue,
      collected,
      totalCost,
      profit,
      roi,
      status: profit < 0 ? "Risk" : roi >= 45 ? "Yüksək ROI" : project.status,
    };
  });
}

function buildNotificationAutomationRows({ notificationRules, credits, stock, products = [], purchaseOrders, expenses, orders }) {
  const overdueCredits = credits.filter((credit) => getCreditPaymentState(credit, getCreditDisplayPlan(credit)).isOverdue);
  const productsByName = buildProductLookup(products);
  const lowStock = stock.filter((item) => isLowStockItem(item, productsByName));
  const pendingPo = (purchaseOrders || []).filter((po) => po.status === "Təsdiq gözləyir");
  const pendingPayroll = expenses.filter((expense) => expense.source === "HR Payroll" && expense.status === "Təsdiq gözləyir");
  const lateDeliveries = orders.filter((order) => order.status !== "Təhvil verilib" && getDeliveryAgeDays(order) >= 5);

  const queueByRule = {
    "RULE-CREDIT-OVERDUE": {
      count: overdueCredits.length,
      event: overdueCredits[0]?.customer || "Gecikmə yoxdur",
    },
    "RULE-LOW-STOCK": {
      count: lowStock.length,
      event: lowStock[0]?.product || "Stok normaldır",
    },
    "RULE-PO-APPROVAL": {
      count: pendingPo.length,
      event: pendingPo[0]?.id || "PO növbəsi boşdur",
    },
    "RULE-PAYROLL": {
      count: pendingPayroll.length,
      event: pendingPayroll[0] ? money(pendingPayroll[0].amount) : "Payroll təsdiqdə deyil",
    },
  };

  return notificationRules.map((rule) => ({
    ...rule,
    queueCount: queueByRule[rule.id]?.count || 0,
    lastEvent: queueByRule[rule.id]?.event || (lateDeliveries[0]?.id ? `${lateDeliveries[0].id} SLA riski` : "Siqnal yoxdur"),
    health: rule.status === "Aktiv" && (queueByRule[rule.id]?.count || 0) > 0 ? "Göndəriş hazırdır" : rule.status,
  }));
}

function buildProductionPlanRows(productionPlans, stock) {
  const stockByProduct = new Map(stock.map((item) => [item.product, item]));

  return productionPlans.map((plan) => {
    const materials = (plan.materials || []).map((material) => {
      const stockItem = stockByProduct.get(material.product);
      const available = stockItem ? getAvailableQuantity(stockItem) : 0;
      const needed = Number(material.qty || 0) * Number(plan.plannedQty || 0);
      const unitPrice = Number(stockItem?.price || 0);

      return {
        ...material,
        needed,
        available,
        unitPrice,
        cost: Math.round(needed * unitPrice),
        enough: available >= needed,
      };
    });
    const materialCost = materials.reduce((sum, material) => sum + Number(material.cost || 0), 0);
    const totalCost = materialCost + Number(plan.laborCost || 0) + Number(plan.overheadCost || 0);
    const unitCost = Number(plan.plannedQty || 0) > 0 ? Math.round(totalCost / Number(plan.plannedQty || 1)) : 0;
    const projectedRevenue = Number(plan.salePrice || 0) * Number(plan.plannedQty || 0);
    const projectedProfit = projectedRevenue - totalCost;
    const bottleneck = materials.find((material) => !material.enough);

    return {
      ...plan,
      materials,
      materialCost,
      totalCost,
      unitCost,
      projectedRevenue,
      projectedProfit,
      margin: projectedRevenue > 0 ? (projectedProfit / projectedRevenue) * 100 : 0,
      bottleneck: bottleneck?.product || "Xammal kifayətdir",
      status: bottleneck ? "Xammal riski" : plan.status,
    };
  });
}

function buildOnboardingRows(onboarding = {}, snapshot = {}) {
  const checks = {
    "ONB-1": Boolean(snapshot.settings?.company && snapshot.settings?.voen),
    "ONB-2": (snapshot.warehouses || []).length > 0,
    "ONB-3": (snapshot.products || []).length > 0 && (snapshot.stock || []).length > 0,
    "ONB-4": (snapshot.settings?.users || []).length > 1,
    "ONB-5": (snapshot.financeAccounts || []).length > 0,
    "ONB-6": (snapshot.employees || []).length > 0,
  };
  let nextFound = false;
  const steps = (onboarding.steps || []).map((step) => {
    const completed = Boolean(checks[step.id]);
    const status = completed ? "Tamamlandı" : nextFound ? "Gözləyir" : "İcrada";
    if (!completed) nextFound = true;
    return { ...step, status };
  });
  const completed = steps.filter((step) => step.status === "Tamamlandı").length;

  return {
    steps,
    completed,
    progress: steps.length > 0 ? (completed / steps.length) * 100 : 0,
    nextStep: steps.find((step) => step.status !== "Tamamlandı") || null,
  };
}

function getOrderBalance(order) {
  return Math.max(0, Number(order.amount || 0) - Number(order.paid || 0));
}

function getOrderBonusAmount(order) {
  const paid = Number(order.paid || 0);
  return Math.round(
    getOrderSellerBonuses(order).reduce((sum, sellerBonus) => sum + (paid * Number(sellerBonus.bonus || 0)) / 100, 0),
  );
}

function getOrderDeliveryStatus(order) {
  if (order.status === "Təhvil verilib") return "Təhvil verilib";
  return order.deliveryStatus || "Təhvil gözləyir";
}

function getOrderPaymentMethod(order) {
  return order.paymentMethod || (getOrderBalance(order) > 0 ? "Qalıqlı" : "Nağd");
}

function normalizeOrderProductLines(rows = []) {
  return rows
    .filter((row) => row?.product)
    .map((row) => ({
      product: String(row.product || "").trim(),
      qty: Math.max(1, Math.round(Number(row.qty || 1))),
      price: Math.max(0, Number(row.price || 0)),
      serials: Array.isArray(row.serials) ? row.serials.filter(Boolean) : [],
    }));
}

function buildSellerBonusRows(rows = []) {
  return rows
    .filter((row) => row?.seller)
    .slice(0, 3)
    .map((row) => ({
      seller: row.seller,
      bonus: Math.max(0, Number(row.bonus || 0)),
    }));
}

function summarizeSellerBonusRows(rows = []) {
  return buildSellerBonusRows(rows)
    .map((row) => `${row.seller} ${Number(row.bonus || 0)}%`)
    .join(", ");
}

function calculateOrderLineTotal(productLines = []) {
  return normalizeOrderProductLines(productLines).reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.price || 0),
    0,
  );
}

function productLineSignature(productLines = []) {
  return normalizeOrderProductLines(productLines)
    .map((line) => `${line.product}:${line.qty}:${line.price}`)
    .join("|");
}

function buildSalesCreditForOrder(order, storedCredit) {
  const totalAmount = Number(order.amount || 0);
  const initialPayment = Number(order.initialPayment || 0);
  const months = Number(order.creditMonths || storedCredit?.months || 12);
  const creditPlan = buildCreditPlan({ total: totalAmount, initialPayment, months });
  const payments = Array.isArray(storedCredit?.payments) ? storedCredit.payments : [];
  const baseCredit = {
    ...(storedCredit || {}),
    id: order.creditId || storedCredit?.id || getCreditIdForOrder(order),
    salesSource: true,
    createdFrom: "Satış modulu",
    orderId: order.id,
    contractId: order.contractId || storedCredit?.contractId || `MQ-${order.id}`,
    customer: order.customer,
    fin: order.fin,
    product: summarizeOrderProducts(order),
    device: summarizeOrderProducts(order),
    productLines: order.productLines || [],
    seller: order.seller,
    warehouseName: order.warehouseName,
    total: creditPlan.total,
    initialPayment: creditPlan.initialPayment,
    balance: creditPlan.balance,
    monthly: creditPlan.monthly,
    lastPayment: creditPlan.lastPayment,
    months: creditPlan.months,
    paidMonths: 0,
    rate: 0,
    next: creditPlan.installments[0]?.due || "—",
    status: "Aktiv",
    installments: creditPlan.installments,
    payments,
  };
  const paidPrincipal = payments.reduce((sum, payment) => sum + Number(payment.principal || 0), 0);
  if (paidPrincipal <= 0) return baseCredit;

  const paymentResult = applyCreditPrincipalPayment(baseCredit, paidPrincipal);
  return {
    ...baseCredit,
    balance: paymentResult.nextBalance,
    installments: paymentResult.installments,
    paidMonths: paymentResult.nextPaidMonths,
    rate: Math.round((paymentResult.nextPaidMonths / Math.max(1, creditPlan.months)) * 100),
    next: paymentResult.nextDue,
    monthly: paymentResult.nextMonthly,
    status: paymentResult.status,
  };
}

function getShortSellerName(name) {
  return String(name || "")
    .trim()
    .split(" ")[0];
}

function getOrderBonusText(order) {
  const bonuses = getOrderSellerBonuses(order);
  if (bonuses.length === 0) return "Bonus yoxdur";
  return bonuses.map((item) => `${getShortSellerName(item.seller)} ${Number(item.bonus || 0)}%`).join(", ");
}

function matchesSalesOrderFilter(order, filter) {
  if (filter === "Kredit") return getOrderPaymentMethod(order) === "Kredit";
  if (filter === "Nağd") return getOrderPaymentMethod(order) === "Nağd";
  if (filter === "Qalıqlı") return getOrderBalance(order) > 0;
  if (filter === "Təhvil gözləyən") return order.status !== "Təhvil verilib";
  if (filter === "Tamamlanan") return order.status === "Təhvil verilib";
  return true;
}

function getDeliveryStageIndex(order) {
  return Math.max(0, stages.indexOf(order.status));
}

function getDeliveryAgeDays(order) {
  const orderDate = parsePaymentDate(order.date);
  const today = parsePaymentDate(baseDeliveryDate);
  if (!orderDate || !today) return 0;
  return Math.max(0, daysBetween(orderDate, today));
}

function getDeliveryRisk(order) {
  if (order.status === "Təhvil verilib") return "Tamamlandı";
  if (getDeliveryStageIndex(order) >= 2 && (!order.driver || order.driver === "—")) return "Sürücü yoxdur";
  if (order.status === "Təhvilə çıxıb" || order.status === "Hazırdır") return "Bu gün prioritet";
  if (getDeliveryAgeDays(order) >= 6) return "Gecikmə riski";
  return "Normal";
}

function getDeliveryActionLabel(order) {
  if (order.status === "Təhvil verilib") return "Tamamlanıb";
  if (order.status === "Təhvilə çıxıb") return "Təhvili tamamla";
  return "Növbəti mərhələ";
}

function enrichDeliveryOrder(order) {
  const stageIndex = getDeliveryStageIndex(order);
  return {
    ...order,
    stageIndex,
    progress: ((stageIndex + 1) / stages.length) * 100,
    ageDays: getDeliveryAgeDays(order),
    risk: getDeliveryRisk(order),
    balance: getOrderBalance(order),
    deliveryStatusText: getOrderDeliveryStatus(order),
  };
}

function matchesDeliveryFilter(order, filter) {
  if (filter === "Hamısı") return true;
  if (filter === "Aktiv") return order.status !== "Təhvil verilib";
  if (filter === "Gecikmə riski") return order.risk === "Gecikmə riski";
  if (filter === "Sürücü yoxdur") return order.risk === "Sürücü yoxdur";
  if (filter === "Tamamlanan") return order.status === "Təhvil verilib";
  return order.status === filter;
}

function buildDriverDeliveryStats(orders) {
  const driverMap = new Map();
  orders
    .filter((order) => order.driver && order.driver !== "—")
    .forEach((order) => {
      const current = driverMap.get(order.driver) || {
        driver: order.driver,
        active: 0,
        completed: 0,
        outForDelivery: 0,
        risk: 0,
      };
      if (order.status === "Təhvil verilib") {
        current.completed += 1;
      } else {
        current.active += 1;
      }
      if (order.status === "Təhvilə çıxıb" || order.status === "Yoldadır") {
        current.outForDelivery += 1;
      }
      if (order.risk !== "Normal" && order.risk !== "Tamamlandı") {
        current.risk += 1;
      }
      driverMap.set(order.driver, current);
    });
  const maxActive = Math.max(1, ...[...driverMap.values()].map((item) => item.active + item.outForDelivery));
  return [...driverMap.values()].map((item) => ({
    ...item,
    load: ((item.active + item.outForDelivery) / maxActive) * 100,
  }));
}

function sortByFinanceDate(rows) {
  return [...rows].sort((a, b) => {
    const dateA = parsePaymentDate(a.date)?.getTime() || 0;
    const dateB = parsePaymentDate(b.date)?.getTime() || 0;
    return dateB - dateA;
  });
}

function buildFinanceLedger({ orders, expenses, cashEntries }) {
  const salesRows = orders
    .filter((order) => Number(order.paid || 0) > 0)
    .map((order) => ({
      id: `SALE-${order.id}`,
      date: order.date,
      type: "Satış",
      category: getOrderPaymentMethod(order),
      title: order.id,
      description: summarizeOrderProducts(order),
      party: order.customer,
      principal: Number(order.paid || 0),
      penalty: 0,
      amount: Number(order.paid || 0),
      direction: "in",
      status: order.paymentStatus || getOrderPaymentMethod(order),
    }));

  const creditRows = cashEntries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    type: "Kredit",
    category: "Kredit ödənişi",
    title: entry.creditId,
    description: entry.contractId || "Müqavilə qeyd edilməyib",
    party: entry.customer,
    principal: Number(entry.principal || 0),
    penalty: Number(entry.penalty || 0),
    amount: Number(entry.amount || 0),
    direction: "in",
    status: "Kassaya daxil oldu",
  }));

  const expenseRows = expenses.map((expense) => {
    const approved = expense.status === "Təsdiq edildi";
    const rejected = expense.status === "İmtina edildi";
    const cashImpact = hasExpenseCashImpact(expense);
    return {
      id: expense.id,
      date: expense.date,
      type: "Xərc",
      category: expense.category,
      title: expense.description,
      description: expense.category,
      party: "Şirkət xərci",
      principal: 0,
      penalty: 0,
      amount: Number(expense.amount || 0),
      direction: !cashImpact ? "accrual" : approved ? "out" : rejected ? "ignored" : "pending",
      status: cashImpact ? expense.status : `${expense.status} · cash təsiri yoxdur`,
    };
  });

  return sortByFinanceDate([...salesRows, ...creditRows, ...expenseRows]);
}

function matchesFinanceFilter(row, filter) {
  if (filter === "Daxilolma") return row.direction === "in";
  if (filter === "Xərc") return row.type === "Xərc";
  if (filter === "Satış") return row.type === "Satış";
  if (filter === "Kredit") return row.type === "Kredit";
  if (filter === "Gecikmə gəliri") return Number(row.penalty || 0) > 0;
  if (filter === "Təsdiq gözləyir") return row.direction === "pending";
  if (filter === "Cash təsirsiz") return row.direction === "accrual";
  return true;
}

function buildExpenseCategoryRows(expenses) {
  const byCategory = expenses.reduce((map, expense) => {
    const current = map.get(expense.category) || {
      category: expense.category,
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };
    current.total += Number(expense.amount || 0);
    if (expense.status === "Təsdiq edildi") current.approved += Number(expense.amount || 0);
    if (expense.status === "Təsdiq gözləyir") current.pending += Number(expense.amount || 0);
    if (expense.status === "İmtina edildi") current.rejected += Number(expense.amount || 0);
    map.set(expense.category, current);
    return map;
  }, new Map());

  return [...byCategory.values()].sort((a, b) => b.total - a.total);
}

function filterRows(rows, query) {
  if (!query.trim()) return rows;
  const q = normalize(query);
  return rows.filter((row) => normalize(Object.values(row).join(" ")).includes(q));
}

function buildQuantityMap(items) {
  return items.reduce((map, item) => {
    if (!item.product) return map;
    map.set(item.product, (map.get(item.product) || 0) + Number(item.qty || 0));
    return map;
  }, new Map());
}

function isSerialTrackedProduct(item = {}) {
  if (typeof item.serialTracked === "boolean") return item.serialTracked;
  return Number(item.price || 0) >= 1500;
}

function buildSerialPrefix(product = "", warehouseId = "") {
  const productCode = normalize(product).replace(/[^a-z0-9]/g, "").slice(0, 4).toLocaleUpperCase("az-AZ") || "SKU";
  const warehouseCode = String(warehouseId || "WH").replace(/[^A-Z0-9]/gi, "").slice(-3).toLocaleUpperCase("az-AZ");
  return `${productCode}${warehouseCode}`;
}

function ensureStockItemSerials(item, warehouseId = "WH") {
  if (!isSerialTrackedProduct(item)) return { ...item, serials: item.serials || [] };

  const totalCount = Math.max(0, Math.round(Number(item.total || 0)));
  const reservedCount = Math.max(0, Math.round(Number(item.reserved || 0)));
  const existingSerials = Array.isArray(item.serials) ? item.serials : [];
  const nonSoldSerials = existingSerials.filter((serial) => serial.status !== "Satılıb");
  const serials = [...existingSerials];
  const prefix = buildSerialPrefix(item.product, warehouseId);

  for (let index = nonSoldSerials.length; index < totalCount; index += 1) {
    serials.push({
      imei: `${prefix}-${String(index + 1).padStart(5, "0")}`,
      status: index < reservedCount ? "Rezervdə" : "Anbarda",
      warehouseId,
      product: item.product,
    });
  }

  let reservedSeen = 0;
  const normalizedSerials = serials.map((serial) => {
    if (serial.status === "Satılıb") return serial;
    reservedSeen += 1;
    return {
      ...serial,
      status: reservedSeen <= reservedCount ? "Rezervdə" : "Anbarda",
      warehouseId: serial.warehouseId || warehouseId,
      product: serial.product || item.product,
    };
  });

  return {
    ...item,
    serials: normalizedSerials,
  };
}

function ensureWarehouseSerials(warehouseStock = {}) {
  return Object.fromEntries(
    Object.entries(warehouseStock).map(([warehouseId, rows]) => [
      warehouseId,
      (rows || []).map((item) => ensureStockItemSerials(item, warehouseId)),
    ]),
  );
}

function getAvailableSerialsForProduct(warehouseStock = {}, warehouseId, product) {
  const item = (warehouseStock?.[warehouseId] || []).find((row) => row.product === product);
  if (!item || !isSerialTrackedProduct(item)) return [];
  return (item.serials || []).filter((serial) => serial.status === "Anbarda").map((serial) => serial.imei);
}

function getSerialSummary(serials = []) {
  return {
    available: serials.filter((serial) => serial.status === "Anbarda").length,
    reserved: serials.filter((serial) => serial.status === "Rezervdə").length,
    sold: serials.filter((serial) => serial.status === "Satılıb").length,
  };
}

function updateSerialStatuses(rows, productLines, nextStatus, orderId) {
  return rows.map((item) => {
    const matchingLines = productLines.filter((line) => line.product === item.product);
    if (matchingLines.length === 0 || !Array.isArray(item.serials) || item.serials.length === 0) return item;

    const requestedSerials = new Set(matchingLines.flatMap((line) => line.serials || []).filter(Boolean));
    const neededFallback = matchingLines.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    let fallbackCount = 0;

    return {
      ...item,
      serials: item.serials.map((serial) => {
        const explicit = requestedSerials.has(serial.imei);
        const fallback =
          requestedSerials.size === 0 &&
          serial.status !== "Satılıb" &&
          fallbackCount < neededFallback &&
          (nextStatus === "Satılıb" ? serial.status === "Rezervdə" : serial.status === "Anbarda");

        if (!explicit && !fallback) return serial;
        fallbackCount += fallback ? 1 : 0;
        return {
          ...serial,
          status: nextStatus,
          orderId,
          reservedAt: nextStatus === "Rezervdə" ? currentBusinessDate : serial.reservedAt,
          soldAt: nextStatus === "Satılıb" ? currentBusinessDate : serial.soldAt,
        };
      }),
    };
  });
}

function releaseOrderSerialReservations(rows, productLines, orderId) {
  return rows.map((item) => {
    const matchingLines = productLines.filter((line) => line.product === item.product);
    if (matchingLines.length === 0 || !Array.isArray(item.serials) || item.serials.length === 0) return item;

    const requestedSerials = new Set(matchingLines.flatMap((line) => line.serials || []).filter(Boolean));
    const fallbackLimit = matchingLines.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    let releasedCount = 0;

    return {
      ...item,
      serials: item.serials.map((serial) => {
        const explicit = requestedSerials.has(serial.imei);
        const sameOrder = serial.orderId === orderId;
        const fallback = requestedSerials.size === 0 && sameOrder && releasedCount < fallbackLimit;
        if (serial.status !== "Rezervdə" || (!explicit && !fallback)) return serial;
        releasedCount += 1;
        return {
          ...serial,
          status: "Anbarda",
          orderId: "",
          reservedAt: "",
        };
      }),
    };
  });
}

function adjustStockRows(rows, quantities, { totalDelta = 0, reservedDelta = 0 }) {
  return rows.map((item) => {
    const qty = quantities.get(item.product) || 0;
    if (!qty) return item;
    return {
      ...item,
      total: Math.max(0, item.total + totalDelta * qty),
      reserved: Math.max(0, item.reserved + reservedDelta * qty),
    };
  });
}

function total(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
}

function getDefaultUsers() {
  return initialState.settings?.users || [];
}

function mergeUsers(savedUsers = []) {
  const savedById = new Map(savedUsers.map((user) => [user.id, user]));
  const defaults = getDefaultUsers().map((user) => ({
    ...user,
    ...(savedById.get(user.id) || {}),
  }));
  const defaultIds = new Set(defaults.map((user) => user.id));
  const customUsers = savedUsers.filter((user) => user.id && !defaultIds.has(user.id));
  return [...defaults, ...customUsers];
}

function mergeRoles(savedRoles = []) {
  const savedByName = new Map(savedRoles.map((role) => [role.name, role]));

  return defaultRoles.map((defaultRole) => {
    const saved = savedByName.get(defaultRole.name);
    if (!saved) return defaultRole;

    return {
      ...defaultRole,
      ...saved,
      permissions:
        defaultRole.name === "Super Admin"
          ? permissionCatalog.map((item) => item.key)
          : [...new Set([...(defaultRole.permissions || []), ...(saved.permissions || [])])],
    };
  });
}

function uniqueModuleIds(moduleIds = []) {
  const validIds = new Set(navItems.map((item) => item.id));
  return [...new Set(moduleIds)].filter((id) => validIds.has(id));
}

function getDefaultModuleAccessForRole(roleName, roles = defaultRoles) {
  const role = roles.find((item) => item.name === roleName) || roles[0] || defaultRoles[0];
  if (role?.name === "Super Admin") return navItems.map((item) => item.id);

  const permissions = new Set(role?.permissions || []);
  return uniqueModuleIds(
    navItems
      .filter((item) => {
        const permission = navPermissionByType[item.id];
        return !permission || permissions.has(permission);
      })
      .map((item) => item.id),
  );
}

function normalizeUserModuleAccess(user, roles) {
  const moduleAccess = Array.isArray(user.moduleAccess)
    ? uniqueModuleIds(user.moduleAccess)
    : getDefaultModuleAccessForRole(user.role, roles);

  return moduleAccess.length > 0 ? moduleAccess : ["dashboard"];
}

function ensureSettings(settings = {}) {
  const baseSettings = initialState.settings || {};
  const roles = mergeRoles(Array.isArray(settings.roles) ? settings.roles : []);
  const users = mergeUsers(Array.isArray(settings.users) ? settings.users : baseSettings.users || []).map((user) => ({
    ...user,
    moduleAccess: normalizeUserModuleAccess(user, roles),
  }));
  const fallbackUser = users.find((user) => user.status === "Aktiv") || users[0] || null;
  const sessionUserId =
    settings.sessionUserId === null
      ? null
      : users.some((user) => user.id === settings.sessionUserId && user.status === "Aktiv")
        ? settings.sessionUserId
        : fallbackUser?.id || null;
  const sessionUser = users.find((user) => user.id === sessionUserId) || null;
  const currentRole =
    sessionUser?.role && roles.some((role) => role.name === sessionUser.role)
      ? sessionUser.role
      : settings.currentRole && roles.some((role) => role.name === settings.currentRole)
        ? settings.currentRole
        : roles[0]?.name || defaultRoles[0].name;

  return {
    ...baseSettings,
    ...settings,
    toggles: {
      ...(baseSettings.toggles || {}),
      ...(settings.toggles || {}),
    },
    roles,
    users,
    sessionUserId,
    currentRole,
  };
}

function normalizeOperationalLabels(snapshot = {}) {
  return {
    ...snapshot,
    onboarding: {
      ...(snapshot.onboarding || {}),
      companyStage: normalize(snapshot.onboarding?.companyStage).includes("demo")
        ? "Go-live hazırlığı"
        : snapshot.onboarding?.companyStage,
    },
    invoiceSettings: {
      ...(snapshot.invoiceSettings || {}),
      eTaxMode: normalize(snapshot.invoiceSettings?.eTaxMode).includes("demo")
        ? "E-qaimə inteqrasiya rejimi"
        : snapshot.invoiceSettings?.eTaxMode,
    },
    productionPlans: (snapshot.productionPlans || []).map((plan) => ({
      ...plan,
      product: normalize(plan.product).includes("showroom demo") ? "Showroom nümayiş dəsti" : plan.product,
    })),
  };
}

function hydrateState(snapshot = {}) {
  const warehouseStock = ensureWarehouseSerials(
    snapshot.warehouseStock || initialState.warehouseStock || {},
  );
  const merged = normalizeOperationalLabels({
    ...initialState,
    ...snapshot,
    warehouseStock,
    settings: ensureSettings({
      ...(initialState.settings || {}),
      ...(snapshot.settings || {}),
    }),
    auditLog: Array.isArray(snapshot.auditLog) ? snapshot.auditLog : [],
    purchaseOrders: Array.isArray(snapshot.purchaseOrders) ? snapshot.purchaseOrders : [],
    reportExports: Array.isArray(snapshot.reportExports) ? snapshot.reportExports : [],
    accountingClose: snapshot.accountingClose || null,
    receivableSync: snapshot.receivableSync || null,
    notificationSweepAt: snapshot.notificationSweepAt || null,
    integritySnapshot: snapshot.integritySnapshot || null,
    goLiveSnapshot: snapshot.goLiveSnapshot || null,
    dbMeta: {
      ...(snapshot.dbMeta || {}),
      provider: snapshot.dbMeta?.provider && snapshot.dbMeta.provider !== "Local persistent DB" ? snapshot.dbMeta.provider : defaultDbProvider,
      runtime: snapshot.dbMeta?.runtime || "browser",
      version: localDbSchemaVersion,
      schemaVersion: localDbSchemaVersion,
      baselineVersion: localDbBaselineVersion,
      lastWriteAt: snapshot.dbMeta?.lastWriteAt || baseFinanceDate,
    },
  });

  return merged;
}

function loadPersistentState() {
  if (typeof window === "undefined") return hydrateState(initialState);

  try {
    const raw = window.localStorage.getItem(localDbKey);
    if (!raw) return hydrateState(initialState);
    const snapshot = JSON.parse(raw);
    if (Number(snapshot?.dbMeta?.baselineVersion || 0) < localDbBaselineVersion) {
      return hydrateState(initialState);
    }
    return hydrateState(snapshot);
  } catch {
    return hydrateState(initialState);
  }
}

function getCurrentUser(settings = {}) {
  const safeSettings = ensureSettings(settings);
  return safeSettings.users.find((user) => user.id === safeSettings.sessionUserId) || null;
}

function getActiveRole(settings = {}) {
  const safeSettings = ensureSettings(settings);
  return safeSettings.roles.find((role) => role.name === safeSettings.currentRole) || safeSettings.roles[0];
}

function hasRolePermission(settings, permission) {
  if (!permission) return true;
  if (!getCurrentUser(settings)) return false;
  const role = getActiveRole(settings);
  return Array.isArray(role?.permissions) && role.permissions.includes(permission);
}

function hasUserModuleAccess(settings, moduleId) {
  if (!moduleId) return true;
  const user = getCurrentUser(settings);
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  return normalizeUserModuleAccess(user, ensureSettings(settings).roles).includes(moduleId);
}

function buildAuditEntry({ module, action, detail, status = "Tamamlandı", role = "System" }) {
  return {
    id: `AUD-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    date: new Date().toISOString(),
    module,
    action,
    detail,
    status,
    role,
  };
}

function appendAudit(state, audit) {
  const entry = buildAuditEntry(audit);

  return {
    ...state,
    auditLog: [entry, ...(state.auditLog || [])].slice(0, 240),
    dbMeta: {
      ...(state.dbMeta || {}),
      provider:
        state.dbMeta?.provider && state.dbMeta.provider !== "Local persistent DB"
          ? state.dbMeta.provider
          : defaultDbProvider,
      runtime: state.dbMeta?.runtime || "browser",
      version: localDbSchemaVersion,
      schemaVersion: localDbSchemaVersion,
      baselineVersion: localDbBaselineVersion,
      lastWriteAt: entry.date,
      lastAction: `${entry.module}: ${entry.action}`,
      lastAuditId: entry.id,
    },
  };
}

function getDuplicateValues(rows = [], key, label) {
  const seen = new Set();
  const duplicates = new Set();

  rows.forEach((row) => {
    const value = row?.[key];
    if (!value) return;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });

  return [...duplicates].map((value) => ({
    id: `${label}-${value}`,
    severity: "Kritik",
    area: label,
    title: "Dublikat identifikator",
    detail: `${value} təkrar istifadə olunub`,
    fix: "ID/FIN unikal saxlanmalıdır",
  }));
}

function buildStateIntegrityReport(snapshot = {}, creditRows = []) {
  const issues = [];
  const orders = snapshot.orders || [];
  const customers = snapshot.customers || [];
  const warehouses = snapshot.warehouses || [];
  const purchaseOrders = snapshot.purchaseOrders || [];
  const contracts = snapshot.contracts || [];
  const stock = snapshot.stock || [];
  const warehouseStock = snapshot.warehouseStock || {};
  const credits = creditRows.length > 0 ? creditRows : snapshot.credits || [];
  const employees = snapshot.employees || [];
  const departments = snapshot.departments || [];
  const leaveRequests = snapshot.leaveRequests || [];
  const vacancies = snapshot.vacancies || [];
  const users = snapshot.settings?.users || [];
  const currentUser = getCurrentUser(snapshot.settings || {});

  issues.push(...getDuplicateValues(orders, "id", "Satış"));
  issues.push(...getDuplicateValues(customers, "fin", "CRM"));
  issues.push(...getDuplicateValues(warehouses, "id", "Anbar"));
  issues.push(...getDuplicateValues(purchaseOrders, "id", "PO"));
  issues.push(...getDuplicateValues(contracts, "id", "Müqavilə"));
  issues.push(...getDuplicateValues(credits, "id", "Kredit"));
  issues.push(...getDuplicateValues(departments, "name", "HR şöbə"));
  issues.push(...getDuplicateValues(leaveRequests, "id", "HR məzuniyyət"));
  issues.push(...getDuplicateValues(vacancies, "id", "HR vakansiya"));

  if (!currentUser) {
    issues.push({
      id: "AUTH-NO-SESSION",
      severity: "Kritik",
      area: "Auth",
      title: "Aktiv sessiya yoxdur",
      detail: "Permission yoxlaması üçün aktiv istifadəçi seçilməlidir",
      fix: "Ayarlar bölməsində aktiv istifadəçi ilə giriş edin",
    });
  }

  if (users.filter((user) => user.status === "Aktiv").length === 0) {
    issues.push({
      id: "AUTH-NO-ACTIVE-USER",
      severity: "Kritik",
      area: "Auth",
      title: "Aktiv istifadəçi yoxdur",
      detail: "Sistemə giriş üçün ən azı bir aktiv istifadəçi lazımdır",
      fix: "Super Admin istifadəçisini aktiv saxlayın",
    });
  }

  const stockGroups = [
    { label: "Ümumi stok", rows: stock },
    ...Object.entries(warehouseStock).map(([warehouseId, rows]) => ({
      label: `Anbar ${warehouseId}`,
      rows: rows || [],
    })),
  ];

  stockGroups.forEach((group) => {
    group.rows.forEach((item) => {
      const totalQty = Number(item.total || 0);
      const reservedQty = Number(item.reserved || 0);
      if (totalQty < 0 || reservedQty < 0) {
        issues.push({
          id: `STOCK-NEG-${group.label}-${item.product}`,
          severity: "Kritik",
          area: "Anbar",
          title: "Mənfi stok göstəricisi",
          detail: `${group.label}: ${item.product}`,
          fix: "Mədaxil/məxaric tarixçəsini yoxlayın",
        });
      }
      if (reservedQty > totalQty) {
        issues.push({
          id: `STOCK-RES-${group.label}-${item.product}`,
          severity: "Kritik",
          area: "Anbar",
          title: "Rezerv stokdan çoxdur",
          detail: `${group.label}: ${item.product} reserved ${reservedQty}, total ${totalQty}`,
          fix: "Rezerv və təhvil əməliyyatlarını sinxronlaşdırın",
        });
      }
      if (Array.isArray(item.serials) && item.serials.length > 0) {
        const activeSerials = item.serials.filter((serial) => serial.status !== "Satılıb").length;
        if (activeSerials < totalQty) {
          issues.push({
            id: `SERIAL-MISS-${group.label}-${item.product}`,
            severity: "Xəbərdarlıq",
            area: "IMEI",
            title: "Serial sayı stokdan azdır",
            detail: `${group.label}: ${item.product} üçün aktiv serial ${activeSerials}, stok ${totalQty}`,
            fix: "IMEI/serial reyestrini tamamlayın",
          });
        }
      }
    });
  });

  const creditIds = new Set(credits.map((credit) => credit.orderId || credit.id));
  orders.forEach((order) => {
    const amount = Number(order.amount || 0);
    const paid = Number(order.paid || 0);
    if (paid > amount) {
      issues.push({
        id: `ORDER-OVERPAID-${order.id}`,
        severity: "Xəbərdarlıq",
        area: "Satış",
        title: "Ödəniş sifariş məbləğini keçir",
        detail: `${order.id}: ödənilib ${money(paid)}, məbləğ ${money(amount)}`,
        fix: "Artıq ödənişi kredit və ya avans kimi ayırın",
      });
    }
    if (order.paymentMethod === "Kredit" && !creditIds.has(order.id) && !creditIds.has(order.creditId)) {
      issues.push({
        id: `ORDER-CREDIT-MISS-${order.id}`,
        severity: "Kritik",
        area: "Satış/Kredit",
        title: "Kredit satışı kredit portfelində yoxdur",
        detail: `${order.id}: ${order.customer}`,
        fix: "Satışdan kredit datasını yenidən sinxronlaşdırın",
      });
    }
  });

  credits.forEach((credit) => {
    const plan = getCreditDisplayPlan(credit);
    if (Number(plan.balance || 0) < 0 || Number(plan.balance || 0) > Number(plan.total || 0)) {
      issues.push({
        id: `CREDIT-BAL-${credit.id}`,
        severity: "Kritik",
        area: "Kredit",
        title: "Kredit balansı uyğunsuzdur",
        detail: `${credit.id}: balans ${money(plan.balance)} / total ${money(plan.total)}`,
        fix: "Ödəniş tarixçəsini və əsas məbləğ silinməsini yoxlayın",
      });
    }
    if (!normalize(credit.status).includes("tamam") && !getCreditPaymentState(credit, plan).nextInstallment) {
      issues.push({
        id: `CREDIT-NEXT-${credit.id}`,
        severity: "Xəbərdarlıq",
        area: "Kredit",
        title: "Növbəti ödəniş tarixi yoxdur",
        detail: `${credit.id}: ${credit.customer}`,
        fix: "Ödəniş cədvəlini yeniləyin",
      });
    }
  });

  const employeeKeys = new Set(employees.map((employee) => getEmployeeKey(employee)));
  const employeeNames = new Set(employees.map((employee) => employee.name));
  employees.forEach((employee) => {
    const employeeKey = getEmployeeKey(employee);
    if (employee.managerId === employeeKey || employee.managerName === employee.name) {
      issues.push({
        id: `HR-SELF-MANAGER-${employeeKey}`,
        severity: "Kritik",
        area: "HR",
        title: "Əməkdaş özü-özünə tabedir",
        detail: `${employee.name} üçün rəhbər əlaqəsi özünə işarə edir`,
        fix: "Əməkdaş kartında birbaşa rəhbərlik və ya düzgün rəhbər seçin",
      });
    } else if (employee.managerId && !employeeKeys.has(employee.managerId)) {
      issues.push({
        id: `HR-MANAGER-MISSING-${employeeKey}`,
        severity: "Xəbərdarlıq",
        area: "HR",
        title: "Rəhbər qeydi tapılmadı",
        detail: `${employee.name}: ${employee.managerId}`,
        fix: "Əməkdaş kartında tabeçilik əlaqəsini yeniləyin",
      });
    } else if (!employee.managerId && employee.managerName && !employeeNames.has(employee.managerName)) {
      issues.push({
        id: `HR-MANAGER-NAME-MISSING-${employeeKey}`,
        severity: "Xəbərdarlıq",
        area: "HR",
        title: "Rəhbər adı reyestrdə yoxdur",
        detail: `${employee.name}: ${employee.managerName}`,
        fix: "Rəhbəri siyahıdan yenidən seçin",
      });
    }
  });

  const departmentNames = new Set([
    ...departments.map((department) => department.name),
    ...employees.map((employee) => employee.department),
  ].filter(Boolean));
  departments.forEach((department) => {
    if (department.parentDepartment === department.name) {
      issues.push({
        id: `HR-DEPARTMENT-SELF-${department.name}`,
        severity: "Kritik",
        area: "HR",
        title: "Şöbə özü-özünün üst şöbəsidir",
        detail: department.name,
        fix: "Şöbə kartındakı üst şöbə dəyərini dəyişin",
      });
    } else if (department.parentDepartment && !departmentNames.has(department.parentDepartment)) {
      issues.push({
        id: `HR-DEPARTMENT-PARENT-MISSING-${department.name}`,
        severity: "Xəbərdarlıq",
        area: "HR",
        title: "Üst şöbə tapılmadı",
        detail: `${department.name}: ${department.parentDepartment}`,
        fix: "Şöbə strukturunu yeniləyin və ya üst şöbəni yaradın",
      });
    }
  });

  leaveRequests.forEach((request) => {
    const start = new Date(request.from || "");
    const end = new Date(request.to || "");
    const employeeFound = request.employeeId ? employeeKeys.has(request.employeeId) : employeeNames.has(request.employeeName);
    if (!employeeFound) {
      issues.push({
        id: `HR-LEAVE-EMPLOYEE-MISSING-${request.id}`,
        severity: "Xəbərdarlıq",
        area: "HR",
        title: "Məzuniyyət əməkdaşı tapılmadı",
        detail: request.employeeName || request.employeeId || request.id,
        fix: "Məzuniyyət qeydini aktiv əməkdaşla bağlayın",
      });
    }
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start || Number(request.days || 0) <= 0) {
      issues.push({
        id: `HR-LEAVE-DATE-${request.id}`,
        severity: "Xəbərdarlıq",
        area: "HR",
        title: "Məzuniyyət tarixi uyğunsuzdur",
        detail: `${request.employeeName || request.id}: ${request.from || "—"} - ${request.to || "—"}`,
        fix: "Başlanğıc, bitiş və gün sayını yeniləyin",
      });
    }
  });

  const critical = issues.filter((issue) => issue.severity === "Kritik").length;
  const warnings = issues.filter((issue) => issue.severity !== "Kritik").length;
  const score = Math.max(0, Math.round(100 - critical * 18 - warnings * 6));

  return {
    checkedAt: new Date().toISOString(),
    score,
    status: critical > 0 ? "Risk" : warnings > 0 ? "Nəzarət" : "Sağlam",
    critical,
    warnings,
    issueCount: issues.length,
    issues,
  };
}

function buildGoLiveReadiness(snapshot = {}, integrityReport = {}) {
  const settings = ensureSettings(snapshot.settings || {});
  const dbMeta = snapshot.dbMeta || {};
  const auditLog = snapshot.auditLog || [];
  const roles = settings.roles || [];
  const users = settings.users || [];
  const hasActiveAdmin = users.some((user) => user.status === "Aktiv" && user.role === "Super Admin");
  const hasBackupPermission = roles.some(
    (role) => role.name === "Super Admin" && (role.permissions || []).includes("system.backup"),
  );
  const hasBackupTrace = Boolean(dbMeta.lastBackupAt || dbMeta.lastRestoreAt);
  const hasCriticalBusinessData =
    (snapshot.orders || []).length > 0 &&
    (snapshot.warehouses || []).length > 0 &&
    (snapshot.employees || []).length > 0 &&
    (snapshot.customers || []).length > 0;
  const isServerRuntime = dbMeta.runtime === "server";
  const isExternalDb = isServerRuntime && !normalize(dbMeta.provider || "").includes("local persistent");
  const integrityClear = Number(integrityReport.critical || 0) === 0;

  const items = [
    {
      area: "Backend DB",
      requirement: "PostgreSQL/Supabase kimi real server DB",
      status: isExternalDb ? "Hazır" : "Bloker",
      risk: "Yüksək",
      next: isExternalDb
        ? "Connection monitor aktiv saxlanılsın"
        : `Brauzer local adapteri ${targetDbProvider} backend adapteri ilə əvəz edilməlidir`,
    },
    {
      area: "Auth/RBAC",
      requirement: "Aktiv admin, rol və kritik permission xəritəsi",
      status: hasActiveAdmin && hasBackupPermission ? "Hazır" : "Bloker",
      risk: hasActiveAdmin ? "Orta" : "Yüksək",
      next: hasActiveAdmin ? "Server-side token yoxlaması əlavə olunmalıdır" : "Super Admin istifadəçisi aktiv edilməlidir",
    },
    {
      area: "Data integrity",
      requirement: "Stok, kredit, satış və audit bütövlüyü",
      status: integrityClear ? "Hazır" : "Bloker",
      risk: integrityClear ? "Aşağı" : "Yüksək",
      next: integrityClear ? "Planlı günlük yoxlama saxlanılsın" : "Integrity panelində kritik siqnallar bağlanmalıdır",
    },
    {
      area: "Backup/Restore",
      requirement: "Export/import və bərpa izi",
      status: hasBackupTrace ? "Hazır" : "Nəzarət",
      risk: hasBackupTrace ? "Aşağı" : "Orta",
      next: hasBackupTrace ? "Avtomatik backup qrafiki qurulsun" : "İlk backup export/import yoxlaması aparılsın",
    },
    {
      area: "Audit",
      requirement: "Əməliyyatların audit log-a düşməsi",
      status: auditLog.length >= 5 ? "Hazır" : "Nəzarət",
      risk: auditLog.length >= 5 ? "Aşağı" : "Orta",
      next: auditLog.length >= 5 ? "Audit log serverdə immutable saxlanmalıdır" : "Kritik əməliyyatlar üzrə audit nümunələri yaradılmalıdır",
    },
    {
      area: "Biznes axınları",
      requirement: "Satış, kredit, anbar, təhvil, maliyyə, HR data zənciri",
      status: hasCriticalBusinessData ? "Hazır" : "Bloker",
      risk: hasCriticalBusinessData ? "Aşağı" : "Yüksək",
      next: hasCriticalBusinessData ? "UAT ssenariləri imzalanmalıdır" : "Əsas modullara başlanğıc data əlavə olunmalıdır",
    },
    {
      area: "Monitoring",
      requirement: "Error, uptime, webhook və backup monitorinqi",
      status: "Nəzarət",
      risk: "Orta",
      next: "Production hostda error logging və uptime monitor qurulmalıdır",
    },
    {
      area: "Deployment",
      requirement: "Docker/nginx/env/smoke test faylları",
      status: deploymentToolkitReady ? "Hazır" : "Hazırlanır",
      risk: deploymentToolkitReady ? "Aşağı" : "Orta",
      next: deploymentToolkitReady
        ? "Staging serverdə npm run smoke nəticəsi saxlanılsın"
        : "Build artefaktı staging-də smoke testdən keçirilməlidir",
    },
  ];
  const blockers = items.filter((item) => item.status === "Bloker").length;
  const watch = items.filter((item) => item.status === "Nəzarət" || item.status === "Hazırlanır").length;
  const ready = items.filter((item) => item.status === "Hazır").length;
  const score = Math.max(0, Math.round((ready / items.length) * 100 - blockers * 8));

  return {
    checkedAt: new Date().toISOString(),
    status: blockers > 0 ? "Bloker var" : watch > 0 ? "Staging hazırdır" : "Go-live hazır",
    score,
    blockers,
    watch,
    ready,
    items,
  };
}

function addStockToRows(rows, product, qty, price, warehouseId = "", productMeta = {}) {
  const amount = Math.max(0, Math.round(Number(qty || 0)));
  if (!product || amount <= 0) return rows;

  const exists = rows.some((item) => item.product === product);
  if (exists) {
    return rows.map((item) => {
      if (item.product !== product) return item;

      const nextItem = {
        ...item,
        total: Number(item.total || 0) + amount,
        price: Number(price || item.price || 0),
        ...(typeof productMeta.serialTracked === "boolean" ? { serialTracked: productMeta.serialTracked } : {}),
        ...(Number.isFinite(Number(productMeta.reorderLevel)) ? { reorderLevel: Number(productMeta.reorderLevel) } : {}),
      };
      return {
        ...nextItem,
        serials: ensureStockItemSerials(nextItem, warehouseId).serials,
      };
    });
  }

  return [
    ...rows,
    ensureStockItemSerials(
      {
        product,
        total: amount,
        reserved: 0,
        price: Number(price || 0),
        ...(typeof productMeta.serialTracked === "boolean" ? { serialTracked: productMeta.serialTracked } : {}),
        ...(Number.isFinite(Number(productMeta.reorderLevel)) ? { reorderLevel: Number(productMeta.reorderLevel) } : {}),
      },
      warehouseId,
    ),
  ];
}

function buildPayrollExpense(employees) {
  const payrollRows = buildHrEmployeeRecords(employees);
  const netTotal = payrollRows.reduce((sum, employee) => sum + Number(employee.netSalary || 0), 0);
  const grossTotal = payrollRows.reduce((sum, employee) => sum + Number(employee.salary || 0) + Number(employee.bonus || 0), 0);
  const deductions = payrollRows.reduce((sum, employee) => sum + Number(employee.tax || 0) + Number(employee.social || 0), 0);
  const employerCost = payrollRows.reduce((sum, employee) => sum + Number(employee.employerCost || 0), 0);

  return {
    id: `PAY-${baseFinanceDate.slice(0, 7)}`,
    description: `HR payroll - ${baseFinanceDate.slice(0, 7)}`,
    category: "Payroll",
    date: baseFinanceDate,
    amount: employerCost || netTotal,
    status: "Təsdiq gözləyir",
    source: "HR Payroll",
    cashImpact: false,
    cashImpactNote: "HR payroll uçot/accrual xərcidir, real kassadan avtomatik çıxılmır.",
    grossTotal,
    deductions,
    netTotal,
    employerCost,
    payrollRows,
  };
}

const createPermissionByType = {
  dashboard: "sales.create",
  crm: "crm.manage",
  sales: "sales.create",
  warehouse: "warehouse.manage",
  product: "warehouse.manage",
  financeAccount: "finance.manage",
  finance: "finance.manage",
  invoices: "invoices.manage",
  accounting: "accounting.manage",
  tax: "tax.manage",
  credits: "credits.manage",
  receivables: "receivables.manage",
  vendors: "vendors.manage",
  projects: "projects.manage",
  production: "production.manage",
  hr: "hr.manage",
  kpi: "kpi.manage",
  contracts: "contracts.manage",
  support: "support.manage",
  onboarding: "onboarding.manage",
  api: "api.manage",
  settings: "settings.manage",
};

const navPermissionByType = {
  ...createPermissionByType,
  dashboard: null,
  deliveries: "delivery.complete",
  reports: null,
  messages: null,
  notifications: null,
  help: null,
};

const modulePermissionCatalog = navItems.map((item) => ({
  ...item,
  permission: navPermissionByType[item.id] || null,
}));

const permissionModuleOverrides = {
  "system.backup": "settings",
  "settings.manage": "settings",
  "vendors.po": "vendors",
};

function getModuleForPermission(permission) {
  if (!permission) return null;
  if (permissionModuleOverrides[permission]) return permissionModuleOverrides[permission];
  return modulePermissionCatalog.find((item) => item.permission === permission)?.id || null;
}

function hasEffectivePermission(settings, permission) {
  if (!hasRolePermission(settings, permission)) return false;
  return hasUserModuleAccess(settings, getModuleForPermission(permission));
}

function canAccessNavItem(settings, id) {
  const permission = navPermissionByType[id];
  return hasUserModuleAccess(settings, id) && (!permission || hasRolePermission(settings, permission));
}

function App() {
  const [state, setState] = useState(() => loadPersistentState());
  const [active, setActive] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("all");
  const [notificationFilter, setNotificationFilter] = useState("Cəmi");
  const [conversationId, setConversationId] = useState("c1");
  const [draftMessage, setDraftMessage] = useState("");
  const [remoteAuthStatus, setRemoteAuthStatus] = useState(remoteApiEnabled ? "checking" : "local");
  const [authError, setAuthError] = useState("");
  const remoteSaveTimer = useRef(null);
  const creditRecords = useMemo(
    () => buildAllCreditRecords(state.orders, state.credits),
    [state.orders, state.credits],
  );
  const salesBonusRows = useMemo(() => buildSalesBonusRows(state.orders), [state.orders]);
  const currentUser = useMemo(() => getCurrentUser(state.settings), [state.settings]);
  const activeRoleInfo = useMemo(() => getActiveRole(state.settings), [state.settings]);
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => canAccessNavItem(state.settings, item.id)),
    [state.settings],
  );
  const receivableRows = useMemo(
    () =>
      buildReceivableRows({
        customers: state.customers,
        orders: state.orders,
        credits: creditRecords,
        vendors: state.vendors,
        purchaseOrders: state.purchaseOrders || [],
      }),
    [state.customers, state.orders, creditRecords, state.vendors, state.purchaseOrders],
  );
  const projectRoiRows = useMemo(
    () => buildProjectRoiRows({ projects: state.projects || [], orders: state.orders, expenses: state.expenses }),
    [state.projects, state.orders, state.expenses],
  );
  const notificationAutomationRows = useMemo(
    () =>
      buildNotificationAutomationRows({
        notificationRules: state.notificationRules || [],
        credits: creditRecords,
        stock: state.stock,
        products: state.products || [],
        purchaseOrders: state.purchaseOrders || [],
        expenses: state.expenses,
        orders: state.orders,
      }),
    [state.notificationRules, creditRecords, state.stock, state.products, state.purchaseOrders, state.expenses, state.orders],
  );
  const productionRows = useMemo(
    () => buildProductionPlanRows(state.productionPlans || [], state.stock),
    [state.productionPlans, state.stock],
  );
  const onboardingRows = useMemo(() => buildOnboardingRows(state.onboarding, state), [state.onboarding, state]);
  const invoiceRows = useMemo(
    () =>
      buildInvoiceRows({
        orders: state.orders,
        settings: state.settings,
        invoiceSettings: state.invoiceSettings,
      }),
    [state.orders, state.settings, state.invoiceSettings],
  );
  const payrollTaxRows = useMemo(
    () => buildPayrollTaxCalculatorRows(buildHrEmployeeRecords(state.employees)),
    [state.employees],
  );
  const financeOpeningBalance = useMemo(
    () => total(state.financeAccounts || [], "openingBalance"),
    [state.financeAccounts],
  );
  const accountingData = useMemo(
    () =>
      buildAccountingData({
        orders: state.orders,
        expenses: state.expenses,
        cashEntries: state.cashEntries || [],
        credits: creditRecords,
        stock: state.stock,
        invoices: invoiceRows,
        openingBalance: financeOpeningBalance,
      }),
    [state.orders, state.expenses, state.cashEntries, creditRecords, state.stock, invoiceRows, financeOpeningBalance],
  );
  const taxCalendarRows = useMemo(
    () =>
      buildTaxCalendarRows({
        taxCalendar: state.taxCalendar || [],
        invoices: invoiceRows,
        payrollTaxRows,
        accounting: accountingData,
      }),
    [state.taxCalendar, invoiceRows, payrollTaxRows, accountingData],
  );
  const currencyExposureRows = useMemo(
    () =>
      buildCurrencyExposureRows({
        currencyRates: state.currencyRates || [],
        orders: state.orders,
        credits: creditRecords,
        cashEntries: state.cashEntries || [],
      }),
    [state.currencyRates, state.orders, creditRecords, state.cashEntries],
  );
  const apiWebhookRows = useMemo(
    () =>
      buildApiWebhookRows({
        apiWebhooks: state.apiWebhooks || [],
        invoices: invoiceRows,
        credits: creditRecords,
        stock: state.stock,
        products: state.products || [],
        purchaseOrders: state.purchaseOrders || [],
        expenses: state.expenses,
      }),
    [state.apiWebhooks, invoiceRows, creditRecords, state.stock, state.products, state.purchaseOrders, state.expenses],
  );
  const todayActionRows = useMemo(
    () =>
      buildTodayActionRows({
        credits: creditRecords,
        orders: state.orders,
        expenses: state.expenses,
        stock: state.stock,
        products: state.products || [],
        invoices: invoiceRows,
        taxRows: taxCalendarRows,
      }),
    [creditRecords, state.orders, state.expenses, state.stock, state.products, invoiceRows, taxCalendarRows],
  );
  const integrityReport = useMemo(
    () => buildStateIntegrityReport(state, creditRecords),
    [state, creditRecords],
  );
  const goLiveReport = useMemo(
    () => buildGoLiveReadiness(state, integrityReport),
    [state, integrityReport],
  );

  useEffect(() => {
    if (Number(state.dbMeta?.baselineVersion || 0) >= localDbBaselineVersion) return;
    setState(hydrateState(initialState));
  }, [state.dbMeta?.baselineVersion]);

  useEffect(() => {
    if (!remoteApiEnabled) return undefined;
    let active = true;
    const token = getRemoteToken();

    if (!token) {
      setState((current) =>
        hydrateState({
          ...current,
          settings: { ...current.settings, sessionUserId: null },
        }),
      );
      setRemoteAuthStatus("signedOut");
      return undefined;
    }

    Promise.all([loadRemoteState(), getRemoteSession()])
      .then(([payload, session]) => {
        if (!active) return;
        setState(
          hydrateState({
            ...(payload.state || initialState),
            settings: {
              ...(payload.state?.settings || initialState.settings),
              sessionUserId: session.user.id,
              currentRole: session.user.role,
            },
          }),
        );
        setRemoteAuthStatus("signedIn");
        setAuthError("");
      })
      .catch((error) => {
        if (!active) return;
        setRemoteToken("");
        setState((current) =>
          hydrateState({
            ...current,
            settings: { ...current.settings, sessionUserId: null },
          }),
        );
        setRemoteAuthStatus("signedOut");
        setAuthError(error instanceof Error ? error.message : "Server sessiyası açılmadı.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(localDbKey, JSON.stringify(state));
    } catch {
      notify("Local DB yazılışı mümkün olmadı.", "warning");
    }
    if (!remoteApiEnabled || !getRemoteToken()) return undefined;
    window.clearTimeout(remoteSaveTimer.current);
    remoteSaveTimer.current = window.setTimeout(() => {
      saveRemoteState(state).catch((error) => {
        setAuthError(error instanceof Error ? error.message : "Serverə yazılış alınmadı.");
      });
    }, 500);
    return () => window.clearTimeout(remoteSaveTimer.current);
  }, [state]);

  useEffect(() => {
    if (state.employees.length === 0) return;

    setState((current) => {
      const payrollExpense = buildPayrollExpense(current.employees);
      const existing = current.expenses.find((expense) => expense.id === payrollExpense.id);
      const nextExpense = existing
        ? {
            ...existing,
            ...payrollExpense,
            status: existing.status || payrollExpense.status,
          }
        : payrollExpense;
      const isSame =
        existing &&
        Number(existing.amount || 0) === payrollExpense.amount &&
        Number(existing.grossTotal || 0) === payrollExpense.grossTotal &&
        Number(existing.deductions || 0) === payrollExpense.deductions &&
        existing.source === payrollExpense.source &&
        existing.cashImpact === payrollExpense.cashImpact;

      if (isSame) return current;

      const expenses = existing
        ? current.expenses.map((expense) => (expense.id === payrollExpense.id ? nextExpense : expense))
        : [nextExpense, ...current.expenses];

      return appendAudit(
        {
          ...current,
          expenses,
        },
        {
          module: "HR/Maliyyə",
          action: existing ? "Payroll expense yeniləndi" : "Payroll expense yaradıldı",
          detail: `${money(payrollExpense.amount)} payroll maliyyəyə avtomatik düşdü`,
          status: "Avtomatik",
          role: "System",
        },
      );
    });
  }, [state.employees]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [active]);

  useEffect(() => {
    if (!currentUser) return;
    if (visibleNavItems.some((item) => item.id === active)) return;
    setActive(visibleNavItems[0]?.id || "dashboard");
  }, [active, currentUser, visibleNavItems]);

  const filtered = useMemo(
    () => ({
      customers: filterRows(state.customers, query),
      orders: filterRows(state.orders, query),
      stock: filterRows(state.stock, query),
      warehouses: filterRows(state.warehouses, query),
      expenses: filterRows(state.expenses, query),
      cashEntries: filterRows(state.cashEntries || [], query),
      invoices: filterRows(invoiceRows, query),
      accountingJournal: filterRows(accountingData.journalRows, query),
      accountingChart: filterRows(accountingData.chartRows, query),
      taxCalendar: filterRows(taxCalendarRows, query),
      currency: filterRows(currencyExposureRows, query),
      apiWebhooks: filterRows(apiWebhookRows, query),
      credits: filterRows(creditRecords, query),
      vendors: filterRows(state.vendors, query),
      employees: filterRows(state.employees, query),
      contracts: filterRows(state.contracts, query),
      receivables: filterRows(receivableRows, query),
      projects: filterRows(projectRoiRows, query),
      productionPlans: filterRows(productionRows, query),
      supportTickets: filterRows(state.supportTickets || [], query),
      knowledgeBase: filterRows(state.knowledgeBase || [], query),
      notifications: filterRows(state.notifications, query),
      conversations: filterRows(state.conversations, query),
    }),
    [
      query,
      state,
      creditRecords,
      receivableRows,
      projectRoiRows,
      productionRows,
      invoiceRows,
      accountingData,
      taxCalendarRows,
      currencyExposureRows,
      apiWebhookRows,
    ],
  );

  const dashboardStats = useMemo(() => {
    const openOrders = state.orders.filter((order) => order.status !== "Təhvil verilib");
    const pending = state.expenses.filter((expense) => expense.status === "Təsdiq gözləyir");
    return {
      revenue: total(state.orders, "amount"),
      activeCustomers: state.customers.length,
      openOrders: openOrders.length,
      pending: pending.length,
      reserved: total(state.stock, "reserved"),
      available: state.stock.reduce((sum, item) => sum + item.total - item.reserved, 0),
    };
  }, [state]);

  function notify(message, variant = "success") {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  }

  function can(permission) {
    return hasEffectivePermission(state.settings, permission);
  }

  function requirePermission(permission, action) {
    if (can(permission)) return true;

    const roleName = activeRoleInfo?.name || "Rol seçilməyib";
    notify(`${roleName}: ${action} üçün icazə yoxdur.`, "warning");
    setState((current) =>
      appendAudit(current, {
        module: "Permission",
        action: "Əməliyyat bloklandı",
        detail: `${roleName}: ${action}`,
        status: "İcazə yoxdur",
        role: roleName,
      }),
    );
    return false;
  }

  function requireSystemBackup(action) {
    return requirePermission("system.backup", action);
  }

  function auditCurrentState(nextState, audit) {
    return appendAudit(nextState, {
      ...audit,
      role: getActiveRole(nextState.settings)?.name || activeRoleInfo?.name || "System",
    });
  }

  function auditOperation(audit) {
    setState((current) =>
      appendAudit(current, {
        ...audit,
        role: getActiveRole(current.settings)?.name || activeRoleInfo?.name || "System",
      }),
    );
  }

  function getCreateAudit(type, values) {
    const auditByType = {
      crm: { module: "CRM", action: "Müştəri yaradıldı", detail: values.name },
      sales: {
        module: "Satış",
        action: values.paymentMethod === "Kredit" ? "Kredit satış yaradıldı" : "Satış yaradıldı",
        detail: `${values.customer || "Müştəri"} · ${money(Number(values.orderTotal ?? values.amount ?? 0))}`,
      },
      dashboard: {
        module: "Satış",
        action: values.paymentMethod === "Kredit" ? "Kredit satış yaradıldı" : "Satış yaradıldı",
        detail: `${values.customer || "Müştəri"} · ${money(Number(values.orderTotal ?? values.amount ?? 0))}`,
      },
      finance: {
        module: "Maliyyə",
        action: "Xərc yaradıldı",
        detail: `${values.description || "Xərc"} · ${money(Number(values.amount || 0))}`,
      },
      credits: {
        module: "Kredit",
        action: "Manual kredit yaradıldı",
        detail: `${values.customer || "Müştəri"} · ${money(Number(values.total || 0))}`,
      },
      vendors: { module: "Vendor", action: "Vendor yaradıldı", detail: values.name },
      product: { module: "Məhsul", action: "Məhsul yaradıldı", detail: values.name },
      hr: { module: "HR", action: "Əməkdaş yaradıldı", detail: values.name },
      contracts: { module: "Müqavilə", action: "Müqavilə yaradıldı", detail: values.customer },
    };

    return auditByType[type] || { module: "Sistem", action: "Qeyd yaradıldı", detail: type };
  }

  function hasCreatePermission(type, values) {
    const permission = createPermissionByType[type];
    if (!permission) return true;

    const isCreditSale = (type === "sales" || type === "dashboard") && values.paymentMethod === "Kredit";
    if (can(permission) || (isCreditSale && can("credits.manage"))) return true;

    const action = isCreditSale ? "kredit satış yaratmaq" : createConfig[type]?.title || "qeyd yaratmaq";
    return requirePermission(permission, action);
  }

  function choosePage(id) {
    if (!canAccessNavItem(state.settings, id)) {
      notify("Bu modul aktiv istifadəçi üçün gizlədilib.", "warning");
      return;
    }
    setActive(id);
    setMobileNav(false);
  }

  function loginUser(userId) {
    const user = state.settings.users.find((item) => item.id === userId && item.status === "Aktiv");
    if (!user) {
      notify("Aktiv istifadəçi seçin.", "warning");
      return;
    }

    setState((current) =>
      appendAudit(
        {
          ...current,
          settings: {
            ...current.settings,
            sessionUserId: user.id,
            currentRole: user.role,
          },
        },
        {
          module: "Auth",
          action: "Giriş edildi",
          detail: `${user.name} · ${user.role}`,
          role: user.role,
        },
      ),
    );
    notify(`${user.name} kimi giriş edildi.`);
  }

  async function loginWithPassword({ email, password }) {
    if (!remoteApiEnabled) return;
    setRemoteAuthStatus("checking");
    setAuthError("");
    try {
      const login = await loginRemote(email, password);
      setRemoteToken(login.token);
      const payload = await loadRemoteState();
      setState(
        hydrateState({
          ...(payload.state || initialState),
          settings: {
            ...(payload.state?.settings || initialState.settings),
            sessionUserId: login.user.id,
            currentRole: login.user.role,
          },
        }),
      );
      setRemoteAuthStatus("signedIn");
      notify(`${login.user.name} kimi giriş edildi.`);
    } catch (error) {
      setRemoteToken("");
      setRemoteAuthStatus("signedOut");
      setAuthError(error instanceof Error ? error.message : "Giriş alınmadı.");
    }
  }

  function logoutUser() {
    const userName = currentUser?.name || "İstifadəçi";
    setState((current) =>
      appendAudit(
        {
          ...current,
          settings: {
            ...current.settings,
            sessionUserId: null,
          },
        },
        {
          module: "Auth",
          action: "Çıxış edildi",
          detail: userName,
          role: activeRoleInfo?.name || "System",
        },
      ),
    );
    if (remoteApiEnabled) {
      logoutRemote().catch(() => undefined);
      setRemoteToken("");
      setRemoteAuthStatus("signedOut");
    }
    notify(`${userName} sistemdən çıxdı.`);
  }

  async function createUser(values) {
    if (!requirePermission("settings.manage", "istifadəçi yaratmaq")) return;

    const userName = String(values.name || "").trim();
    const email = String(values.email || "").trim();
    const role = values.role || defaultRoles[0].name;
    const roleOptions = state.settings.roles || defaultRoles;
    const moduleAccess = normalizeUserModuleAccess(
      {
        role,
        moduleAccess: Array.isArray(values.moduleAccess) ? values.moduleAccess : undefined,
      },
      roleOptions,
    );

    if (!userName || !email) {
      notify("İstifadəçi adı və email daxil edin.", "warning");
      return;
    }

    let user = {
      id: `USR-${Date.now()}`,
      name: userName,
      email,
      role,
      status: "Aktiv",
      moduleAccess,
    };

    if (remoteApiEnabled) {
      const password = String(values.password || "");
      if (password.length < 8) {
        notify("Server istifadəçisi üçün ən azı 8 simvoldan ibarət parol daxil edin.", "warning");
        return;
      }
      try {
        const remote = await createRemoteUser({ ...user, password });
        user = { ...remote.user, moduleAccess };
      } catch (error) {
        notify(error instanceof Error ? error.message : "İstifadəçi yaradılmadı.", "warning");
        return;
      }
    }

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          settings: {
            ...current.settings,
            users: [user, ...(current.settings.users || [])],
          },
        },
        {
          module: "Ayarlar/Auth",
          action: "İstifadəçi yaradıldı",
          detail: `${user.name} · ${user.role}`,
        },
      ),
    );
    notify(`${user.name} istifadəçisi yaradıldı.`);
  }

  function updateUserStatus(userId, status) {
    if (!requirePermission("settings.manage", "istifadəçi statusunu dəyişmək")) return;

    setState((current) => {
      const nextUsers = (current.settings.users || []).map((user) =>
        user.id === userId ? { ...user, status } : user,
      );
      const nextSessionUserId = status !== "Aktiv" && current.settings.sessionUserId === userId ? null : current.settings.sessionUserId;

      return auditCurrentState(
        {
          ...current,
          settings: {
            ...current.settings,
            users: nextUsers,
            sessionUserId: nextSessionUserId,
          },
        },
        {
          module: "Ayarlar/Auth",
          action: "İstifadəçi statusu dəyişdi",
          detail: `${userId}: ${status}`,
        },
      );
    });
  }

  function toggleUserModuleAccess(userId, moduleId) {
    if (!requirePermission("settings.manage", "istifadÉ™Ã§i modul icazÉ™sini dÉ™yiÅŸmÉ™k")) return;

    setState((current) => {
      const users = current.settings.users || [];
      const targetUser = users.find((user) => user.id === userId);
      if (!targetUser || targetUser.role === "Super Admin") return current;

      const currentAccess = normalizeUserModuleAccess(targetUser, current.settings.roles || defaultRoles);
      const nextAccess = currentAccess.includes(moduleId)
        ? currentAccess.filter((id) => id !== moduleId)
        : [...currentAccess, moduleId];
      const safeAccess = nextAccess.length > 0 ? nextAccess : ["dashboard"];

      return auditCurrentState(
        {
          ...current,
          settings: {
            ...current.settings,
            users: users.map((user) =>
              user.id === userId ? { ...user, moduleAccess: safeAccess } : user,
            ),
          },
        },
        {
          module: "Ayarlar/Auth",
          action: "Modul icazÉ™si dÉ™yiÅŸdi",
          detail: `${targetUser.name}: ${moduleId}`,
        },
      );
    });
  }

  function getActionStamp() {
    return new Intl.DateTimeFormat("az-AZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }

  function runInvoiceAction() {
    const targetInvoice =
      invoiceRows.find((invoice) => invoice.eTaxStatus === "Göndərişə hazır") ||
      invoiceRows.find((invoice) => !invoice.invoiceSentAt);

    if (!targetInvoice) {
      notify("Göndəriləcək faktura tapılmadı.", "warning");
      return;
    }

    const stamp = getActionStamp();
    const batchId = `ETX-${Date.now().toString().slice(-6)}`;

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          orders: current.orders.map((order) =>
            order.id === targetInvoice.orderId
              ? {
                  ...order,
                  eTaxStatus: "E-qaimə göndərildi",
                  invoiceBatchId: batchId,
                  invoiceSentAt: stamp,
                }
              : order,
          ),
        },
        {
          module: "Faktura",
          action: "E-qaimə göndərildi",
          detail: `${targetInvoice.id} · ${targetInvoice.customer} · ${batchId}`,
        },
      ),
    );
    notify(`${targetInvoice.id} e-qaimə növbəsinə göndərildi.`);
  }

  function runAccountingAction() {
    const stamp = getActionStamp();
    const journalCount = accountingData.journalRows.length;

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          accountingClose: {
            period: baseFinanceDate.slice(0, 7),
            exportedAt: stamp,
            journalCount,
            balance: accountingData.balance.assets,
            netProfit: accountingData.pl.netProfit,
          },
        },
        {
          module: "Mühasibat",
          action: "Jurnal export",
          detail: `${journalCount} jurnal sətri export üçün hazırlandı`,
        },
      ),
    );
    notify("Jurnal export hazırlandı və mühasibat bağlanışına yazıldı.");
  }

  function runTaxAction() {
    const targetTax = taxCalendarRows.find(
      (row) => ["Gecikib", "Bu gün", "Yaxınlaşır"].includes(row.status) && !row.paymentTaskId,
    );

    if (!targetTax) {
      notify("Aktiv vergi öhdəliyi tapılmadı.", "warning");
      return;
    }

    const stamp = getActionStamp();
    const expenseId = `TAXPAY-${targetTax.id}`;
    const amount = Math.max(0, Math.round(Number(targetTax.amount || 0)));

    setState((current) => {
      const hasExpense = current.expenses.some((expense) => expense.id === expenseId);
      const expenses = hasExpense
        ? current.expenses
        : [
            {
              id: expenseId,
              description: `${targetTax.title} - ${targetTax.period}`,
              category: "Vergi",
              date: baseFinanceDate,
              amount,
              status: "Təsdiq gözləyir",
              source: "Vergi təqvimi",
            },
            ...current.expenses,
          ];

      return auditCurrentState(
        {
          ...current,
          expenses,
          taxCalendar: current.taxCalendar.map((item) =>
            item.id === targetTax.id
              ? {
                  ...item,
                  paymentStatus: "Ödəniş tapşırığı",
                  paymentTaskId: expenseId,
                  checkedAt: stamp,
                }
              : item,
          ),
        },
        {
          module: "Vergi/Maliyyə",
          action: "Ödəniş tapşırığı yaradıldı",
          detail: `${targetTax.title} · ${money(amount)}`,
        },
      );
    });
    notify(`${targetTax.title} üçün ödəniş tapşırığı maliyyəyə düşdü.`);
  }

  function runReceivableSyncAction() {
    const debtorTotal = receivableRows
      .filter((row) => row.type === "Debitor")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const creditorTotal = receivableRows
      .filter((row) => row.type === "Kreditor")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const overdueCount = receivableRows.filter((row) => Number(row.overdueDays || 0) > 0).length;
    const stamp = getActionStamp();

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          receivableSync: {
            at: stamp,
            debtorTotal,
            creditorTotal,
            overdueCount,
            rows: receivableRows.length,
          },
        },
        {
          module: "Debitor/Kreditor",
          action: "Balans sinxronizasiya edildi",
          detail: `${receivableRows.length} tərəf · net ${money(debtorTotal - creditorTotal)}`,
        },
      ),
    );
    notify("Debitor/kreditor reyestri yeniləndi.");
  }

  function exportReport(title = "PDF export") {
    const stamp = getActionStamp();
    const exportRow = {
      id: `RPT-${Date.now().toString().slice(-6)}`,
      title,
      at: stamp,
      rows: state.orders.length + creditRecords.length + state.vendors.length + state.employees.length,
      owner: activeRoleInfo?.name || "System",
      status: "Hazır",
    };

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          reportExports: [exportRow, ...(current.reportExports || [])].slice(0, 12),
        },
        {
          module: "Hesabat",
          action: "Export hazırlandı",
          detail: `${title} · ${exportRow.rows} sətir`,
        },
      ),
    );
    notify(`${title} export siyahısına əlavə edildi.`);
  }

  function runProjectsExportAction() {
    if ((state.projects || []).length === 0) {
      notify("Export üçün layihə tapılmadı.", "warning");
      return;
    }

    const stamp = getActionStamp();
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          projects: (current.projects || []).map((project) => ({
            ...project,
            lastExportAt: stamp,
            exportCount: Number(project.exportCount || 0) + 1,
          })),
          reportExports: [
            {
              id: `RPT-ROI-${Date.now().toString().slice(-6)}`,
              title: "Layihə ROI",
              at: stamp,
              rows: (current.projects || []).length,
              owner: activeRoleInfo?.name || "System",
              status: "Hazır",
            },
            ...(current.reportExports || []),
          ].slice(0, 12),
        },
        {
          module: "Layihə ROI",
          action: "ROI export",
          detail: `${(current.projects || []).length} layihə export edildi`,
        },
      ),
    );
    notify("ROI export hazırlandı və layihələrə qeyd edildi.");
  }

  function runProductionAction() {
    const stamp = getActionStamp();

    setState((current) => {
      const materials = [...current.stock]
        .filter((item) => getAvailableQuantity(item) > 0)
        .sort((a, b) => getAvailableQuantity(a) - getAvailableQuantity(b))
        .slice(0, 2)
        .map((item) => ({ product: item.product, qty: 1 }));
      const fallbackMaterial = current.stock[0] ? [{ product: current.stock[0].product, qty: 1 }] : [];
      const planMaterials = materials.length > 0 ? materials : fallbackMaterial;
      const materialValue = planMaterials.reduce((sum, item) => {
        const stockItem = current.stock.find((stock) => stock.product === item.product);
        return sum + Number(stockItem?.price || 0);
      }, 0);
      const plan = {
        id: `BOM-${Date.now().toString().slice(-5)}`,
        product: "Yeni satış komplekti",
        plannedQty: 4,
        salePrice: Math.max(500, Math.round(materialValue * 1.35)),
        laborCost: 320,
        overheadCost: 180,
        status: "Planlandı",
        createdAt: stamp,
        materials: planMaterials,
      };

      return auditCurrentState(
        {
          ...current,
          productionPlans: [plan, ...(current.productionPlans || [])],
        },
        {
          module: "İstehsalat",
          action: "Plan yaradıldı",
          detail: `${plan.id} · ${plan.materials.map((item) => item.product).join(", ")}`,
        },
      );
    });
    notify("Yeni istehsal planı yaradıldı.");
  }

  function runSupportAction() {
    const signal = todayActionRows[0];
    const stamp = getActionStamp();
    const ticket = {
      id: `SUP-${Date.now().toString().slice(-5)}`,
      title: signal ? `${signal.title}: ${signal.detail}` : "Modul daxili yoxlama sorğusu",
      requester: activeRoleInfo?.name || "Sistem",
      module: signal ? pageMeta[signal.module]?.title || signal.module : "Platform",
      priority: signal?.priority || "Orta",
      status: "Açıq",
      owner: signal?.module === "credits" ? "Maliyyəçi" : "Admin",
      slaHours: signal?.priority === "Yüksək" ? 4 : 12,
      createdAt: stamp,
    };

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          supportTickets: [ticket, ...(current.supportTickets || [])],
        },
        {
          module: "Support",
          action: "Sorğu yaradıldı",
          detail: `${ticket.id} · ${ticket.title}`,
        },
      ),
    );
    notify(`${ticket.id} support növbəsinə əlavə edildi.`);
  }

  function runHelpAction() {
    const stamp = getActionStamp();
    const article = {
      id: `KB-${Date.now().toString().slice(-5)}`,
      title: "Modul əməliyyatları və audit izi",
      category: "Sistem",
      answer: "Başlıq aksiyaları real data dəyişikliyi yaradır, nəticə modul daxilində görünür və audit log-a yazılır.",
      tags: ["modul", "audit", "icazə"],
      createdAt: stamp,
    };

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          knowledgeBase: [article, ...(current.knowledgeBase || [])],
        },
        {
          module: "Kömək",
          action: "Məqalə əlavə edildi",
          detail: article.title,
        },
      ),
    );
    notify("Yeni kömək məqaləsi əlavə edildi.");
  }

  function runOnboardingAction() {
    const nextStep = onboardingRows.nextStep;

    if (!nextStep) {
      notify("Onboarding addımlarının hamısı faktiki məlumatlarla tamamlanıb.");
      return;
    }
    const destinationByStep = {
      "ONB-1": "settings",
      "ONB-2": "warehouse",
      "ONB-3": "warehouse",
      "ONB-4": "settings",
      "ONB-5": "finance",
      "ONB-6": "hr",
    };
    const destination = destinationByStep[nextStep.id] || "dashboard";
    choosePage(destination);
    auditOperation({
      module: "Onboarding",
      action: "Qurulum addımına keçid",
      detail: `${nextStep.id} · ${nextStep.title}`,
    });
    notify(`${nextStep.title} üçün uyğun modul açıldı.`);
  }

  function runApiAction() {
    const targetWebhook = apiWebhookRows.find((webhook) => webhook.queueCount > 0) || apiWebhookRows[0];

    if (!targetWebhook) {
      notify("Webhook qaydası tapılmadı.", "warning");
      return;
    }

    const stamp = getActionStamp();
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          apiWebhooks: (current.apiWebhooks || []).map((webhook) =>
            webhook.id === targetWebhook.id
              ? {
                  ...webhook,
                  status: "Aktiv",
                  processedCount: Number(webhook.processedCount || 0) + (targetWebhook.queueCount > 0 ? 1 : 0),
                  lastPayloadOverride: `${targetWebhook.event} test · ${stamp}`,
                  lastTestAt: stamp,
                }
              : webhook,
          ),
        },
        {
          module: "API/Webhook",
          action: "Webhook test",
          detail: `${targetWebhook.id} · ${targetWebhook.event}`,
        },
      ),
    );
    notify(`${targetWebhook.id} webhook testi tamamlandı.`);
  }

  function openAction() {
    if (active === "reports") {
      exportReport("PDF export");
      return;
    }
    if (active === "notifications") {
      markAllNotificationsRead();
      return;
    }
    if (active === "settings") {
      saveSettings();
      return;
    }
  const permission = createPermissionByType[active];
  if (permission && !requirePermission(permission, pageMeta[active]?.action || "əməliyyat")) return;
  if (active === "warehouse") {
    setModal({ type: "warehouse", mode: "create" });
    return;
  }
  if (active === "dashboard" || active === "sales") {
    setModal({ type: "sales" });
    return;
  }
  if (active === "credits") {
    setModal({ type: "sales", presetPaymentMethod: "Kredit" });
    return;
  }
  if (active === "invoices") {
    runInvoiceAction();
    return;
  }
  if (active === "accounting") {
    runAccountingAction();
    return;
  }
  if (active === "tax") {
    runTaxAction();
    return;
  }
  if (active === "receivables") {
    runReceivableSyncAction();
    return;
  }
  if (active === "projects") {
    runProjectsExportAction();
    return;
  }
  if (active === "production") {
    runProductionAction();
    return;
  }
  if (active === "support") {
    runSupportAction();
    return;
  }
  if (active === "help") {
    runHelpAction();
    return;
  }
  if (active === "onboarding") {
    runOnboardingAction();
    return;
  }
  if (active === "api") {
    runApiAction();
    return;
  }
  setModal({ type: createConfig[active] ? active : "sales" });
}

  function createRecord(type, values) {
    if (!hasCreatePermission(type, values)) return;

    if (type === "sales" || type === "dashboard") {
      const warehouseId = values.warehouseId || state.warehouses[0]?.id;
      const productLines = (Array.isArray(values.products) ? values.products : [])
        .filter((item) => item.product)
        .map((item) => ({ product: item.product, qty: Number(item.qty || 0) }));
      const warehouseRows = state.warehouseStock?.[warehouseId] || [];
      const hasInsufficientStock = productLines.some((line) => {
        const item = warehouseRows.find((row) => row.product === line.product);
        return !item || line.qty <= 0 || getAvailableQuantity(item) < line.qty;
      });

      if (
        !values.customer ||
        !warehouseId ||
        productLines.length === 0 ||
        Number(values.orderTotal || 0) <= 0 ||
        hasInsufficientStock
      ) {
        notify("Sifariş üçün müştəri, anbar və satış üçün kifayət qədər məhsul seçin.", "warning");
        return;
      }
    }

    if (type === "warehouse") {
      const id = `WH-${Date.now()}`;
      const warehouse = {
        id,
        code: values.code || `ANB-${state.warehouses.length + 1}`,
        name: values.name,
        city: values.city,
        address: values.address,
        manager: values.manager,
        type: values.type,
        capacity: Number(values.capacity || 0),
        status: values.status || "Aktiv",
      };
      setState((current) => ({
        ...current,
        warehouses: [warehouse, ...current.warehouses],
        warehouseStock: {
          ...current.warehouseStock,
          [id]: [],
        },
      }));
      setSelectedWarehouseId(id);
      setModal(null);
      notify("Yeni anbar yaradıldı.");
      auditOperation({
        module: "Anbar",
        action: "Anbar yaradıldı",
        detail: `${warehouse.name} (${warehouse.code})`,
      });
      return;
    }

    if (type === "product") {
      const name = String(values.name || "").trim();
      const sku = String(values.sku || "").trim().toUpperCase();
      if (!name || !sku) {
        notify("Məhsul adı və SKU daxil edin.", "warning");
        return;
      }
      if (state.products.some((product) => normalize(product.sku) === normalize(sku))) {
        notify("Bu SKU artıq məhsul kataloqunda var.", "warning");
        return;
      }
      const product = {
        id: `PRD-${Date.now()}`,
        name,
        sku,
        category: values.category || "Digər",
        unit: values.unit || "ədəd",
        salePrice: Math.max(0, Number(values.salePrice || 0)),
        costPrice: Math.max(0, Number(values.costPrice || 0)),
        reorderLevel: Math.max(0, Math.round(Number(values.reorderLevel || 0))),
        serialTracked: values.serialTracked === "Bəli",
        status: "Aktiv",
      };
      setState((current) =>
        auditCurrentState(
          { ...current, products: [product, ...(current.products || [])] },
          getCreateAudit("product", product),
        ),
      );
      setModal(null);
      notify(`${product.name} məhsul kataloquna əlavə edildi.`);
      return;
    }

    setState((current) => {
      if (type === "crm") {
        return {
          ...current,
          customers: [
            {
              fin: values.fin || `FIN${current.customers.length + 1}`,
              name: values.name,
              phone: values.phone,
              category: values.category,
              limit: Number(values.limit || 0),
              debt: Number(values.debt || 0),
              delay: 0,
            },
            ...current.customers,
          ],
        };
      }

      if (type === "sales" || type === "dashboard") {
        const nextId = `SF-${Date.now()}`;
        const orderProducts = Array.isArray(values.products) ? values.products : [];
        const orderSellers = Array.isArray(values.sellers) ? values.sellers : [];
        const amount = Number(values.orderTotal ?? values.amount ?? 0);
        const paymentMethod = values.paymentMethod || "Nağd";
        const isCreditSale = paymentMethod === "Kredit";
        const creditPlan = isCreditSale
          ? buildCreditPlan({
              total: amount,
              initialPayment: values.initialPayment,
              months: values.creditMonths,
            })
          : null;
        const paid = isCreditSale
          ? creditPlan.initialPayment
          : ["Nağd", "Kart", "Köçürmə"].includes(paymentMethod)
            ? amount
            : 0;
        const creditId = isCreditSale ? `KR-${String(nextId).replace(/\D/g, "")}` : null;
        const contractId = isCreditSale
          ? `MQ-${currentBusinessDate.slice(0, 4)}-${Date.now()}`
          : null;
        const warehouseId = values.warehouseId || current.warehouses?.[0]?.id;
        const warehouseName =
          current.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name || "Baş Anbar";
        const productLines = orderProducts
          .filter((item) => item.product)
          .map((item) => ({
            product: item.product,
            qty: Number(item.qty || 0),
            price: Number(item.price || 0),
            serials: Array.isArray(item.serials) ? item.serials.filter(Boolean) : [],
          }));
        const productSummary = orderProducts
          .filter((item) => item.product)
          .map((item) => `${item.product}${Number(item.qty) > 1 ? ` x${Number(item.qty)}` : ""}`)
          .join(", ");
        const sellerSummary = orderSellers
          .filter((item) => item.seller)
          .map((item) => `${item.seller} ${Number(item.bonus || 0)}%`)
          .join(", ");
        const sellerBonuses = orderSellers
          .filter((item) => item.seller)
          .map((item) => ({
            seller: item.seller,
            bonus: Number(item.bonus || 0),
          }));
        const reservedByProduct = buildQuantityMap(productLines);
        const nextWarehouseStock =
          warehouseId && current.warehouseStock?.[warehouseId]
            ? {
                ...current.warehouseStock,
                [warehouseId]: updateSerialStatuses(
                  adjustStockRows(current.warehouseStock[warehouseId], reservedByProduct, {
                    reservedDelta: 1,
                  }),
                  productLines,
                  "Rezervdə",
                  nextId,
                ),
              }
            : current.warehouseStock;
        return {
          ...current,
          warehouseStock: nextWarehouseStock,
          stock: adjustStockRows(current.stock, reservedByProduct, { reservedDelta: 1 }),
          credits: isCreditSale
            ? [
                {
                  id: creditId,
                  customer: values.customer,
                  fin: values.fin || "Yeni FİN",
                  orderId: nextId,
                  contractId,
                  product: productSummary,
                  device: productSummary,
                  total: amount,
                  initialPayment: creditPlan.initialPayment,
                  balance: creditPlan.balance,
                  monthly: creditPlan.monthly,
                  lastPayment: creditPlan.lastPayment,
                  months: creditPlan.months,
                  paidMonths: 0,
                  rate: 0,
                  next: creditPlan.installments[0]?.due || "—",
                  status: "Aktiv",
                  installments: creditPlan.installments,
                  createdFrom: "Satış sifarişi",
                },
                ...current.credits,
              ]
            : current.credits,
          orders: [
            {
              id: nextId,
              customer: values.customer,
              fin: values.fin || "Yeni FİN",
              products: productSummary || values.products,
              productLines,
              seller: sellerSummary || values.seller || "Təyin edilməyib",
              sellerBonuses,
              amount,
              paid,
              status: values.status || "Anbardadır",
              date: values.date || currentBusinessDate,
              address: values.address || "Qeyd edilməyib",
              driver: "—",
              warehouseId,
              warehouseName,
              paymentMethod,
              paymentStatus: paymentMethod === "Kredit" ? "Kredit satış" : "Ödənilib",
              creditId,
              contractId,
              creditMonths: creditPlan?.months || null,
              initialPayment: creditPlan?.initialPayment || 0,
              creditBalance: creditPlan?.balance || 0,
              creditMonthly: creditPlan?.monthly || 0,
              creditLastPayment: creditPlan?.lastPayment || 0,
              deliveryStatus: "Təhvil gözləyir",
              note: values.note || "",
              bonusTotal: Number(values.bonusTotal || 0),
            },
            ...current.orders,
          ],
          contracts: isCreditSale
            ? [
                {
                  id: contractId,
                  customer: values.customer,
                  fin: values.fin || "Yeni FİN",
                  product: productSummary,
                  amount,
                  status: "Hazırlanır",
                  orderId: nextId,
                },
                ...current.contracts,
              ]
            : current.contracts,
        };
      }

      if (type === "finance") {
        return {
          ...current,
          expenses: [
            {
              id: `MX-${Date.now()}`,
              description: values.description,
              category: values.category,
              date: values.date || currentBusinessDate,
              amount: Number(values.amount || 0),
              status: "Təsdiq gözləyir",
            },
            ...current.expenses,
          ],
        };
      }

      if (type === "credits") {
        const creditPlan = buildCreditPlan({
          total: values.total,
          initialPayment: values.initialPayment,
          months: values.months,
        });
        return {
          ...current,
          credits: [
            {
              id: `KR-${Date.now()}`,
              customer: values.customer,
              contractId: values.contractId,
              product: values.product,
              device: values.product,
              total: creditPlan.total,
              initialPayment: creditPlan.initialPayment,
              balance: creditPlan.balance,
              monthly: creditPlan.monthly,
              lastPayment: creditPlan.lastPayment,
              months: creditPlan.months,
              paidMonths: 0,
              rate: 0,
              next: values.next || creditPlan.installments[0]?.due || "—",
              status: "Aktiv",
              installments: creditPlan.installments,
            },
            ...current.credits,
          ],
        };
      }

      if (type === "vendors") {
        return {
          ...current,
          vendors: [
            {
              name: values.name,
              country: values.country,
              sku: Number(values.sku || 0),
              sold: 0,
              quota: Number(values.quota || 0),
              status: "Aktiv",
            },
            ...current.vendors,
          ],
        };
      }

      if (type === "hr") {
        const manager = current.employees.find(
          (employee) => getEmployeeKey(employee) === values.managerId || employee.name === values.managerName,
        );
        return {
          ...current,
          employees: [
            {
              id: `EMP-${Date.now()}`,
              initials: values.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toLocaleUpperCase("az-AZ"),
              name: values.name,
              position: values.position,
              department: values.department,
              departmentParent: values.departmentParent || "",
              managerId: manager ? getEmployeeKey(manager) : "",
              managerName: manager?.name || values.managerName || "",
              level: values.level || "Komanda üzvü",
              salary: Number(values.salary || 0),
              kpi: Number(values.kpi || 85),
              hireDate: values.hireDate || currentBusinessDate,
              workMode: values.workMode || "Ofis",
              shift: values.shift || "09:00-18:00",
              employmentType: values.employmentType || "Tam ştat",
              leaveBalance: Math.max(0, Number(values.leaveBalance || 0)),
              usedLeave: 0,
              documentsComplete: Math.max(0, Math.min(100, Number(values.documentsComplete ?? 100))),
              hrStatus: "Stabil",
              documentReviewRequired: false,
              skills: String(values.skills || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            },
            ...current.employees,
          ],
        };
      }

      if (type === "contracts") {
        return {
          ...current,
          contracts: [
            {
              id: `MQ-${currentBusinessDate.slice(0, 4)}-${Date.now()}`,
              customer: values.customer,
              fin: values.fin || "Yeni FİN",
              product: values.product,
              amount: Number(values.amount || 0),
              status: "Hazırlanır",
            },
            ...current.contracts,
          ],
        };
      }

      return current;
    });
    setModal(null);
    notify("Yeni qeyd əlavə olundu.");
    auditOperation(getCreateAudit(type, values));
  }

  function updateWarehouse(id, values) {
    if (!requirePermission("warehouse.manage", "anbarı redaktə etmək")) return;

    setState((current) => ({
      ...current,
      warehouses: current.warehouses.map((warehouse) =>
        warehouse.id === id
          ? {
              ...warehouse,
              code: values.code,
              name: values.name,
              city: values.city,
              address: values.address,
              manager: values.manager,
              type: values.type,
              capacity: Number(values.capacity || 0),
              status: values.status,
            }
          : warehouse,
      ),
    }));
    setModal(null);
    notify("Anbar məlumatları yeniləndi.");
    auditOperation({
      module: "Anbar",
      action: "Anbar redaktə edildi",
      detail: `${values.name} (${values.code})`,
    });
  }

  function recordStockIntake(values) {
    if (!requirePermission("warehouse.manage", "anbara mədaxil etmək")) return;

    const warehouseId = values.warehouseId;
    const warehouse = state.warehouses.find((item) => item.id === warehouseId);
    const product = String(values.product || "").trim();
    const qty = Math.max(0, Math.round(Number(values.qty || 0)));
    const price = Math.max(0, Number(values.price || 0));

    if (!warehouse || !product || qty <= 0) {
      notify("Mədaxil üçün anbar, məhsul və etibarlı miqdar daxil edin.", "warning");
      return;
    }

    setState((current) => {
      const knownProduct = (current.products || []).find((item) => normalize(item.name) === normalize(product));
      const catalogProduct = knownProduct
        ? {
            ...knownProduct,
            salePrice: price || Number(knownProduct.salePrice || 0),
          }
        : {
            id: `PRD-${Date.now()}`,
            name: product,
            sku: `SKU-${Date.now().toString().slice(-6)}`,
            category: "Digər",
            unit: "ədəd",
            salePrice: price,
            costPrice: 0,
            reorderLevel: 0,
            serialTracked: price >= 1500,
            status: "Aktiv",
          };
      const products = knownProduct
        ? current.products.map((item) => (item.id === knownProduct.id ? catalogProduct : item))
        : [catalogProduct, ...(current.products || [])];

      return auditCurrentState(
        {
          ...current,
          products,
          warehouseStock: {
            ...current.warehouseStock,
            [warehouseId]: addStockToRows(
              current.warehouseStock?.[warehouseId] || [],
              product,
              qty,
              price,
              warehouseId,
              catalogProduct,
            ),
          },
          stock: addStockToRows(current.stock, product, qty, price, "", catalogProduct),
        },
        {
          module: "Anbar",
          action: "İlkin mədaxil edildi",
          detail: `${product}: ${qty} ədəd · ${warehouse.name}`,
        },
      );
    });
    setModal(null);
    notify(`${product}: ${qty} ədəd ${warehouse.name} anbarına mədaxil edildi.`);
  }

  function importWarehouseStock(rows) {
    if (!requirePermission("warehouse.manage", "anbara toplu import etmək")) return;
    if (!Array.isArray(rows) || rows.length === 0) {
      notify("İmport üçün etibarlı CSV sətri tapılmadı.", "warning");
      return;
    }

    setState((current) => {
      let nextProducts = [...(current.products || [])];
      let nextStock = [...(current.stock || [])];
      const nextWarehouseStock = { ...(current.warehouseStock || {}) };
      const productBySku = new Map(nextProducts.filter((product) => product.sku).map((product) => [normalize(product.sku), product]));
      const productByName = new Map(nextProducts.map((product) => [normalize(product.name), product]));
      const warehouseById = new Map((current.warehouses || []).map((warehouse) => [warehouse.id, warehouse]));
      const touchedProducts = new Set();
      const touchedWarehouses = new Set();

      rows.forEach((row, index) => {
        const warehouse = warehouseById.get(row.warehouseId);
        if (!warehouse) return;

        const matchedProduct = (row.sku && productBySku.get(normalize(row.sku))) || productByName.get(normalize(row.product));
        const product = matchedProduct
          ? {
              ...matchedProduct,
              category: row.category || matchedProduct.category || "Digər",
              unit: row.unit || matchedProduct.unit || "ədəd",
              salePrice: row.salePrice ?? Number(matchedProduct.salePrice || 0),
              costPrice: row.costPrice ?? Number(matchedProduct.costPrice || 0),
              reorderLevel: row.reorderLevel ?? Number(matchedProduct.reorderLevel || 0),
              serialTracked: row.serialTracked ?? Boolean(matchedProduct.serialTracked),
              status: matchedProduct.status || "Aktiv",
            }
          : {
              id: `PRD-IMP-${Date.now()}-${index}`,
              name: row.product,
              sku: row.sku || `SKU-IMP-${Date.now().toString().slice(-6)}-${index + 1}`,
              category: row.category || "Digər",
              unit: row.unit || "ədəd",
              salePrice: row.salePrice ?? 0,
              costPrice: row.costPrice ?? 0,
              reorderLevel: row.reorderLevel ?? 0,
              serialTracked: row.serialTracked ?? false,
              status: "Aktiv",
            };

        if (matchedProduct) {
          nextProducts = nextProducts.map((item) => (item.id === product.id ? product : item));
        } else {
          nextProducts = [product, ...nextProducts];
        }
        productBySku.set(normalize(product.sku), product);
        productByName.set(normalize(product.name), product);

        const salePrice = row.salePrice ?? Number(product.salePrice || 0);
        nextWarehouseStock[warehouse.id] = addStockToRows(
          nextWarehouseStock[warehouse.id] || [],
          product.name,
          row.qty,
          salePrice,
          warehouse.id,
          product,
        );
        nextStock = addStockToRows(nextStock, product.name, row.qty, salePrice, "", product);
        touchedProducts.add(product.id);
        touchedWarehouses.add(warehouse.id);
      });

      return auditCurrentState(
        {
          ...current,
          products: nextProducts,
          stock: nextStock,
          warehouseStock: nextWarehouseStock,
        },
        {
          module: "Anbar",
          action: "Toplu stok import edildi",
          detail: `${rows.length} sətir · ${touchedProducts.size} məhsul · ${touchedWarehouses.size} anbar`,
        },
      );
    });
    setModal(null);
    notify(`${rows.length} stok sətri anbara import edildi.`);
  }

  function updateProduct(productId, values) {
    if (!requirePermission("warehouse.manage", "məhsul kataloqunu redaktə etmək")) return;

    const currentProduct = state.products.find((product) => product.id === productId);
    const name = String(values.name || "").trim();
    const sku = String(values.sku || "").trim().toUpperCase();
    if (!currentProduct || !name || !sku) {
      notify("Məhsul adı və SKU daxil edin.", "warning");
      return;
    }
    if (state.products.some((product) => product.id !== productId && normalize(product.sku) === normalize(sku))) {
      notify("Bu SKU artıq məhsul kataloqunda var.", "warning");
      return;
    }

    const nextProduct = {
      ...currentProduct,
      name,
      sku,
      category: values.category || "Digər",
      unit: values.unit || "ədəd",
      salePrice: Math.max(0, Number(values.salePrice || 0)),
      costPrice: Math.max(0, Number(values.costPrice || 0)),
      reorderLevel: Math.max(0, Math.round(Number(values.reorderLevel || 0))),
      serialTracked: values.serialTracked === "Bəli",
    };
    setState((current) => {
      const renameStockItem = (item, warehouseId = "") => {
        if (item.product !== currentProduct.name) return item;
        const nextItem = {
          ...item,
          product: nextProduct.name,
          price: nextProduct.salePrice || item.price,
          serialTracked: nextProduct.serialTracked,
          reorderLevel: nextProduct.reorderLevel,
        };
        return {
          ...nextItem,
          serials: ensureStockItemSerials(nextItem, warehouseId).serials,
        };
      };
      const warehouseStock = Object.fromEntries(
        Object.entries(current.warehouseStock || {}).map(([warehouseId, rows]) => [
          warehouseId,
          (rows || []).map((item) => renameStockItem(item, warehouseId)),
        ]),
      );
      return auditCurrentState(
        {
          ...current,
          products: current.products.map((product) => (product.id === productId ? nextProduct : product)),
          stock: current.stock.map((item) => renameStockItem(item)),
          warehouseStock,
        },
        {
          module: "Məhsul",
          action: "Məhsul redaktə edildi",
          detail: `${nextProduct.sku} · ${nextProduct.name}`,
        },
      );
    });
    setModal(null);
    notify(`${nextProduct.name} məhsul məlumatları yeniləndi.`);
  }

  function saveFinanceAccount(accountId, values) {
    if (!requirePermission("finance.manage", "kassa və bank hesabını idarə etmək")) return;

    const name = String(values.name || "").trim();
    const code = String(values.code || "").trim().toUpperCase();
    if (!name || !code) {
      notify("Hesab adı və kodu daxil edin.", "warning");
      return;
    }
    const existing = (state.financeAccounts || []).find((account) => account.id === accountId);
    if ((state.financeAccounts || []).some((account) => account.id !== accountId && normalize(account.code) === normalize(code))) {
      notify("Bu hesab kodu artıq istifadə olunur.", "warning");
      return;
    }

    const account = {
      id: accountId || `ACC-${Date.now()}`,
      name,
      code,
      type: values.type || "Kassa",
      currency: values.currency || "AZN",
      openingBalance: Math.max(0, Number(values.openingBalance || 0)),
      status: values.status || "Aktiv",
      updatedAt: new Date().toISOString(),
    };
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          financeAccounts: existing
            ? current.financeAccounts.map((item) => (item.id === account.id ? account : item))
            : [account, ...(current.financeAccounts || [])],
        },
        {
          module: "Maliyyə",
          action: existing ? "Maliyyə hesabı redaktə edildi" : "Maliyyə hesabı yaradıldı",
          detail: `${account.code} · ${account.name} · ${money(account.openingBalance)}`,
        },
      ),
    );
    setModal(null);
    notify(`${account.name} hesabı yadda saxlanıldı.`);
  }

  function deleteWarehouse(id) {
    if (!requirePermission("warehouse.manage", "anbarı silmək")) return;

    const remaining = state.warehouses.filter((warehouse) => warehouse.id !== id);
    setState((current) => {
      const nextWarehouseStock = { ...current.warehouseStock };
      delete nextWarehouseStock[id];
      return {
        ...current,
        warehouses: current.warehouses.filter((warehouse) => warehouse.id !== id),
        warehouseStock: nextWarehouseStock,
      };
    });
    if (selectedWarehouseId === id) {
      setSelectedWarehouseId(remaining[0]?.id || "all");
    }
    notify("Anbar silindi.");
    auditOperation({
      module: "Anbar",
      action: "Anbar silindi",
      detail: id,
    });
  }

  function advanceOrder(id) {
    if (!requirePermission("delivery.complete", "təhvil mərhələsini dəyişmək")) return;

    setState((current) => ({
      ...current,
      orders: current.orders.map((order) => {
        if (order.id !== id) return order;
        const index = stages.indexOf(order.status);
        if (index < 0 || index === stages.length - 1) return order;
        return { ...order, status: stages[index + 1] };
      }),
    }));
    notify(`${id} növbəti mərhələyə keçirildi.`);
    auditOperation({
      module: "Təhvil",
      action: "Sifariş mərhələsi dəyişdi",
      detail: id,
    });
  }

  function completeWarehouseDelivery(orderId) {
    if (!requirePermission("delivery.complete", "təhvili tamamlamaq")) return;

    const targetOrder = state.orders.find((order) => order.id === orderId);

    if (
      !targetOrder ||
      targetOrder.status === "Təhvil verilib" ||
      !Array.isArray(targetOrder.productLines) ||
      targetOrder.productLines.length === 0
    ) {
      notify("Bu sifariş üçün təhvil əməliyyatı aparıla bilmədi.", "warning");
      return;
    }

    setState((current) => {
      const order = current.orders.find((item) => item.id === orderId);
      if (!order || order.status === "Təhvil verilib" || !Array.isArray(order.productLines)) {
        return current;
      }

      const warehouseId = order.warehouseId || current.warehouses?.[0]?.id;
      const quantities = buildQuantityMap(order.productLines);
      const nextWarehouseStock =
        warehouseId && current.warehouseStock?.[warehouseId]
          ? {
              ...current.warehouseStock,
              [warehouseId]: updateSerialStatuses(
                adjustStockRows(current.warehouseStock[warehouseId], quantities, {
                  totalDelta: -1,
                  reservedDelta: -1,
                }),
                order.productLines,
                "Satılıb",
                orderId,
              ),
            }
          : current.warehouseStock;

      return {
        ...current,
        warehouseStock: nextWarehouseStock,
        stock: adjustStockRows(current.stock, quantities, {
          totalDelta: -1,
          reservedDelta: -1,
        }),
        orders: current.orders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status: "Təhvil verilib",
                deliveryStatus: "Təhvil verildi",
                deliveredAt: formatPaymentDate(parsePaymentDate(baseDeliveryDate)),
              }
            : item,
        ),
      };
    });

    notify(`${orderId} təhvil verildi və məhsul anbardan çıxıldı.`, "success");
    auditOperation({
      module: "Təhvil/Anbar",
      action: "Təhvil tamamlandı",
      detail: `${orderId} anbardan çıxıldı`,
    });
  }

  function transferWarehouseStock({ fromWarehouseId, toWarehouseId, product, qty }) {
    if (!requirePermission("warehouse.manage", "anbar transferi etmək")) return;

    const amount = Math.max(1, Math.round(Number(qty || 0)));
    const fromRows = state.warehouseStock[fromWarehouseId] || [];
    const sourceItem = fromRows.find((item) => item.product === product);
    const available = sourceItem ? getAvailableQuantity(sourceItem) : 0;

    if (!sourceItem || !toWarehouseId || fromWarehouseId === toWarehouseId || available < amount) {
      notify("Transfer üçün kifayət qədər satış qalığı yoxdur.", "warning");
      return;
    }

    setState((current) => {
      const sourceRows = current.warehouseStock[fromWarehouseId] || [];
      const targetRows = current.warehouseStock[toWarehouseId] || [];
      const latestSource = sourceRows.find((item) => item.product === product);
      const latestAvailable = latestSource ? getAvailableQuantity(latestSource) : 0;

      if (!latestSource || latestAvailable < amount) return current;

      const nextSourceRows = sourceRows.map((item) =>
        item.product === product ? { ...item, total: Math.max(item.reserved, Number(item.total || 0) - amount) } : item,
      );
      const targetHasProduct = targetRows.some((item) => item.product === product);
      const nextTargetRows = targetHasProduct
        ? targetRows.map((item) =>
            item.product === product ? { ...item, total: Number(item.total || 0) + amount } : item,
          )
        : [
            ...targetRows,
            {
              product,
              total: amount,
              reserved: 0,
              price: Number(latestSource.price || 0),
            },
          ];

      return {
        ...current,
        warehouseStock: {
          ...current.warehouseStock,
          [fromWarehouseId]: nextSourceRows,
          [toWarehouseId]: nextTargetRows,
        },
      };
    });

    const sourceName = state.warehouses.find((warehouse) => warehouse.id === fromWarehouseId)?.name || fromWarehouseId;
    const targetName = state.warehouses.find((warehouse) => warehouse.id === toWarehouseId)?.name || toWarehouseId;
    notify(`${product}: ${amount} ədəd ${sourceName} → ${targetName} transfer edildi.`, "success");
    auditOperation({
      module: "Anbar",
      action: "Stok transfer edildi",
      detail: `${product}: ${amount} ədəd ${sourceName} → ${targetName}`,
    });
  }

  function setExpenseStatus(id, status) {
    if (!requirePermission("finance.manage", "xərc statusunu dəyişmək")) return;

    setState((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === id ? { ...expense, status } : expense,
      ),
    }));
    notify(`Xərc əməliyyatı: ${status}.`);
    auditOperation({
      module: "Maliyyə",
      action: "Xərc statusu dəyişdi",
      detail: `${id}: ${status}`,
    });
  }

  function getSalesOrderLinkedCredit(snapshot, order) {
    if (!order) return null;
    return (snapshot.credits || []).find(
      (credit) => credit.orderId === order.id || credit.id === order.creditId || credit.id === getCreditIdForOrder(order),
    );
  }

  function openSalesOrderEditor(orderId) {
    if (!requirePermission("sales.create", "satış əməliyyatını redaktə etmək")) return;
    setModal({ type: "salesOperation", orderId });
  }

  function openSalesOrderDelete(orderId) {
    if (!requirePermission("sales.create", "satış əməliyyatını silmək")) return;
    setModal({ type: "salesOperationDelete", orderId });
  }

  function validateSalesOrderEdit(order, values) {
    const nextProductLines = normalizeOrderProductLines(values.productLines);
    const nextWarehouseId = values.warehouseId || order.warehouseId || state.warehouses?.[0]?.id;
    const oldWarehouseId = order.warehouseId || state.warehouses?.[0]?.id;
    const nextStatus = values.status || order.status;
    const delivered = order.status === "Təhvil verilib";
    const productOrWarehouseChanged =
      nextWarehouseId !== oldWarehouseId ||
      productLineSignature(nextProductLines) !== productLineSignature(order.productLines || []);

    if (nextProductLines.length === 0) {
      notify("Satış əməliyyatında ən azı bir məhsul sətri olmalıdır.", "warning");
      return false;
    }
    if (Number(values.amount ?? calculateOrderLineTotal(nextProductLines)) <= 0) {
      notify("Satış məbləği 0-dan böyük olmalıdır.", "warning");
      return false;
    }
    if (delivered && productOrWarehouseChanged) {
      notify("Təhvil verilmiş satışda məhsul və anbar dəyişmək üçün geri qaytarma əməliyyatı lazımdır.", "warning");
      return false;
    }
    if (delivered && nextStatus !== "Təhvil verilib") {
      notify("Təhvil verilmiş satışı əvvəlki mərhələyə qaytarmaq üçün ayrıca geri qaytarma axını lazımdır.", "warning");
      return false;
    }
    if (!delivered && nextStatus === "Təhvil verilib") {
      notify("Məhsulu anbardan çıxarmaq üçün Təhvil modulundakı tamamla əməliyyatından istifadə edin.", "warning");
      return false;
    }
    if (!productOrWarehouseChanged) return true;

    const warehouseRows = state.warehouseStock?.[nextWarehouseId] || [];
    const oldQuantities =
      oldWarehouseId === nextWarehouseId ? buildQuantityMap(order.productLines || []) : new Map();
    const nextQuantities = buildQuantityMap(nextProductLines);
    const insufficient = [...nextQuantities.entries()].find(([product, qty]) => {
      const stockItem = warehouseRows.find((item) => item.product === product);
      const currentOrderReservation = oldQuantities.get(product) || 0;
      return !stockItem || getAvailableQuantity(stockItem) + currentOrderReservation < qty;
    });

    if (insufficient) {
      notify(`${insufficient[0]} üçün seçilən anbarda kifayət qədər satış qalığı yoxdur.`, "warning");
      return false;
    }
    return true;
  }

  function updateSalesOrder(orderId, values) {
    if (!requirePermission("sales.create", "satış əməliyyatını redaktə etmək")) return;
    const existingOrder = state.orders.find((order) => order.id === orderId);
    if (!existingOrder) {
      notify("Satış əməliyyatı tapılmadı.", "warning");
      return;
    }
    if (!validateSalesOrderEdit(existingOrder, values)) return;

    setState((current) => {
      const order = current.orders.find((item) => item.id === orderId);
      if (!order) return current;

      const productLines = normalizeOrderProductLines(values.productLines);
      const sellerBonuses = buildSellerBonusRows(values.sellers);
      const sellerSummary = summarizeSellerBonusRows(sellerBonuses) || order.seller || "Təyin edilməyib";
      const oldWarehouseId = order.warehouseId || current.warehouses?.[0]?.id;
      const nextWarehouseId = values.warehouseId || oldWarehouseId;
      const warehouseName =
        current.warehouses.find((warehouse) => warehouse.id === nextWarehouseId)?.name ||
        order.warehouseName ||
        "Baş Anbar";
      const amount = Math.max(0, Number(values.amount ?? calculateOrderLineTotal(productLines)));
      const paymentMethod = values.paymentMethod || order.paymentMethod || "Nağd";
      const isCreditSale = paymentMethod === "Kredit";
      const creditPlan = isCreditSale
        ? buildCreditPlan({
            total: amount,
            initialPayment: Math.min(amount, Math.max(0, Number(values.initialPayment ?? order.initialPayment ?? order.paid ?? 0))),
            months: values.creditMonths || order.creditMonths || 12,
          })
        : null;
      const paid = isCreditSale
        ? creditPlan.initialPayment
        : Math.min(amount, Math.max(0, Number(values.paid ?? order.paid ?? amount)));
      const paymentStatus = isCreditSale ? "Kredit satış" : paid >= amount ? "Ödənilib" : paid > 0 ? "Qalıqlı" : "Ödəniş gözləyir";
      const linkedCredit = getSalesOrderLinkedCredit(current, order);
      const creditId = isCreditSale ? order.creditId || linkedCredit?.id || getCreditIdForOrder(order) : null;
      const contractId = isCreditSale ? order.contractId || linkedCredit?.contractId || `MQ-${currentBusinessDate.slice(0, 4)}-${Date.now()}` : null;
      const delivered = order.status === "Təhvil verilib";
      const productOrWarehouseChanged =
        nextWarehouseId !== oldWarehouseId ||
        productLineSignature(productLines) !== productLineSignature(order.productLines || []);

      let warehouseStock = current.warehouseStock;
      let stock = current.stock;
      if (!delivered && productOrWarehouseChanged) {
        const oldQuantities = buildQuantityMap(order.productLines || []);
        const nextQuantities = buildQuantityMap(productLines);
        warehouseStock = { ...(current.warehouseStock || {}) };

        if (oldWarehouseId && warehouseStock[oldWarehouseId]) {
          warehouseStock[oldWarehouseId] = releaseOrderSerialReservations(
            adjustStockRows(warehouseStock[oldWarehouseId], oldQuantities, { reservedDelta: -1 }),
            order.productLines || [],
            order.id,
          );
        }
        if (nextWarehouseId && warehouseStock[nextWarehouseId]) {
          warehouseStock[nextWarehouseId] = updateSerialStatuses(
            adjustStockRows(warehouseStock[nextWarehouseId], nextQuantities, { reservedDelta: 1 }),
            productLines,
            "Rezervdə",
            order.id,
          );
        }
        stock = adjustStockRows(
          adjustStockRows(current.stock, oldQuantities, { reservedDelta: -1 }),
          nextQuantities,
          { reservedDelta: 1 },
        );
      }

      const nextOrder = {
        ...order,
        customer: values.customer || order.customer,
        fin: values.fin || order.fin,
        productLines,
        products: productLines.map((line) => `${line.product}${line.qty > 1 ? ` x${line.qty}` : ""}`).join(", "),
        seller: sellerSummary,
        sellerBonuses,
        amount,
        paid,
        status: values.status || order.status,
        date: values.date || order.date || currentBusinessDate,
        address: values.address || order.address || "Qeyd edilməyib",
        warehouseId: nextWarehouseId,
        warehouseName,
        paymentMethod,
        paymentStatus,
        creditId,
        contractId,
        creditMonths: creditPlan?.months || null,
        initialPayment: creditPlan?.initialPayment || 0,
        creditBalance: creditPlan?.balance || 0,
        creditMonthly: creditPlan?.monthly || 0,
        creditLastPayment: creditPlan?.lastPayment || 0,
        note: values.note || "",
        bonusTotal: Number(values.bonusTotal ?? (paid * sellerBonuses.reduce((sum, item) => sum + Number(item.bonus || 0), 0)) / 100),
      };

      const nextCredits = isCreditSale
        ? (() => {
            const creditRecord = buildSalesCreditForOrder(nextOrder, linkedCredit);
            const exists = (current.credits || []).some((credit) => credit.id === creditRecord.id || credit.orderId === order.id);
            return exists
              ? current.credits.map((credit) => (credit.id === creditRecord.id || credit.orderId === order.id ? creditRecord : credit))
              : [creditRecord, ...(current.credits || [])];
          })()
        : (current.credits || []).filter((credit) => credit.orderId !== order.id && credit.id !== order.creditId);

      const nextContracts = isCreditSale
        ? (() => {
            const contractRecord = {
              id: contractId,
              customer: nextOrder.customer,
              fin: nextOrder.fin,
              product: summarizeOrderProducts(nextOrder),
              amount,
              status: current.contracts.find((contract) => contract.id === contractId)?.status || "Hazırlanır",
              orderId: order.id,
            };
            const exists = current.contracts.some((contract) => contract.id === contractId || contract.orderId === order.id);
            return exists
              ? current.contracts.map((contract) => (contract.id === contractId || contract.orderId === order.id ? contractRecord : contract))
              : [contractRecord, ...current.contracts];
          })()
        : current.contracts.filter((contract) => contract.orderId !== order.id && contract.id !== order.contractId);

      return auditCurrentState(
        {
          ...current,
          stock,
          warehouseStock,
          orders: current.orders.map((item) => (item.id === order.id ? nextOrder : item)),
          credits: nextCredits,
          contracts: nextContracts,
        },
        {
          module: "Satış",
          action: "Satış əməliyyatı redaktə edildi",
          detail: `${order.id} · ${nextOrder.customer} · ${money(amount)}`,
        },
      );
    });
    setModal(null);
    notify(`${orderId} satış əməliyyatı yeniləndi.`);
  }

  function deleteSalesOrder(orderId) {
    if (!requirePermission("sales.create", "satış əməliyyatını silmək")) return;
    const targetOrder = state.orders.find((order) => order.id === orderId);
    if (!targetOrder) {
      notify("Satış əməliyyatı tapılmadı.", "warning");
      return;
    }

    setState((current) => {
      const order = current.orders.find((item) => item.id === orderId);
      if (!order) return current;

      const linkedCredit = getSalesOrderLinkedCredit(current, order);
      const linkedCreditIds = new Set([order.creditId, linkedCredit?.id, getCreditIdForOrder(order)].filter(Boolean));
      const delivered = order.status === "Təhvil verilib";
      let warehouseStock = current.warehouseStock;
      let stock = current.stock;

      if (!delivered && Array.isArray(order.productLines) && order.productLines.length > 0) {
        const quantities = buildQuantityMap(order.productLines);
        const warehouseId = order.warehouseId || current.warehouses?.[0]?.id;
        warehouseStock = { ...(current.warehouseStock || {}) };
        if (warehouseId && warehouseStock[warehouseId]) {
          warehouseStock[warehouseId] = releaseOrderSerialReservations(
            adjustStockRows(warehouseStock[warehouseId], quantities, { reservedDelta: -1 }),
            order.productLines,
            order.id,
          );
        }
        stock = adjustStockRows(current.stock, quantities, { reservedDelta: -1 });
      }

      return auditCurrentState(
        {
          ...current,
          stock,
          warehouseStock,
          orders: current.orders.filter((item) => item.id !== order.id),
          credits: (current.credits || []).filter(
            (credit) => credit.orderId !== order.id && !linkedCreditIds.has(credit.id),
          ),
          contracts: current.contracts.filter((contract) => contract.orderId !== order.id && contract.id !== order.contractId),
          cashEntries: (current.cashEntries || []).filter((entry) => !linkedCreditIds.has(entry.creditId)),
        },
        {
          module: "Satış",
          action: "Satış əməliyyatı silindi",
          detail: `${order.id} · ${order.customer} · ${delivered ? "təhvil verilmiş satış" : "rezerv açıldı"}`,
        },
      );
    });
    setModal(null);
    notify(`${orderId} satış əməliyyatı silindi.`);
  }

  function openExpenseEditor(expenseId) {
    if (!requirePermission("finance.manage", "xərc əməliyyatını redaktə etmək")) return;
    setModal({ type: "expenseOperation", expenseId });
  }

  function openExpenseDelete(expenseId) {
    if (!requirePermission("finance.manage", "xərc əməliyyatını silmək")) return;
    setModal({ type: "expenseOperationDelete", expenseId });
  }

  function updateExpense(expenseId, values) {
    if (!requirePermission("finance.manage", "xərc əməliyyatını redaktə etmək")) return;
    const amount = Math.max(0, Number(values.amount || 0));
    if (!values.description || !values.category || amount <= 0) {
      notify("Xərc üçün təsvir, kateqoriya və düzgün məbləğ daxil edin.", "warning");
      return;
    }

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          expenses: current.expenses.map((expense) =>
            expense.id === expenseId
              ? {
                  ...expense,
                  description: values.description,
                  category: values.category,
                  date: values.date || expense.date || currentBusinessDate,
                  amount,
                  status: values.status || expense.status,
                  note: values.note || expense.note || "",
                }
              : expense,
          ),
        },
        {
          module: "Maliyyə",
          action: "Xərc əməliyyatı redaktə edildi",
          detail: `${expenseId} · ${values.description} · ${money(amount)}`,
        },
      ),
    );
    setModal(null);
    notify(`${expenseId} xərc əməliyyatı yeniləndi.`);
  }

  function deleteExpense(expenseId) {
    if (!requirePermission("finance.manage", "xərc əməliyyatını silmək")) return;
    const targetExpense = state.expenses.find((expense) => expense.id === expenseId);
    if (!targetExpense) {
      notify("Xərc əməliyyatı tapılmadı.", "warning");
      return;
    }

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          expenses: current.expenses.filter((expense) => expense.id !== expenseId),
        },
        {
          module: "Maliyyə",
          action: "Xərc əməliyyatı silindi",
          detail: `${expenseId} · ${targetExpense.description} · ${money(targetExpense.amount)}`,
        },
      ),
    );
    setModal(null);
    notify(`${expenseId} xərc əməliyyatı silindi.`);
  }

  function updateEmployeeStructure(employeeName, values) {
    if (!requirePermission("hr.manage", "HR strukturunu dəyişmək")) return;

    setState((current) => {
      const manager = current.employees.find((employee) => employee.name === values.managerName && employee.name !== employeeName);
      return {
        ...current,
        employees: current.employees.map((employee) =>
          employee.name === employeeName
            ? {
                ...employee,
                department: values.department,
                departmentParent: values.departmentParent || "",
                position: values.position,
                managerId: manager ? getEmployeeKey(manager) : "",
                managerName: manager?.name || "",
                level: values.level,
              }
            : employee,
        ),
      };
    });
    notify(`${employeeName} struktur ağacında yeniləndi.`);
    auditOperation({
      module: "HR",
      action: "Struktur yeniləndi",
      detail: employeeName,
    });
  }

  function openEmployeeEditor(employee) {
    if (!requirePermission("hr.manage", "əməkdaş məlumatlarını redaktə etmək")) return;
    setModal({ type: "hr", mode: "edit", employeeId: getEmployeeKey(employee) });
  }

  function updateEmployee(employeeId, values) {
    if (!requirePermission("hr.manage", "əməkdaş məlumatlarını redaktə etmək")) return;

    setState((current) => {
      const existing = current.employees.find((employee) => getEmployeeKey(employee) === employeeId);
      if (!existing) return current;

      const nextName = String(values.name || "").trim();
      const manager = current.employees.find(
        (employee) => getEmployeeKey(employee) === values.managerId && getEmployeeKey(employee) !== employeeId,
      );
      const documentsComplete = Math.max(0, Math.min(100, Number(values.documentsComplete ?? 100)));
      const hrStatus = values.hrStatus === "Məlumat gözləyir" ? "Məlumat gözləyir" : "Stabil";
      const updatedEmployee = {
        ...existing,
        initials: nextName
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toLocaleUpperCase("az-AZ"),
        name: nextName,
        position: values.position,
        department: values.department,
        departmentParent: values.departmentParent || "",
        managerId: manager ? getEmployeeKey(manager) : "",
        managerName: manager?.name || "",
        level: values.level || "Komanda üzvü",
        salary: Number(values.salary || 0),
        kpi: Number(values.kpi || 0),
        hireDate: values.hireDate || "",
        workMode: values.workMode || "Ofis",
        shift: values.shift || "09:00-18:00",
        employmentType: values.employmentType || "Tam ştat",
        leaveBalance: Math.max(0, Number(values.leaveBalance || 0)),
        documentsComplete,
        hrStatus,
        documentReviewRequired: hrStatus === "Məlumat gözləyir" || documentsComplete < 100,
        skills: String(values.skills || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const previousDepartment = String(existing.department || "").trim();
      const shouldPreservePreviousDepartment =
        previousDepartment &&
        normalize(previousDepartment) !== normalize(updatedEmployee.department) &&
        !current.employees.some(
          (employee) => getEmployeeKey(employee) !== employeeId && normalize(employee.department) === normalize(previousDepartment),
        ) &&
        !(current.departments || []).some((department) => normalize(department.name) === normalize(previousDepartment));
      const preservedDepartments = shouldPreservePreviousDepartment
        ? [
            {
              id: `DEP-${Date.now()}`,
              name: previousDepartment,
              parentDepartment: getDepartmentParentName(existing),
              description: "",
              status: "Aktiv",
              createdAt: getActionStamp(),
            },
            ...(current.departments || []),
          ]
        : current.departments || [];

      return auditCurrentState(
        {
          ...current,
          departments: preservedDepartments,
          employees: current.employees.map((employee) => {
            if (getEmployeeKey(employee) === employeeId) return updatedEmployee;
            if (employee.managerId === employeeId || (!employee.managerId && employee.managerName === existing.name)) {
              return { ...employee, managerId: employeeId, managerName: nextName };
            }
            return employee;
          }),
        },
        {
          module: "HR",
          action: "Əməkdaş redaktə edildi",
          detail: `${existing.name} → ${nextName}`,
        },
      );
    });
    setModal(null);
    notify(`${values.name} əməkdaş məlumatları yeniləndi.`);
  }

  function openDepartmentCreator() {
    if (!requirePermission("hr.manage", "şöbə əlavə etmək")) return;
    setModal({ type: "department" });
  }

  function createDepartment(values) {
    if (!requirePermission("hr.manage", "şöbə əlavə etmək")) return;

    const name = String(values.name || "").trim();
    const parentDepartment = String(values.parentDepartment || "").trim();
    if (!name) {
      notify("Şöbə adı daxil edin.", "warning");
      return;
    }
    if (normalize(name) === normalize(parentDepartment)) {
      notify("Şöbə özünə tabe ola bilməz.", "warning");
      return;
    }
    const exists = [...state.departments, ...state.employees.map((employee) => ({ name: employee.department }))].some(
      (department) => normalize(department.name) === normalize(name),
    );
    if (exists) {
      notify("Bu adlı şöbə artıq mövcuddur.", "warning");
      return;
    }

    const department = {
      id: `DEP-${Date.now()}`,
      name,
      parentDepartment,
      description: String(values.description || "").trim(),
      status: values.status || "Aktiv",
      createdAt: getActionStamp(),
    };
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          departments: [department, ...(current.departments || [])],
        },
        {
          module: "HR",
          action: "Şöbə əlavə edildi",
          detail: parentDepartment ? `${name} → ${parentDepartment}` : name,
        },
      ),
    );
    setModal(null);
    notify(`${name} şöbəsi əlavə edildi.`);
  }

  function openLeaveRequestCreator() {
    if (!requirePermission("hr.manage", "məzuniyyət qeydi yaratmaq")) return;
    setModal({ type: "leaveRequest" });
  }

  function createLeaveRequest(values) {
    if (!requirePermission("hr.manage", "məzuniyyət qeydi yaratmaq")) return;

    const employee = state.employees.find((item) => getEmployeeKey(item) === values.employeeId);
    const from = parsePaymentDate(values.from);
    const to = parsePaymentDate(values.to);
    if (!employee || !from || !to || to < from) {
      notify("Əməkdaş və düzgün məzuniyyət tarixlərini seçin.", "warning");
      return;
    }
    const days = Math.floor((to.getTime() - from.getTime()) / dayInMs) + 1;
    const request = {
      id: `LEAVE-${Date.now()}`,
      employeeId: getEmployeeKey(employee),
      employeeName: employee.name,
      department: employee.department,
      type: values.type || "İllik məzuniyyət",
      from: values.from,
      to: values.to,
      days,
      approver: getEmployeeManagerName(employee, state.employees) || "HR",
      status: "Təsdiq gözləyir",
      createdAt: getActionStamp(),
    };
    setState((current) =>
      auditCurrentState(
        { ...current, leaveRequests: [request, ...(current.leaveRequests || [])] },
        { module: "HR", action: "Məzuniyyət qeydi yaradıldı", detail: `${employee.name} · ${days} gün` },
      ),
    );
    setModal(null);
    notify(`${employee.name} üçün məzuniyyət qeydi yaradıldı.`);
  }

  function openVacancyCreator() {
    if (!requirePermission("hr.manage", "vakansiya yaratmaq")) return;
    setModal({ type: "vacancy" });
  }

  function createVacancy(values) {
    if (!requirePermission("hr.manage", "vakansiya yaratmaq")) return;

    const role = String(values.role || "").trim();
    const department = String(values.department || "").trim();
    if (!role || !department) {
      notify("Vakansiya üçün rol və şöbə seçin.", "warning");
      return;
    }
    const vacancy = {
      id: `VAC-${Date.now()}`,
      role,
      department,
      candidates: 0,
      stage: "Namizəd gözlənilir",
      owner: values.owner || "HR",
      targetDate: values.targetDate || "",
      status: "Aktiv vakansiya",
      createdAt: getActionStamp(),
    };
    setState((current) =>
      auditCurrentState(
        { ...current, vacancies: [vacancy, ...(current.vacancies || [])] },
        { module: "HR", action: "Vakansiya yaradıldı", detail: `${role} · ${department}` },
      ),
    );
    setModal(null);
    notify(`${role} vakansiyası yaradıldı.`);
  }

  function openEmployeeDelete(employee) {
    if (!requirePermission("hr.manage", "əməkdaş silmək")) return;
    setModal({ type: "employeeDelete", employeeId: getEmployeeKey(employee) });
  }

  function deleteEmployee(employeeId, replacementManagerId = "") {
    if (!requirePermission("hr.manage", "əməkdaş silmək")) return;

    setState((current) => {
      const employee = current.employees.find((item) => getEmployeeKey(item) === employeeId);
      if (!employee) return current;

      const directReports = current.employees.filter(
        (item) => item.managerId === employeeId || (!item.managerId && item.managerName === employee.name),
      );
      const directReportKeys = new Set(directReports.map((item) => getEmployeeKey(item)));
      const replacement = current.employees.find(
        (item) =>
          getEmployeeKey(item) === replacementManagerId &&
          getEmployeeKey(item) !== employeeId &&
          !directReportKeys.has(getEmployeeKey(item)),
      );
      const remainingEmployees = current.employees.filter((item) => getEmployeeKey(item) !== employeeId);
      const employeeDepartment = String(employee.department || "").trim();
      const shouldPreserveDepartment =
        employeeDepartment &&
        !remainingEmployees.some((item) => normalize(item.department) === normalize(employeeDepartment)) &&
        !(current.departments || []).some((department) => normalize(department.name) === normalize(employeeDepartment));
      const preservedDepartments = shouldPreserveDepartment
        ? [
            {
              id: `DEP-${Date.now()}`,
              name: employeeDepartment,
              parentDepartment: getDepartmentParentName(employee),
              description: "",
              status: "Aktiv",
              createdAt: getActionStamp(),
            },
            ...(current.departments || []),
          ]
        : current.departments || [];

      return auditCurrentState(
        {
          ...current,
          departments: preservedDepartments,
          employees: remainingEmployees
            .map((item) =>
              item.managerId === employeeId || (!item.managerId && item.managerName === employee.name)
                ? {
                    ...item,
                    managerId: replacement ? getEmployeeKey(replacement) : "",
                    managerName: replacement?.name || "",
                  }
                : item,
            ),
        },
        {
          module: "HR",
          action: "Əməkdaş silindi",
          detail: `${employee.name} · ${directReports.length} tabe əməkdaş yenidən təyin edildi`,
        },
      );
    });
    setModal(null);
    notify("Əməkdaş silindi və tabeçilik xətti yeniləndi.");
  }

  function sendCreditSms(id) {
    if (!requirePermission("credits.manage", "kredit SMS göndərmək")) return;

    setState((current) => ({
      ...current,
      notifications: [
        {
          id: Date.now(),
          type: "SMS",
          title: "Kredit ödənişi xatırlatması göndərildi",
          body: `${id} üzrə SMS müştəriyə göndərildi.`,
          time: "indi",
          unread: true,
        },
        ...current.notifications,
      ],
    }));
    notify("SMS xatırlatma göndərildi.");
    auditOperation({
      module: "Kredit",
      action: "SMS xatırlatma göndərildi",
      detail: id,
    });
  }

  function updateCreditPaymentDate(creditId, month, due) {
    if (!requirePermission("credits.manage", "kredit ödəniş tarixini dəyişmək")) return;

    const targetCredit = buildAllCreditRecords(state.orders, state.credits).find((credit) => credit.id === creditId);

    if (!targetCredit) {
      notify("Kredit tapılmadı.", "warning");
      return;
    }

    setState((current) => ({
      ...current,
      credits: (() => {
        const exists = current.credits.some((credit) => credit.id === creditId);
        const source = exists ? null : targetCredit;
        const nextCredits = exists ? current.credits : [source, ...current.credits];

        return nextCredits.map((credit) => {
          if (credit.id !== creditId) return credit;

          const plan = getCreditDisplayPlan(credit);
          const installments = plan.installments.map((installment) =>
            installment.month === month ? { ...installment, due } : installment,
          );
          const nextIndex = Math.min(Number(credit.paidMonths || 0), Math.max(0, installments.length - 1));

          return {
            ...credit,
            installments,
            next: installments[nextIndex]?.due || credit.next,
          };
        });
      })(),
    }));
    notify("Ödəniş tarixi yeniləndi.");
    auditOperation({
      module: "Kredit",
      action: "Ödəniş tarixi redaktə edildi",
      detail: `${creditId} · ${month}. ay · ${due}`,
    });
  }

  function receiveCreditPayment(creditId, values) {
    if (!requirePermission("credits.manage", "kredit ödənişi qəbul etmək")) return;

    const principalAmount = Math.max(0, Math.round(Number(values.principalAmount || 0)));
    const penaltyAmount = Math.max(0, Math.round(Number(values.penaltyAmount || 0)));
    const targetCredit = buildAllCreditRecords(state.orders, state.credits).find((credit) => credit.id === creditId);

    if (principalAmount <= 0 && penaltyAmount <= 0) {
      notify("Ödəniş məbləği daxil edin.", "warning");
      return;
    }

    if (!targetCredit) {
      notify("Kredit tapılmadı.", "warning");
      return;
    }

    const paymentResult = applyCreditPrincipalPayment(targetCredit, principalAmount);
    const cashAmount = paymentResult.appliedPrincipal + penaltyAmount;
    const cashEntry = {
      id: `KS-${Date.now()}`,
      source: "Kredit ödənişi",
      creditId,
      orderId: targetCredit.orderId,
      customer: targetCredit.customer,
      contractId: targetCredit.contractId,
      device: targetCredit.device || targetCredit.product,
      principal: paymentResult.appliedPrincipal,
      penalty: penaltyAmount,
      amount: cashAmount,
      date: baseCreditDate,
      note: values.note || "",
    };

    setState((current) => {
      return {
        ...current,
        cashEntries: [cashEntry, ...(current.cashEntries || [])],
        orders: current.orders.map((order) => {
          const isLinkedOrder = targetCredit.orderId
            ? order.id === targetCredit.orderId
            : order.creditId === creditId || getCreditIdForOrder(order) === creditId;

          if (!isLinkedOrder) return order;

          const nextPaid = Math.min(
            Number(order.amount || 0),
            Number(order.paid || 0) + paymentResult.appliedPrincipal,
          );

          return {
            ...order,
            paid: nextPaid,
            creditBalance: paymentResult.nextBalance,
            creditMonthly: paymentResult.nextMonthly,
            creditLastPayment: paymentResult.installments[paymentResult.installments.length - 1]?.amount || 0,
            paymentStatus: paymentResult.nextBalance <= 0 ? "Ödənilib" : "Kredit satış",
          };
        }),
        credits: (() => {
          const exists = current.credits.some((credit) => credit.id === creditId);
          const source = exists ? null : targetCredit;
          const nextCredits = exists ? current.credits : [source, ...current.credits];

          return nextCredits.map((item) =>
            item.id === creditId
              ? {
                ...item,
                balance: paymentResult.nextBalance,
                installments: paymentResult.installments,
                paidMonths: paymentResult.nextPaidMonths,
                rate: Math.round((paymentResult.nextPaidMonths / Math.max(1, Number(item.months || 12))) * 100),
                monthly: paymentResult.nextMonthly,
                next: paymentResult.nextDue,
                status: paymentResult.status,
                payments: [
                  {
                    date: baseCreditDate,
                    principal: paymentResult.appliedPrincipal,
                    penalty: penaltyAmount,
                    cashIn: cashAmount,
                    extraApplied: paymentResult.extraPrincipal,
                  },
                  ...(item.payments || []),
                ],
              }
              : item,
          );
        })(),
      };
    });

    notify(
      `${targetCredit.id}: ${money(cashAmount)} kassaya daxil oldu. Əsas borc ${money(paymentResult.appliedPrincipal)} azaldı.`,
    );
    auditOperation({
      module: "Kredit/Maliyyə",
      action: "Kredit ödənişi qəbul edildi",
      detail: `${creditId}: əsas ${money(paymentResult.appliedPrincipal)}, gecikmə ${money(penaltyAmount)}`,
    });
  }

  function createPurchaseOrder(row) {
    if (!requirePermission("vendors.po", "PO yaratmaq")) return;

    const qty = Math.max(1, Math.round(Number(row.recommendedQty || 0)));
    const warehouse = state.warehouses[0];

    if (!warehouse || !row.product) {
      notify("PO yaratmaq üçün məhsul və anbar məlumatı lazımdır.", "warning");
      return;
    }

    const po = {
      id: `PO-${Date.now()}`,
      product: row.product,
      vendor: row.vendor,
      qty,
      price: Number(row.price || 0),
      amount: Number(row.estimatedCost || Math.round(qty * Number(row.price || 0) * 0.76)),
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      status: "Təsdiq gözləyir",
      date: baseFinanceDate,
    };

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          purchaseOrders: [po, ...(current.purchaseOrders || [])],
        },
        {
          module: "Vendor",
          action: "PO yaradıldı",
          detail: `${po.product}: ${po.qty} ədəd · ${po.vendor}`,
        },
      ),
    );
    notify(`${po.id} yaradıldı və təsdiq gözləyir.`);
  }

  function approvePurchaseOrder(poId) {
    if (!requirePermission("vendors.po", "PO təsdiqləmək və anbara mədaxil etmək")) return;

    const targetPo = (state.purchaseOrders || []).find((item) => item.id === poId);

    if (!targetPo || targetPo.status === "Təsdiq edildi") {
      notify("PO təsdiqlənmədi.", "warning");
      return;
    }

    setState((current) => {
      const po = (current.purchaseOrders || []).find((item) => item.id === poId);
      if (!po || po.status === "Təsdiq edildi") return current;

      const warehouseId = po.warehouseId || current.warehouses[0]?.id;
      const warehouseName =
        current.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name || po.warehouseName || "Anbar";
      const nextPo = {
        ...po,
        warehouseId,
        warehouseName,
        status: "Təsdiq edildi",
        approvedAt: baseFinanceDate,
        receivedAt: baseFinanceDate,
      };
      const procurementExpense = {
        id: `EXP-${po.id}`,
        description: `PO alış - ${po.product}`,
        category: "Satınalma",
        date: baseFinanceDate,
        amount: Number(po.amount || 0),
        status: "Təsdiq gözləyir",
        source: "Vendor PO",
        poId: po.id,
      };
      const nextExpenses = current.expenses.some((expense) => expense.id === procurementExpense.id)
        ? current.expenses
        : [procurementExpense, ...current.expenses];
      const catalogProduct = (current.products || []).find((item) => normalize(item.name) === normalize(po.product));

      return auditCurrentState(
        {
          ...current,
          purchaseOrders: (current.purchaseOrders || []).map((item) => (item.id === poId ? nextPo : item)),
          warehouseStock: {
            ...current.warehouseStock,
            [warehouseId]: addStockToRows(
              current.warehouseStock?.[warehouseId] || [],
              po.product,
              po.qty,
              po.price,
              warehouseId,
              catalogProduct,
            ),
          },
          stock: addStockToRows(current.stock, po.product, po.qty, po.price, "", catalogProduct),
          expenses: nextExpenses,
        },
        {
          module: "Vendor/Anbar/Maliyyə",
          action: "PO təsdiqləndi və mədaxil edildi",
          detail: `${po.product}: ${po.qty} ədəd ${warehouseName} anbarına daxil oldu`,
        },
      );
    });

    notify(`${targetPo.id} təsdiqləndi və anbara mədaxil edildi.`, "success");
  }

  function markAllNotificationsRead() {
    const stamp = getActionStamp();
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          notificationSweepAt: stamp,
          notifications: current.notifications.map((item) => ({ ...item, unread: false })),
        },
        {
          module: "Bildiriş",
          action: "Hamısı oxundu",
          detail: `Son yoxlama: ${stamp}`,
        },
      ),
    );
    notify("Bütün bildirişlər oxunmuş işarələndi.");
  }

  function toggleSetting(key) {
    if (!requirePermission("settings.manage", "ayarları dəyişmək")) return;

    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        toggles: {
          ...current.settings.toggles,
          [key]: !current.settings.toggles[key],
        },
      },
    }));
    auditOperation({
      module: "Ayarlar",
      action: "Toggle dəyişdi",
      detail: key,
    });
  }

  function updateCompany(field, value) {
    if (!requirePermission("settings.manage", "şirkət məlumatlarını dəyişmək")) return;

    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
    auditOperation({
      module: "Ayarlar",
      action: "Şirkət məlumatı dəyişdi",
      detail: field,
    });
  }

  function saveSettings() {
    if (!requirePermission("settings.manage", "ayarları yadda saxlamaq")) return;

    notify("Sistem tənzimləmələri yadda saxlanıldı.");
    auditOperation({
      module: "Ayarlar",
      action: "Ayarlar yadda saxlandı",
      detail: "Şirkət və sistem tənzimləmələri",
    });
  }

  function runIntegrityCheck() {
    if (!requireSystemBackup("integrity yoxlaması")) return;

    const report = buildStateIntegrityReport(state, creditRecords);
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          integritySnapshot: report,
        },
        {
          module: "Sistem/DB",
          action: "Integrity yoxlaması",
          detail: `${report.issueCount} siqnal · score ${report.score}%`,
          status: report.status,
        },
      ),
    );
    notify(`Integrity yoxlandı: ${report.status}, score ${report.score}%.`);
  }

  function runGoLiveCheck() {
    if (!requireSystemBackup("go-live yoxlaması")) return;

    const report = buildGoLiveReadiness(state, integrityReport);
    setState((current) =>
      auditCurrentState(
        {
          ...current,
          goLiveSnapshot: report,
        },
        {
          module: "Sistem/Go-live",
          action: "Go-live readiness yoxlandı",
          detail: `${report.blockers} bloker · score ${report.score}%`,
          status: report.status,
        },
      ),
    );
    notify(`Go-live yoxlandı: ${report.status}, score ${report.score}%.`);
  }

  function exportBackup() {
    if (!requireSystemBackup("backup export")) return;

    const exportedAt = new Date().toISOString();
    const payload = {
      app: "ERP+CRM AZ",
      schemaVersion: localDbSchemaVersion,
      exportedAt,
      exportedBy: currentUser?.email || currentUser?.name || "System",
      state,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `erpaz-backup-${baseFinanceDate}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    const sizeKb = `${new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 1 }).format(blob.size / 1024)} KB`;

    setState((current) =>
      auditCurrentState(
        {
          ...current,
          dbMeta: {
            ...(current.dbMeta || {}),
            lastBackupAt: exportedAt,
            lastBackupBy: currentUser?.email || currentUser?.name || "System",
          },
        },
        {
          module: "Sistem/DB",
          action: "Backup export",
          detail: `Schema v${localDbSchemaVersion} · ${sizeKb}`,
        },
      ),
    );
    notify("Backup JSON faylı hazırlandı.");
  }

  function importBackup(file) {
    if (!requireSystemBackup("backup import")) return;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const incomingState = parsed.state || parsed;
        const hydrated = hydrateState(incomingState);
        const restoredCredits = buildAllCreditRecords(hydrated.orders || [], hydrated.credits || []);
        const report = buildStateIntegrityReport(hydrated, restoredCredits);
        const importedAt = new Date().toISOString();

        setState(
          appendAudit(
            {
              ...hydrated,
              integritySnapshot: report,
              dbMeta: {
                ...(hydrated.dbMeta || {}),
                provider:
                  hydrated.dbMeta?.provider && hydrated.dbMeta.provider !== "Local persistent DB"
                    ? hydrated.dbMeta.provider
                    : defaultDbProvider,
                runtime: hydrated.dbMeta?.runtime || "browser",
                version: localDbSchemaVersion,
                schemaVersion: localDbSchemaVersion,
                lastRestoreAt: importedAt,
                lastRestoreFile: file.name,
              },
            },
            {
              module: "Sistem/DB",
              action: "Backup import",
              detail: `${file.name} · ${report.issueCount} integrity siqnalı`,
              status: report.status,
              role: activeRoleInfo?.name || "System",
            },
          ),
        );
        notify(`Backup import edildi. Integrity: ${report.status}.`);
      } catch {
        notify("Backup faylı oxunmadı. JSON strukturunu yoxlayın.", "warning");
      }
    };
    reader.onerror = () => notify("Backup faylı oxunarkən xəta baş verdi.", "warning");
    reader.readAsText(file);
  }

  function changeCurrentRole(roleName) {
    setState((current) =>
      appendAudit(
        {
          ...current,
          settings: {
            ...current.settings,
            users: (current.settings.users || []).map((user) =>
              user.id === current.settings.sessionUserId
                ? { ...user, role: roleName, moduleAccess: getDefaultModuleAccessForRole(roleName, current.settings.roles || defaultRoles) }
                : user,
            ),
            currentRole: roleName,
          },
        },
        {
          module: "Ayarlar",
          action: "Aktiv rol dəyişdi",
          detail: roleName,
          role: getActiveRole(current.settings)?.name || "System",
        },
      ),
    );
    notify(`Aktiv rol: ${roleName}`);
  }

  function sendMessage() {
    if (!draftMessage.trim()) return;
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              preview: draftMessage,
              unread: 0,
              messages: [
                ...conversation.messages,
                { from: "Admin", text: draftMessage.trim(), time: "indi" },
              ],
            }
          : conversation,
      ),
    }));
    setDraftMessage("");
    auditOperation({
      module: "Mesaj",
      action: "Daxili mesaj göndərildi",
      detail: conversationId,
    });
  }

  if (!currentUser || (remoteApiEnabled && remoteAuthStatus === "checking")) {
    return (
      <>
        <LoginScreen
          users={state.settings.users || []}
          roles={state.settings.roles || defaultRoles}
          onLogin={loginUser}
          authMode={remoteApiEnabled ? "password" : "local"}
          onPasswordLogin={loginWithPassword}
          isLoading={remoteAuthStatus === "checking"}
          authError={authError}
        />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  const meta = pageMeta[active];
  const actionPermission = createPermissionByType[active];
  const canPerformPageAction = !actionPermission || can(actionPermission) || active === "reports" || active === "notifications";

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        items={visibleNavItems}
        currentUser={currentUser}
        activeRole={activeRoleInfo}
        mobileNav={mobileNav}
        onClose={() => setMobileNav(false)}
        onSelect={choosePage}
      />

      <div className="workspace">
        <Topbar
          query={query}
          setQuery={setQuery}
          unread={state.notifications.filter((item) => item.unread).length}
          messages={state.conversations.reduce((sum, item) => sum + item.unread, 0)}
          onMenu={() => setMobileNav(true)}
          onMessages={() => choosePage("messages")}
          onNotifications={() => choosePage("notifications")}
          currentUser={currentUser}
          activeRole={activeRoleInfo}
          users={state.settings.users || []}
          onLogin={loginUser}
          onLogout={logoutUser}
          canSwitchUser={!remoteApiEnabled}
        />

        <main className="main">
          <PageHeader meta={meta} onAction={openAction} canAct={canPerformPageAction} />

          {active === "dashboard" && (
            <DashboardPage
              stats={dashboardStats}
              orders={filtered.orders}
              stock={state.stock}
              expenses={state.expenses}
              notifications={state.notifications}
              actions={todayActionRows}
              advanceOrder={advanceOrder}
              setActive={choosePage}
            />
          )}
          {active === "crm" && (
            <CrmPage
              customers={filtered.customers}
              credits={creditRecords}
              orders={state.orders}
              contracts={state.contracts}
            />
          )}
          {active === "sales" && (
            <SalesPage
              orders={filtered.orders}
              stock={filtered.stock}
              employees={state.employees}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              advanceOrder={advanceOrder}
              onEditOrder={openSalesOrderEditor}
              onDeleteOrder={openSalesOrderDelete}
            />
          )}
          {active === "warehouse" && (
            <WarehousePage
              warehouses={state.warehouses}
              warehouseStock={state.warehouseStock}
              products={state.products || []}
              orders={state.orders}
              selectedWarehouseId={selectedWarehouseId}
              query={query}
              onSelect={setSelectedWarehouseId}
              onEdit={(warehouseId) =>
                setModal({ type: "warehouse", mode: "edit", warehouseId })
              }
              onDelete={deleteWarehouse}
              onCompleteDelivery={completeWarehouseDelivery}
              onTransferStock={transferWarehouseStock}
              onReceiveStock={() => setModal({ type: "stockIntake" })}
              onOpenImport={() => setModal({ type: "warehouseImport" })}
              onCreateProduct={() => setModal({ type: "product", mode: "create" })}
              onEditProduct={(productId) => setModal({ type: "product", mode: "edit", productId })}
              onTrackAction={(action, detail) => auditOperation({ module: "Anbar", action, detail })}
            />
          )}
          {active === "deliveries" && (
            <DeliveriesPage
              orders={filtered.orders}
              advanceOrder={advanceOrder}
              onCompleteDelivery={completeWarehouseDelivery}
            />
          )}
          {active === "finance" && (
            <FinancePage
              expenses={filtered.expenses}
              cashEntries={filtered.cashEntries}
              orders={filtered.orders}
            credits={creditRecords}
            currencyRows={filtered.currency}
            setExpenseStatus={setExpenseStatus}
            accounts={state.financeAccounts || []}
            openingBalance={financeOpeningBalance}
            onCreateAccount={() => setModal({ type: "financeAccount", mode: "create" })}
            onEditAccount={(accountId) => setModal({ type: "financeAccount", mode: "edit", accountId })}
            onEditExpense={openExpenseEditor}
            onDeleteExpense={openExpenseDelete}
            />
          )}
          {active === "invoices" && (
            <InvoicesPage
              invoices={filtered.invoices}
              summary={buildInvoiceSummary(invoiceRows)}
              invoiceSettings={state.invoiceSettings}
              onExport={exportReport}
            />
          )}
          {active === "accounting" && (
            <AccountingPage
              accounting={{
                ...accountingData,
                journalRows: filtered.accountingJournal,
                chartRows: filtered.accountingChart,
              }}
              closeRun={state.accountingClose}
            />
          )}
          {active === "tax" && (
            <TaxPage
              taxRows={filtered.taxCalendar}
              payrollTaxRows={payrollTaxRows}
              invoiceSummary={buildInvoiceSummary(invoiceRows)}
              accounting={accountingData}
            />
          )}
          {active === "credits" && (
            <CreditsPage
              credits={filtered.credits}
              sendCreditSms={sendCreditSms}
              onUpdatePaymentDate={updateCreditPaymentDate}
              onReceivePayment={receiveCreditPayment}
              onCreateCredit={() => setModal({ type: "sales", presetPaymentMethod: "Kredit" })}
            />
          )}
          {active === "receivables" && <ReceivablesPage rows={filtered.receivables} syncMeta={state.receivableSync} />}
          {active === "vendors" && (
            <VendorsPage
              vendors={filtered.vendors}
              warehouseStock={state.warehouseStock}
              products={state.products || []}
              orders={state.orders}
              purchaseOrders={state.purchaseOrders || []}
              onCreatePurchaseOrder={createPurchaseOrder}
              onApprovePurchaseOrder={approvePurchaseOrder}
              canManagePo={can("vendors.po")}
            />
          )}
          {active === "projects" && <ProjectsPage projects={filtered.projects} />}
          {active === "production" && <ProductionPage plans={filtered.productionPlans} />}
          {active === "hr" && (
            <HrPage
              employees={filtered.employees}
              allEmployees={state.employees}
              departments={state.departments || []}
              leaveRequests={state.leaveRequests || []}
              vacancies={state.vacancies || []}
              onUpdateEmployeeStructure={updateEmployeeStructure}
              onEditEmployee={openEmployeeEditor}
              onDeleteEmployee={openEmployeeDelete}
              onCreateDepartment={openDepartmentCreator}
              onCreateLeaveRequest={openLeaveRequestCreator}
              onCreateVacancy={openVacancyCreator}
            />
          )}
          {active === "kpi" && <KpiPage employees={state.employees} salesBonuses={salesBonusRows} />}
          {active === "contracts" && (
            <ContractsPage
              contracts={filtered.contracts}
              onExport={(id) => setModal({ type: "contractPrint", contractId: id })}
            />
          )}
          {active === "reports" && (
            <ReportsPage
              orders={state.orders}
              credits={creditRecords}
              vendors={state.vendors}
              employees={state.employees}
              exports={state.reportExports || []}
              onExport={exportReport}
            />
          )}
          {active === "support" && <SupportPage tickets={filtered.supportTickets} />}
          {active === "help" && <HelpCenterPage articles={filtered.knowledgeBase} />}
          {active === "onboarding" && <OnboardingPage onboarding={state.onboarding} rows={onboardingRows} />}
          {active === "messages" && (
            <MessagesPage
              conversations={filtered.conversations}
              conversationId={conversationId}
              setConversationId={setConversationId}
              draftMessage={draftMessage}
              setDraftMessage={setDraftMessage}
              sendMessage={sendMessage}
            />
          )}
          {active === "notifications" && (
            <NotificationsPage
              notifications={filtered.notifications}
              automationRows={notificationAutomationRows}
              filter={notificationFilter}
              setFilter={setNotificationFilter}
              markAll={markAllNotificationsRead}
              lastSweepAt={state.notificationSweepAt}
            />
          )}
          {active === "api" && (
            <ApiPage
              webhooks={filtered.apiWebhooks}
              dbMeta={state.dbMeta}
              auditLog={state.auditLog || []}
            />
          )}
          {active === "settings" && (
            <SettingsPage
              settings={state.settings}
              activeRole={activeRoleInfo}
              auditLog={state.auditLog || []}
              dbMeta={state.dbMeta}
              integrityReport={integrityReport}
              integritySnapshot={state.integritySnapshot}
              goLiveReport={goLiveReport}
              goLiveSnapshot={state.goLiveSnapshot}
              permissionCatalog={permissionCatalog}
              modulePermissionCatalog={modulePermissionCatalog}
              toggleSetting={toggleSetting}
              updateCompany={updateCompany}
              onSaveSettings={saveSettings}
              onChangeRole={changeCurrentRole}
              users={state.settings.users || []}
              onCreateUser={createUser}
              onUpdateUserStatus={updateUserStatus}
              onToggleUserModule={toggleUserModuleAccess}
              onRunIntegrityCheck={runIntegrityCheck}
              onRunGoLiveCheck={runGoLiveCheck}
              onExportBackup={exportBackup}
              onImportBackup={importBackup}
              notify={notify}
              requiresPassword={remoteApiEnabled}
            />
          )}
        </main>
      </div>

      {modal && (
        <CreateModal
          type={modal.type}
          mode={modal.mode}
          config={createConfig[modal.type]}
          warehouse={
            modal.warehouseId
              ? state.warehouses.find((warehouse) => warehouse.id === modal.warehouseId)
              : null
          }
          product={
            modal.productId
              ? state.products.find((product) => product.id === modal.productId)
              : null
          }
          contract={
            modal.contractId
              ? state.contracts.find((contract) => contract.id === modal.contractId)
              : null
          }
          salesOrder={
            modal.orderId
              ? state.orders.find((order) => order.id === modal.orderId)
              : null
          }
          expense={
            modal.expenseId
              ? state.expenses.find((expense) => expense.id === modal.expenseId)
              : null
          }
          financeAccount={
            modal.accountId
              ? state.financeAccounts.find((account) => account.id === modal.accountId)
              : null
          }
          employee={
            modal.employeeId
              ? state.employees.find((employee) => getEmployeeKey(employee) === modal.employeeId)
              : null
          }
          companySettings={state.settings}
          orderOptions={{
            customers: state.customers,
            products: state.products || [],
            employees: state.employees || [],
            departments: state.departments || [],
            stock: state.stock,
            warehouses: state.warehouses,
            warehouseStock: state.warehouseStock,
            sellers: state.employees.filter((employee) => employee.department === "Satış"),
          }}
          salesDefaults={{
            paymentMethod: modal.presetPaymentMethod,
          }}
          onClose={() => setModal(null)}
          onCreate={createRecord}
          onUpdateWarehouse={updateWarehouse}
          onReceiveStock={recordStockIntake}
          onImportWarehouseStock={importWarehouseStock}
          onUpdateProduct={updateProduct}
          onSaveFinanceAccount={saveFinanceAccount}
          onUpdateSalesOrder={updateSalesOrder}
          onDeleteSalesOrder={deleteSalesOrder}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
          onSaveEmployee={updateEmployee}
          onCreateDepartment={createDepartment}
          onDeleteEmployee={deleteEmployee}
          onCreateLeaveRequest={createLeaveRequest}
          onCreateVacancy={createVacancy}
        />
      )}
      <ToastStack toasts={toasts} />
    </div>
  );
}

function Sidebar({ active, items = navItems, currentUser, activeRole, mobileNav, onClose, onSelect }) {
  return (
    <>
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">E</div>
          <div>
            <div className="brand-name">ERP+CRM AZ</div>
            <div className="brand-subtitle">Azərbaycan Sistemi</div>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Menyunu bağla">
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {items.map((item) => {
            const Icon = navIcons[item.id];
            return (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? "active" : ""}`}
                onClick={() => onSelect(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-card">
          <div className="avatar">
            {String(currentUser?.name || "AD")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toLocaleUpperCase("az-AZ")}
          </div>
          <div>
            <div className="admin-name">{currentUser?.name || "Administrator"}</div>
            <div className="admin-mail">{activeRole?.name || currentUser?.email}</div>
          </div>
        </div>
      </aside>
      {mobileNav && <button className="scrim" onClick={onClose} aria-label="Menyunu bağla" />}
    </>
  );
}

function Topbar({
  query,
  setQuery,
  unread,
  messages,
  onMenu,
  onMessages,
  onNotifications,
  currentUser,
  activeRole,
  users = [],
  onLogin,
  onLogout,
  canSwitchUser = true,
}) {
  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={onMenu} aria-label="Menyunu aç">
        <Menu size={20} />
      </button>
      <div className="searchbox">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Müştəri, sifariş, məhsul axtar..."
        />
        {query && (
          <button className="clear-search" onClick={() => setQuery("")} aria-label="Axtarışı sil">
            <X size={14} />
          </button>
        )}
      </div>
      <div className="top-actions">
        {canSwitchUser && (
          <label className="user-switcher">
            <UserCog size={16} />
            <select
              aria-label="Aktiv istifadəçi"
              value={currentUser?.id || ""}
              onChange={(event) => onLogin(event.target.value)}
            >
              {users
                .filter((user) => user.status === "Aktiv")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role}
                  </option>
                ))}
            </select>
          </label>
        )}
        <div className="session-pill">
          <span>{currentUser?.name}</span>
          <strong>{activeRole?.name}</strong>
        </div>
        <button className="icon-btn badge-host" onClick={onMessages} aria-label="Mesajlar">
          <MessageSquare size={20} />
          <span className="counter">{messages}</span>
        </button>
        <button className="icon-btn badge-host" onClick={onNotifications} aria-label="Bildirişlər">
          <Bell size={20} />
          <span className="counter danger">{unread}</span>
        </button>
        <button className="secondary-btn logout-btn" onClick={onLogout}>
          Çıxış
        </button>
      </div>
    </header>
  );
}

function PageHeader({ meta, onAction, canAct = true }) {
  return (
    <div className="page-header">
      <div>
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>
      {canAct && (
        <button className="primary-btn" onClick={onAction}>
          {meta.action.includes("Yeni") ? <Plus size={16} /> : <Check size={16} />}
          {meta.action}
        </button>
      )}
    </div>
  );
}

function LoginScreen({ users = [], roles = [], onLogin, authMode = "local", onPasswordLogin, isLoading = false, authError = "" }) {
  const activeUsers = users.filter((user) => user.status === "Aktiv");
  const [selectedUserId, setSelectedUserId] = useState(activeUsers[0]?.id || "");
  const selectedUser = activeUsers.find((user) => user.id === selectedUserId) || activeUsers[0] || null;
  const selectedRole = roles.find((role) => role.name === selectedUser?.role);

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark login-brand">E</div>
        <div>
          <h1>ERP+CRM AZ</h1>
          <p>İstifadəçi seçin və rol icazələri ilə sistemə daxil olun.</p>
        </div>
        {authMode === "password" ? (
          <PasswordLoginForm onLogin={onPasswordLogin} isLoading={isLoading} error={authError} />
        ) : (
          <>
            <label>
              <span>İstifadəçi</span>
              <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                {activeUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role}
                  </option>
                ))}
              </select>
            </label>
            {selectedUser && (
              <div className="login-role-preview">
                <TwoLine title={selectedUser.email} subtitle={selectedRole?.scope || selectedUser.role} />
                <StatusBadge status={selectedUser.role} />
              </div>
            )}
            <button className="primary-btn full" onClick={() => onLogin(selectedUserId)} disabled={!selectedUserId}>
              <ShieldCheck size={16} />
              Sistemə daxil ol
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function PasswordLoginForm({ onLogin, isLoading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event) {
    event.preventDefault();
    onLogin({ email, password });
  }

  return (
    <form className="login-password-form" onSubmit={submit}>
      <label>
        <span>Email</span>
        <input type="email" autoComplete="username" value={email} required onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        <span>Parol</span>
        <input type="password" autoComplete="current-password" value={password} required onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn full" type="submit" disabled={isLoading}>
        <ShieldCheck size={16} />
        {isLoading ? "Yoxlanılır..." : "Sistemə daxil ol"}
      </button>
    </form>
  );
}

function DashboardPage({
  stats,
  orders,
  stock,
  expenses,
  notifications,
  actions = [],
  advanceOrder,
  setActive,
}) {
  const chart = [
    { month: "Yan", value: 145 },
    { month: "Fev", value: 168 },
    { month: "Mar", value: 192 },
    { month: "Apr", value: 178 },
    { month: "May", value: 249 },
  ];
  const pending = expenses.filter((expense) => expense.status === "Təsdiq gözləyir");

  return (
    <div className="stack">
      <section className="metric-grid">
        <MetricCard
          label="Aylıq gəlir"
          value={money(stats.revenue)}
          trend="+18.4% keçən aya"
          icon={Wallet}
          tone="success"
        />
        <MetricCard
          label="Aktiv müştəri"
          value={stats.activeCustomers}
          trend="+62 bu ay"
          icon={Users}
          tone="primary"
        />
        <MetricCard
          label="Açıq sifariş"
          value={stats.openOrders}
          trend="+12 bu həftə"
          icon={ShoppingCart}
          tone="info"
        />
        <MetricCard
          label="Təsdiq gözləyir"
          value={stats.pending}
          trend={`${pending.length} maliyyə əməliyyatı`}
          icon={CircleAlert}
          tone="warning"
        />
      </section>

      <section className="dashboard-grid">
        <Panel className="span-2">
          <PanelHeader
            title="Aylıq Satış Dinamikası"
            subtitle="Son 5 ay üzrə dövriyyə (min ₼)"
            icon={TrendingUp}
          />
          <div className="bar-chart" aria-label="Aylıq satış qrafiki">
            {chart.map((item) => {
              const height = Math.max(9, (item.value / 249) * 100);
              return (
                <div className="bar-item" key={item.month}>
                  <span>{item.value}k</span>
                  <svg className="bar-visual" viewBox="0 0 58 100" preserveAspectRatio="none" aria-hidden="true">
                    <rect x="0" y={100 - height} width="58" height={height} rx="6" />
                  </svg>
                  <small>{item.month}</small>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Əməliyyat Axını"
            subtitle={`${stats.reserved} rezerv · ${stats.available} satış üçün`}
            icon={Package}
          />
          <WorkflowSteps activeStage="Yoldadır" compact />
          <div className="mini-list">
            {notifications.slice(0, 3).map((item) => (
              <button key={item.id} className="mini-row" onClick={() => setActive("notifications")}>
                <span className={`dot ${item.unread ? "danger" : ""}`} />
                <span>{item.title}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <section className="dashboard-grid">
        <Panel className="span-2">
          <PanelHeader title="Son Sifarişlər" subtitle="Statusu dəyişmək üçün mərhələ düyməsini istifadə edin" />
          <DataTable
            columns={["№", "Müştəri", "Məhsul", "Məbləğ", "Status", "Əməliyyat"]}
            rows={orders.slice(0, 6).map((order) => [
              <strong>{order.id}</strong>,
              <TwoLine title={order.customer} subtitle={order.fin} />,
              order.products,
              money(order.amount),
              <StatusBadge status={order.status} />,
              <button className="text-btn" onClick={() => advanceOrder(order.id)}>
                Növbəti
              </button>,
            ])}
          />
        </Panel>

        <Panel className="today-action-panel">
          <PanelHeader
            title="Bu gün görüləcək işlər"
            subtitle={`${formatPaymentDate(parsePaymentDate(currentBusinessDate))} üzrə prioritet əməliyyatlar`}
            icon={ShieldCheck}
          />
          <div className="today-action-list">
            {actions.slice(0, 6).map((action) => {
              const Icon = action.icon || CircleAlert;
              return (
                <button key={action.id} className="today-action-row" onClick={() => setActive(action.module)}>
                  <span className={`today-action-icon ${action.priority === "Yüksək" ? "danger" : "info"}`}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{action.title}</strong>
                    <small>{action.detail}</small>
                  </div>
                  <TwoLine title={money(action.amount)} subtitle={action.status} />
                </button>
              );
            })}
            {actions.length === 0 && (
              <div className="today-action-empty">
                <Check size={16} />
                Bu gün üçün kritik əməliyyat yoxdur
              </div>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function CrmPage({ customers, credits, orders = [], contracts = [] }) {
  const [pipelineFilter, setPipelineFilter] = useState("Hamısı");
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [selectedCustomerFin, setSelectedCustomerFin] = useState("");
  const delayed = customers.filter((customer) => customer.delay > 0);
  const platin = customers.filter((customer) => customer.category === "Platin");
  const creditsByCustomer = customers.reduce((map, customer) => {
    map.set(customer.fin, getCustomerRelatedCredits(customer, credits));
    return map;
  }, new Map());
  const pipelineRows = useMemo(
    () => buildCrmPipelineRows(customers, credits, orders),
    [customers, credits, orders],
  );
  const pipelineStages = ["Hamısı", "Kredit uyğunluğu", "Təklif", "Upsell", "Təhvil sonrası", "Risk follow-up"];
  const visiblePipeline = pipelineRows.filter((row) => matchesCrmPipelineFilter(row, pipelineFilter));
  const pipelineValue = pipelineRows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const selectedPipeline = pipelineRows.find((row) => row.id === selectedPipelineId) || null;
  const selectedCustomer = customers.find((customer) => customer.fin === selectedCustomerFin) || null;
  const portalReady = pipelineRows.filter((row) => row.activeCreditCount > 0 || row.openOrders > 0);
  const nextBestActions = [...pipelineRows]
    .sort((a, b) => {
      const scoreA = (a.stage === "Risk follow-up" ? 100 : 0) + a.value * (a.probability / 100);
      const scoreB = (b.stage === "Risk follow-up" ? 100 : 0) + b.value * (b.probability / 100);
      return scoreB - scoreA;
    })
    .slice(0, 4);
  const kanbanColumns = pipelineStages
    .filter((stage) => stage !== "Hamısı")
    .map((stage) => ({
      stage,
      rows: pipelineRows.filter((row) => row.stage === stage),
      value: pipelineRows
        .filter((row) => row.stage === stage)
        .reduce((sum, row) => sum + Number(row.value || 0), 0),
    }));

  return (
    <div className="stack">
      <section className="metric-grid three">
        <MetricCard label="Ümumi müştəri" value={customers.length} icon={Users} tone="primary" />
        <MetricCard label="Platin müştərilər" value={platin.length} icon={ShieldCheck} tone="success" />
        <MetricCard
          label="Gecikmiş ödəniş"
          value={`${delayed.length} müştəri`}
          trend={`${money(total(delayed, "debt"))} ümumi borc`}
          icon={CircleAlert}
          tone="danger"
        />
      </section>
      <section className="dashboard-grid crm-command-grid">
        <Panel className="span-2 crm-pipeline-panel">
          <PanelHeader
            title="CRM Pipeline"
            subtitle="Lead, təklif, kredit uyğunluğu və təhvil sonrası satış fürsətləri"
            icon={TrendingUp}
          />
          <div className="crm-pipeline-toolbar">
            <div className="tabs">
              {pipelineStages.map((stage) => (
                <button
                  key={stage}
                  className={pipelineFilter === stage ? "active" : ""}
                  onClick={() => setPipelineFilter(stage)}
                >
                  {stage}
                  <span>
                    {stage === "Hamısı"
                      ? pipelineRows.length
                      : pipelineRows.filter((row) => row.stage === stage).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="crm-pipeline-total">
              <span>Pipeline dəyəri</span>
              <strong>{money(pipelineValue)}</strong>
            </div>
          </div>
          <div className="crm-kanban-board">
            {kanbanColumns.map((column) => (
              <div className="crm-kanban-column" key={column.stage}>
                <div className="crm-kanban-head">
                  <strong>{column.stage}</strong>
                  <span>{column.rows.length} · {money(column.value)}</span>
                </div>
                <div className="crm-kanban-cards">
                  {column.rows.slice(0, 3).map((row) => (
                    <button
                      key={`${column.stage}-${row.id}`}
                      className={`crm-kanban-card${selectedPipelineId === row.id ? " is-selected" : ""}`}
                      onClick={() => setSelectedPipelineId(row.id)}
                      aria-pressed={selectedPipelineId === row.id}
                    >
                      <strong>{row.customer.name}</strong>
                      <span>{row.nextAction}</span>
                      <small>{money(row.value)} · {row.probability}%</small>
                    </button>
                  ))}
                  {column.rows.length === 0 && <span className="crm-kanban-empty">Boşdur</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="crm-pipeline-list">
            {visiblePipeline.map((row) => (
              <button
                key={row.id}
                className={`crm-pipeline-row${selectedPipelineId === row.id ? " is-selected" : ""}`}
                onClick={() => setSelectedPipelineId(row.id)}
                aria-pressed={selectedPipelineId === row.id}
              >
                <div>
                  <strong>{row.customer.name}</strong>
                  <span>
                    {row.source} · {row.nextAction}
                  </span>
                </div>
                <TwoLine title={money(row.value)} subtitle={`${row.probability}% ehtimal`} />
                <TwoLine title={row.owner} subtitle={`${money(row.limitLeft)} limit qalığı`} />
                <StatusBadge status={row.stage} />
              </button>
            ))}
          </div>
          {selectedPipeline && (
            <div className="crm-pipeline-selection" aria-live="polite">
              <div>
                <span>Secilmis musteri</span>
                <button
                  type="button"
                  className="crm-customer-link"
                  onClick={() => setSelectedCustomerFin(selectedPipeline.customer.fin)}
                >
                  {selectedPipeline.customer.name}
                </button>
                <small>FIN {selectedPipeline.customer.fin}</small>
              </div>
              <div>
                <span>Novbeti addim</span>
                <strong>{selectedPipeline.nextAction}</strong>
                <small>{selectedPipeline.owner} · {selectedPipeline.stage}</small>
              </div>
              <div>
                <span>Fursat</span>
                <strong>{money(selectedPipeline.value)}</strong>
                <small>{selectedPipeline.probability}% ehtimal</small>
              </div>
            </div>
          )}
        </Panel>

        <Panel className="crm-automation-panel">
          <PanelHeader title="Növbəti addımlar" subtitle="Satış və risk komandası üçün avtomatik iş siyahısı" icon={CalendarClock} />
          <div className="crm-action-list">
            {nextBestActions.map((row) => (
              <div className="crm-action-row" key={`${row.id}-action`}>
                <div>
                  <strong>{row.customer.name}</strong>
                  <span>{row.nextAction}</span>
                </div>
                <StatusBadge status={row.stage} />
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel className="customer-portal-panel">
        <PanelHeader
          title="Müştəri portalı hazırlığı"
          subtitle="Balans, müqavilə, ödəniş tarixi və təhvil statusu müştəri kabinetində görünəcək"
          icon={Users}
        />
        <DataTable
          columns={["Müştəri", "Aktiv kredit", "Qalıq", "Növbəti ödəniş", "Açıq sifariş", "Portal statusu"]}
          rows={portalReady.map((row) => [
            <button
              type="button"
              className="crm-customer-name-btn"
              onClick={() => setSelectedCustomerFin(row.customer.fin)}
            >
              <TwoLine title={row.customer.name} subtitle={`FİN ${row.customer.fin}`} />
            </button>,
            row.activeCreditCount,
            money(row.totalBalance),
            row.nextPayment ? `${money(row.nextPayment.amount)} · ${row.nextPayment.due}` : "Yoxdur",
            row.openOrders,
            <StatusBadge status={row.totalBalance > 0 ? "Aktiv kabinet" : "Məlumat kabineti"} />,
          ])}
        />
      </Panel>
      <Panel>
        <PanelHeader title="Müştəri Reyestri" subtitle="FİN, limit, cari borc və gecikmə statusu" />
        <DataTable
          columns={["FİN", "Ad Soyad", "Telefon", "Kateqoriya", "Kredit limiti", "Cari borc", "Kredit tarixçəsi", "Gecikmə"]}
          rows={customers.map((customer) => {
            const customerCredits = creditsByCustomer.get(customer.fin) || [];

            return [
              <strong>{customer.fin}</strong>,
              <button
                type="button"
                className="crm-customer-name-btn"
                onClick={() => setSelectedCustomerFin(customer.fin)}
              >
                {customer.name}
              </button>,
              customer.phone,
              <StatusBadge status={customer.category} />,
              money(customer.limit),
              money(customer.debt),
              <CustomerCreditHistory credits={customerCredits} />,
              customer.delay > 0 ? <StatusBadge status={`${customer.delay} gün`} /> : "Vaxtında",
            ];
          })}
        />
      </Panel>
      {selectedCustomer ? (
        <Customer360Modal
          customer={selectedCustomer}
          credits={credits}
          orders={orders}
          contracts={contracts}
          onClose={() => setSelectedCustomerFin("")}
        />
      ) : null}
    </div>
  );
}

function CustomerCreditHistory({ credits }) {
  if (credits.length === 0) return "Yoxdur";

  const latest = credits[0];
  const latestPlan = getCreditDisplayPlan(latest);
  const totalBalance = credits.reduce((sum, credit) => sum + getCreditDisplayPlan(credit).balance, 0);

  return (
    <div className="customer-credit-history">
      <strong>
        {credits.length} kredit · {money(totalBalance)} qalıq
      </strong>
      <span>
        {latest.id} · {latestPlan.months} ay · {money(latestPlan.monthly)}/ay
      </span>
    </div>
  );
}

function Customer360Modal({ customer, credits, orders, contracts, onClose }) {
  const profile = useMemo(
    () => buildCustomer360(customer, { credits, orders, contracts }),
    [customer, credits, orders, contracts],
  );

  return (
    <div className="modal-shell customer-360-modal-shell" role="dialog" aria-modal="true" aria-labelledby="customer-360-title">
      <div className="modal-card customer-360-modal-card">
        <div className="modal-head customer-360-head">
          <div>
            <h2 id="customer-360-title">{customer.name}</h2>
            <p>FİN {customer.fin} üzrə müqavilə, cihaz və ödəniş 360 baxışı</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>

        <div className="customer-360-body">
          <section className="customer-360-summary">
            <div>
              <span>Alış dəyəri</span>
              <strong>{money(profile.totalPurchased)}</strong>
            </div>
            <div>
              <span>Ödənilib</span>
              <strong>{money(profile.totalPaid)}</strong>
            </div>
            <div>
              <span>Qalıq</span>
              <strong>{money(profile.totalBalance)}</strong>
            </div>
            <div>
              <span>Müqavilə / cihaz</span>
              <strong>{profile.contracts.length} / {profile.devices.length}</strong>
            </div>
          </section>

          <section className="customer-360-grid">
            <div className="customer-360-main">
              <Panel className="customer-360-section">
                <PanelHeader title="Müqavilələr" subtitle="Müştəriyə bağlı satış müqavilələri və sifarişlər" icon={FileText} />
                <DataTable
                  columns={["Müqavilə", "Sifariş", "Cihaz", "Məbləğ", "Status"]}
                  rows={profile.contracts.map((contract) => [
                    <strong>{contract.id}</strong>,
                    contract.orderId || "—",
                    contract.product || "Cihaz qeyd edilməyib",
                    money(contract.amount),
                    <StatusBadge status={contract.status || "Hazırlanır"} />,
                  ])}
                />
              </Panel>

              <Panel className="customer-360-section">
                <PanelHeader title="Alınan cihazlar" subtitle="Hər cihaz üzrə ödənilən və qalan məbləğ" icon={Package} />
                <DataTable
                  columns={["Cihaz", "Müqavilə", "Sifariş", "Məbləğ", "Ödənilib", "Qalıq", "Status"]}
                  rows={profile.devices.map((device) => [
                    <TwoLine title={device.product} subtitle={`${device.qty} ədəd${device.serials.length ? ` · ${device.serials.join(", ")}` : ""}`} />,
                    device.contractId,
                    device.orderId,
                    money(device.amount),
                    money(device.paid),
                    <strong>{money(device.balance)}</strong>,
                    <StatusBadge status={device.status || "Aktiv"} />,
                  ])}
                />
              </Panel>
            </div>

            <aside className="customer-360-side">
              <Panel className="customer-360-section">
                <PanelHeader title="Kredit planları" subtitle="Aylıq ödəniş və qalıq izləmə" icon={CreditCard} />
                <div className="customer-360-credit-list">
                  {profile.credits.length === 0 ? (
                    <EmptyState title="Aktiv kredit yoxdur" />
                  ) : (
                    profile.credits.map((credit) => {
                      const plan = getCreditDisplayPlan(credit);
                      const paymentState = getCreditPaymentState(credit, plan);
                      return (
                        <div className="customer-360-credit-card" key={credit.id}>
                          <div>
                            <strong>{credit.contractId || credit.id}</strong>
                            <StatusBadge status={getCreditManagementStatus({ credit, paymentState })} />
                          </div>
                          <span>{credit.device || credit.product || "Cihaz qeyd edilməyib"}</span>
                          <dl>
                            <div>
                              <dt>Aylıq</dt>
                              <dd>{money(paymentState.nextInstallment?.amount || plan.monthly)}</dd>
                            </div>
                            <div>
                              <dt>Ödənilib</dt>
                              <dd>{money(getCreditPaidTotal(plan))}</dd>
                            </div>
                            <div>
                              <dt>Qalıq</dt>
                              <dd>{money(plan.balance)}</dd>
                            </div>
                            <div>
                              <dt>Növbəti</dt>
                              <dd>{paymentState.nextInstallment?.due || credit.next || "—"}</dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })
                  )}
                </div>
              </Panel>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
}

function SalesPage({
  orders,
  stock,
  employees,
  selectedOrder,
  setSelectedOrder,
  advanceOrder,
  onEditOrder,
  onDeleteOrder,
}) {
  const [salesFilter, setSalesFilter] = useState("Hamısı");
  const [sellerFilter, setSellerFilter] = useState("Bütün satıcılar");
  const sellers = employees.filter((employee) => employee.department === "Satış");
  const salesBonusRows = useMemo(() => buildSalesBonusRows(orders), [orders]);
  const sellerOptions = [
    ...new Set([...sellers.map((seller) => seller.name), ...salesBonusRows.map((row) => row.seller)].filter(Boolean)),
  ];
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const sellerNames = getOrderSellerBonuses(order).map((item) => item.seller);
        const matchesSeller = sellerFilter === "Bütün satıcılar" || sellerNames.includes(sellerFilter);
        return matchesSalesOrderFilter(order, salesFilter) && matchesSeller;
      }),
    [orders, salesFilter, sellerFilter],
  );
  const selected = orders.find((order) => order.id === selectedOrder) || filteredOrders[0] || orders[0];
  const selectedBonusRows = selected ? buildSalesBonusRows([selected]) : [];
  const selectedCreditPlan =
    selected?.paymentMethod === "Kredit"
      ? buildCreditPlan({
          total: selected.amount,
          initialPayment: selected.initialPayment ?? selected.paid ?? 0,
          months: selected.creditMonths || 12,
        })
      : null;
  const activeOrders = orders.filter((order) => order.status !== "Təhvil verilib");
  const creditOrders = orders.filter((order) => getOrderPaymentMethod(order) === "Kredit");
  const balanceTotal = orders.reduce((sum, order) => sum + getOrderBalance(order), 0);
  const bonusTotal = total(salesBonusRows, "bonusAmount");
  const averageCheck = orders.length > 0 ? Math.round(total(orders, "amount") / orders.length) : 0;
  const deliveryWaiting = orders.filter((order) => order.status !== "Təhvil verilib").length;
  const salesFilterOptions = ["Hamısı", "Kredit", "Nağd", "Qalıqlı", "Təhvil gözləyən", "Tamamlanan"];
  const maxSellerBonus = Math.max(
    1,
    ...sellers.map((seller) => total(salesBonusRows.filter((row) => row.seller === seller.name), "bonusAmount")),
  );
  const sellerBonusStats = sellers.map((seller) => {
    const rows = salesBonusRows.filter((row) => row.seller === seller.name);
    return {
      ...seller,
      bonusAmount: total(rows, "bonusAmount"),
      orderCount: new Set(rows.map((row) => row.orderId)).size,
      progress: (total(rows, "bonusAmount") / maxSellerBonus) * 100,
    };
  });
  const actionOrders = orders
    .filter((order) => getOrderBalance(order) > 0 || order.status !== "Təhvil verilib")
    .slice(0, 4);
  const criticalStock = [...stock]
    .sort((a, b) => a.total - a.reserved - (b.total - b.reserved))
    .slice(0, 5);

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Aktiv sifarişlər" value={activeOrders.length} icon={ShoppingCart} tone="primary" />
        <MetricCard label="Ümumi dövriyyə" value={money(total(orders, "amount"))} icon={Wallet} tone="success" />
        <MetricCard label="Daxil olan" value={money(total(orders, "paid"))} icon={Check} tone="info" />
        <MetricCard
          label="Qalıq"
          value={money(balanceTotal)}
          icon={CircleAlert}
          tone="warning"
        />
      </section>

      <Panel className="sales-control-panel">
        <PanelHeader
          title="Satış nəzarəti"
          subtitle="Ödəniş, təhvil və bonus üzrə operativ göstəricilər"
          icon={Filter}
        />
        <div className="sales-control-grid">
          <div className="sales-control-tile">
            <span>Kredit satışları</span>
            <strong>{creditOrders.length}</strong>
            <small>{money(total(creditOrders, "amount"))} portfel</small>
          </div>
          <div className="sales-control-tile">
            <span>Təhvil gözləyən</span>
            <strong>{deliveryWaiting}</strong>
            <small>Anbar çıxışı izlənir</small>
          </div>
          <div className="sales-control-tile">
            <span>Bonus fondu</span>
            <strong>{money(bonusTotal)}</strong>
            <small>{salesBonusRows.length} bonus sətri</small>
          </div>
          <div className="sales-control-tile">
            <span>Orta çek</span>
            <strong>{money(averageCheck)}</strong>
            <small>{orders.length} sifariş üzrə</small>
          </div>
        </div>
        <div className="sales-alert-list">
          {actionOrders.map((order) => (
            <button key={order.id} className="sales-alert-row" onClick={() => setSelectedOrder(order.id)}>
              <div>
                <strong>
                  {order.id} · {order.customer}
                </strong>
                <span>
                  {getOrderBalance(order) > 0
                    ? `${money(getOrderBalance(order))} qalıq`
                    : getOrderDeliveryStatus(order)}
                </span>
              </div>
              <StatusBadge status={order.status} />
            </button>
          ))}
        </div>
      </Panel>

      <section className="dashboard-grid">
        <Panel>
          <PanelHeader title="Satıcı bonus performansı" subtitle="Satış sifarişlərindən real bonus hesabı" />
          <div className="seller-bonus-list">
            {sellerBonusStats.map((seller) => (
              <div className="seller-bonus-row" key={seller.name}>
                <div className="seller-bonus-main">
                  <AvatarLine initials={seller.initials} title={seller.name} subtitle={`${seller.orderCount} sifariş`} />
                  <strong>{money(seller.bonusAmount)}</strong>
                </div>
                <ProgressRow value={seller.progress} compact />
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Stok siqnalları" subtitle="Satış üçün ən həssas qalıqlar" />
          <div className="stock-stack">
            {criticalStock.map((item) => (
              <div className="stock-row stock-signal" key={item.product}>
                <span>{item.product}</span>
                <strong>{item.total - item.reserved}</strong>
                <small>{item.reserved} rezerv</small>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Sifariş Kartı" subtitle={selected?.id || "Sifariş seçilməyib"} />
          {selected ? (
            <div className="detail-card sales-order-card">
              <div className="sales-order-head">
                <h3>{selected.customer}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <p>{selected.products}</p>
              <div className="order-detail-grid">
                <div>
                  <span>Ödəniş</span>
                  <strong>{getOrderPaymentMethod(selected)}</strong>
                  <small>{money(Number(selected.paid || 0))} daxil olub</small>
                </div>
                <div>
                  <span>Qalıq</span>
                  <strong>{money(getOrderBalance(selected))}</strong>
                  <small>{selected.paymentStatus || "Ödəniş izlənir"}</small>
                </div>
                <div>
                  <span>Anbar</span>
                  <strong>{selected.warehouseName || "Anbar qeyd edilməyib"}</strong>
                  <small>{getOrderDeliveryStatus(selected)}</small>
                </div>
                <div>
                  <span>Bonus</span>
                  <strong>{money(total(selectedBonusRows, "bonusAmount"))}</strong>
                  <small>{getOrderBonusText(selected)}</small>
                </div>
              </div>
              {selectedCreditPlan && (
                <div className="selected-credit-summary">
                  <span>İlkin: {money(selectedCreditPlan.initialPayment)}</span>
                  <span>Qalıq: {money(selectedCreditPlan.balance)}</span>
                  <span>{selectedCreditPlan.months} ay · {money(selectedCreditPlan.monthly)}/ay</span>
                </div>
              )}
              {selectedBonusRows.length > 0 && (
                <div className="seller-bonus-chips">
                  {selectedBonusRows.map((row) => (
                    <span key={row.id}>
                      {getShortSellerName(row.seller)} <strong>{money(row.bonusAmount)}</strong>
                    </span>
                  ))}
                </div>
              )}
              <WorkflowSteps activeStage={selected.status} compact />
              <div className="operation-row-actions">
                <button className="secondary-btn" onClick={() => onEditOrder(selected.id)}>
                  <Pencil size={16} />
                  Redaktə
                </button>
                <button className="secondary-btn danger-outline" onClick={() => onDeleteOrder(selected.id)}>
                  <Trash2 size={16} />
                  Sil
                </button>
              </div>
              <button className="secondary-btn full" onClick={() => advanceOrder(selected.id)}>
                <ChevronRight size={16} />
                Növbəti mərhələ
              </button>
            </div>
          ) : (
            <EmptyState title="Sifariş seçilməyib" />
          )}
        </Panel>
      </section>

      <Panel>
        <PanelHeader title="Satış reyestri" subtitle="Filter edib sifariş, ödəniş, anbar və bonus vəziyyətini izləyin" />
        <div className="sales-filter-toolbar">
          <div className="tabs">
            {salesFilterOptions.map((item) => (
              <button key={item} className={salesFilter === item ? "active" : ""} onClick={() => setSalesFilter(item)}>
                <span>{item}</span>
                <strong>{orders.filter((order) => matchesSalesOrderFilter(order, item)).length}</strong>
              </button>
            ))}
          </div>
          <label className="sales-seller-filter">
            <span>Satıcı</span>
            <select value={sellerFilter} onChange={(event) => setSellerFilter(event.target.value)}>
              <option>Bütün satıcılar</option>
              {sellerOptions.map((seller) => (
                <option key={seller}>{seller}</option>
              ))}
            </select>
          </label>
        </div>
        <DataTable
          columns={["№", "Müştəri", "Məhsul", "Ödəniş", "Anbar", "Bonus", "Qalıq", "Status", "Əməliyyat"]}
          rows={filteredOrders.map((order) => [
            <button
              className={`row-link ${selected?.id === order.id ? "active" : ""}`}
              onClick={() => setSelectedOrder(order.id)}
            >
              {order.id}
            </button>,
            <TwoLine title={order.customer} subtitle={`FİN ${order.fin}`} />,
            <TwoLine title={summarizeOrderProducts(order)} subtitle={order.date} />,
            <TwoLine title={money(Number(order.paid || 0))} subtitle={order.paymentStatus || getOrderPaymentMethod(order)} />,
            <TwoLine title={order.warehouseName || "Anbar seçilməyib"} subtitle={getOrderDeliveryStatus(order)} />,
            <TwoLine title={money(getOrderBonusAmount(order))} subtitle={getOrderBonusText(order)} />,
            getOrderBalance(order) > 0 ? <strong>{money(getOrderBalance(order))}</strong> : <StatusBadge status="Ödənilib" />,
            <StatusBadge status={order.status} />,
            <div className="row-actions operation-table-actions">
              <button className="text-btn" onClick={() => onEditOrder(order.id)}>Redaktə</button>
              <button className="text-btn danger" onClick={() => onDeleteOrder(order.id)}>Sil</button>
            </div>,
          ])}
        />
      </Panel>
    </div>
  );
}

function buildAggregateWarehouseStock(warehouses, warehouseStock) {
  const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
  const byProduct = new Map();

  Object.entries(warehouseStock).forEach(([warehouseId, items]) => {
    const warehouse = warehouseById.get(warehouseId);
    items.forEach((item) => {
      const current = byProduct.get(item.product) || {
        product: item.product,
        total: 0,
        reserved: 0,
        price: item.price,
        distribution: [],
      };
      current.total += Number(item.total || 0);
      current.reserved += Number(item.reserved || 0);
      current.price = item.price || current.price;
      current.distribution.push({
        warehouse: warehouse?.name || warehouseId,
        total: Number(item.total || 0),
        available: Number(item.total || 0) - Number(item.reserved || 0),
      });
      byProduct.set(item.product, current);
    });
  });

  return [...byProduct.values()].sort((a, b) => a.product.localeCompare(b.product, "az"));
}

function getAvailableQuantity(item) {
  return Math.max(0, Number(item.total || 0) - Number(item.reserved || 0));
}

function getWarehouseStockSummary(items, capacity = 0, products = []) {
  const productsByName = buildProductLookup(products);
  const totalQty = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const reservedQty = total(items, "reserved");
  const availableQty = Math.max(0, totalQty - reservedQty);
  const value = items.reduce((sum, item) => sum + getAvailableQuantity(item) * Number(item.price || 0), 0);
  return {
    sku: items.length,
    total: totalQty,
    reserved: reservedQty,
    available: availableQty,
    value,
    lowStock: items.filter((item) => isLowStockItem(item, productsByName)).length,
    utilization: capacity > 0 ? Math.min(100, Math.round((totalQty / capacity) * 100)) : 0,
    reservedRate: totalQty > 0 ? (reservedQty / totalQty) * 100 : 0,
  };
}

function buildWarehouseSummaries(warehouses, warehouseStock, products = []) {
  return warehouses.map((warehouse) => ({
    warehouse,
    ...getWarehouseStockSummary(warehouseStock[warehouse.id] || [], Number(warehouse.capacity || 0), products),
  }));
}

function buildWarehouseStockAlerts(warehouses, warehouseStock, products = []) {
  const productsByName = buildProductLookup(products);

  return warehouses.flatMap((warehouse) =>
    (warehouseStock[warehouse.id] || [])
      .map((item) => ({
        item,
        reorderPoint: getReorderPoint(item, productsByName),
      }))
      .filter(({ item, reorderPoint }) => reorderPoint > 0 && getAvailableQuantity(item) <= reorderPoint)
      .map(({ item, reorderPoint }) => ({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          city: warehouse.city,
          product: item.product,
          total: Number(item.total || 0),
          reserved: Number(item.reserved || 0),
          available: getAvailableQuantity(item),
          reorderPoint,
          status: getAvailableQuantity(item) <= Math.max(1, Math.floor(reorderPoint / 2)) ? "Kritik stok" : "Aşağı stok",
        })),
  );
}

function buildWarehouseTransferSuggestions(warehouses, warehouseStock) {
  const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
  const byProduct = new Map();

  Object.entries(warehouseStock).forEach(([warehouseId, items]) => {
    items.forEach((item) => {
      const rows = byProduct.get(item.product) || [];
      rows.push({
        warehouseId,
        warehouseName: warehouseById.get(warehouseId)?.name || warehouseId,
        city: warehouseById.get(warehouseId)?.city || "",
        product: item.product,
        price: Number(item.price || 0),
        total: Number(item.total || 0),
        reserved: Number(item.reserved || 0),
        available: getAvailableQuantity(item),
      });
      byProduct.set(item.product, rows);
    });
  });

  return [...byProduct.entries()].flatMap(([product, rows]) => {
    const targets = rows.filter((row) => row.available <= 3).sort((a, b) => a.available - b.available);
    const sources = rows.filter((row) => row.available >= 6).sort((a, b) => b.available - a.available);
    return targets.flatMap((target) => {
      const source = sources.find((item) => item.warehouseId !== target.warehouseId);
      if (!source) return [];
      const qty = Math.max(1, Math.min(5 - target.available, source.available - 4));
      if (qty <= 0) return [];
      return {
        id: `${product}-${source.warehouseId}-${target.warehouseId}`,
        product,
        fromWarehouseId: source.warehouseId,
        fromWarehouse: source.warehouseName,
        toWarehouseId: target.warehouseId,
        toWarehouse: target.warehouseName,
        qty,
        reason: `${target.warehouseName} üzrə satış üçün ${target.available} qalıb`,
      };
    });
  });
}

function filterWarehouseItems(items, filter) {
  if (filter === "Satış üçün var") {
    return items.filter((item) => item.total - item.reserved > 0);
  }
  if (filter === "Rezervdə") {
    return items.filter((item) => item.reserved > 0);
  }
  if (filter === "Aşağı stok") {
    return items.filter((item) => item.total - item.reserved <= 3);
  }
  return items;
}

function WarehouseStockToolbar({ filter, setFilter }) {
  const filters = ["Hamısı", "Satış üçün var", "Rezervdə", "Aşağı stok"];
  return (
    <div className="warehouse-stock-toolbar">
      <div>
        <h2>Anbar üzrə mallar</h2>
        <p>Filter seçib ümumi və ya seçilmiş anbar üzrə qalıqlara baxın</p>
      </div>
      <div className="tabs">
        {filters.map((item) => (
          <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function WarehouseDistribution({ distribution }) {
  return (
    <div className="warehouse-distribution">
      {distribution
        .filter((item) => item.total > 0)
        .map((item) => (
          <span key={item.warehouse}>
            {item.warehouse}: <strong>{item.available}</strong>
          </span>
        ))}
    </div>
  );
}

function DeliveryOrdersPanel({ orders, isAllWarehouses, onCompleteDelivery }) {
  return (
    <div className="delivery-orders-panel">
      <PanelHeader
        title="Təhvil verilməli məhsullar"
        subtitle={
          isAllWarehouses
            ? "Bütün anbarlar üzrə rezervdə olan və təhvil gözləyən sifarişlər"
            : "Seçilmiş anbardan çıxarılmalı rezerv məhsullar"
        }
      />
      <DataTable
        columns={["Sifariş", "Müştəri", "Məhsullar", "Anbar", "Ödəniş", "Status", "Əməliyyat"]}
        rows={orders.map((order) => [
          <strong>{order.id}</strong>,
          <TwoLine title={order.customer} subtitle={order.fin} />,
          <OrderProductLines lines={order.productLines} />,
          order.warehouseName || "Baş Anbar",
          <StatusBadge status={order.paymentStatus || order.paymentMethod || "Nağd"} />,
          <StatusBadge status={order.deliveryStatus || order.status} />,
          <button className="text-btn" onClick={() => onCompleteDelivery(order.id)}>
            Təhvil verildi
          </button>,
        ])}
      />
    </div>
  );
}

function OrderProductLines({ lines }) {
  return (
    <div className="order-product-lines">
      {lines.map((line) => (
        <span key={`${line.product}-${line.qty}`}>
          {line.product} <strong>x{line.qty}</strong>
          {Array.isArray(line.serials) && line.serials.length > 0 && (
            <small>{line.serials.join(", ")}</small>
          )}
        </span>
      ))}
    </div>
  );
}

function WarehouseControlPanel({ summary, deliveryCount, alerts, isAllWarehouses, onSelect }) {
  return (
    <Panel className="warehouse-control-panel">
      <PanelHeader
        title="Anbar nəzarəti"
        subtitle={isAllWarehouses ? "Bütün anbarlar üzrə canlı əməliyyat xülasəsi" : "Seçilmiş anbar üzrə əməliyyat xülasəsi"}
        icon={SlidersHorizontal}
      />
      <div className="warehouse-control-grid">
        <div className="warehouse-control-tile">
          <span>Satış üçün</span>
          <strong>{summary.available} ədəd</strong>
          <small>{money(summary.value)} dəyər</small>
        </div>
        <div className="warehouse-control-tile">
          <span>Rezerv yükü</span>
          <strong>{summary.reserved} ədəd</strong>
          <small>{percent(summary.reservedRate)} stok rezervdə</small>
        </div>
        <div className="warehouse-control-tile">
          <span>Təhvil növbəsi</span>
          <strong>{deliveryCount}</strong>
          <small>Anbardan çıxmalı sifariş</small>
        </div>
        <div className="warehouse-control-tile">
          <span>Doluluq</span>
          <strong>{summary.utilization}%</strong>
          <small>{summary.sku} məhsul çeşidi</small>
        </div>
      </div>
      <div className="warehouse-signal-list">
        {alerts.slice(0, 4).map((alert) => (
          <button key={`${alert.warehouseId}-${alert.product}`} className="warehouse-signal-row" onClick={() => onSelect(alert.warehouseId)}>
            <div>
              <strong>{alert.product}</strong>
              <span>
                {alert.warehouseName} · satış üçün {alert.available} ədəd
              </span>
            </div>
            <StatusBadge status={alert.status} />
          </button>
        ))}
        {alerts.length === 0 && (
          <div className="warehouse-signal-empty">
            <Check size={16} />
            Kritik stok siqnalı yoxdur
          </div>
        )}
      </div>
    </Panel>
  );
}

function WarehouseTransferPanel({ suggestions, onTransferStock }) {
  return (
    <div className="warehouse-transfer-panel">
      <PanelHeader
        title="Transfer tövsiyələri"
        subtitle="Aşağı qalıqlı anbarlara artıq stok olan anbardan daxili transfer"
        icon={Truck}
      />
      <DataTable
        columns={["Məhsul", "Haradan", "Haraya", "Miqdar", "Səbəb", "Əməliyyat"]}
        rows={suggestions.map((suggestion) => [
          <strong>{suggestion.product}</strong>,
          suggestion.fromWarehouse,
          suggestion.toWarehouse,
          `${suggestion.qty} ədəd`,
          suggestion.reason,
          <button className="text-btn" onClick={() => onTransferStock(suggestion)}>
            Transfer et
          </button>,
        ])}
      />
    </div>
  );
}

function BarcodeBadge({ barcode, qrPayload }) {
  const widths = String(barcode)
    .slice(0, 12)
    .split("")
    .map((digit) => 1 + (Number(digit) % 3));
  const widthWithGaps = widths.reduce((sum, width) => sum + width + 2, 0);

  return (
    <div className="barcode-badge" title={qrPayload}>
      <svg className="barcode-lines" viewBox={`0 0 ${widthWithGaps} 18`} preserveAspectRatio="none" aria-hidden="true">
        {widths.map((width, index) => {
          const x = widths.slice(0, index).reduce((sum, item) => sum + item + 2, 0);
          return <rect key={`${barcode}-${index}`} x={x} y="0" width={width} height="18" />;
        })}
      </svg>
      <small>{barcode}</small>
    </div>
  );
}

const warehouseBalanceFilterDefaults = {
  productQuery: "",
  warehouseId: "all",
  category: "all",
  stockStatus: "all",
  reserveStatus: "all",
  serialStatus: "all",
  belowMinimum: false,
};

function getWarehouseBalanceStatus(available, reorderPoint) {
  if (available <= 0) return "Stok tükənib";
  if (reorderPoint > 0 && available <= Math.max(1, Math.floor(reorderPoint / 2))) return "Kritik stok";
  if (reorderPoint > 0 && available <= reorderPoint) return "Aşağı stok";
  return "Normal";
}

function buildWarehouseBalanceRows({ warehouses = [], warehouseStock = {}, products = [], view = "products", warehouseId = "all" }) {
  const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
  const productsByName = buildProductLookup(products);
  const createRow = (productName, catalogProduct = null) => ({
    key: catalogProduct?.id || normalize(productName),
    product: productName,
    productId: catalogProduct?.id || "",
    category: catalogProduct?.category || "Kataloqu olmayan",
    sku: catalogProduct?.sku || "—",
    unit: catalogProduct?.unit || "ədəd",
    serialTracked: Boolean(catalogProduct?.serialTracked),
    costPrice: Number(catalogProduct?.costPrice || 0),
    salePrice: Number(catalogProduct?.salePrice || 0),
    reorderLevel: Number(catalogProduct?.reorderLevel || 0),
    total: 0,
    reserved: 0,
    warehouseDistribution: [],
  });

  if (view === "products") {
    const rowsByProduct = new Map();
    products.filter((product) => product.status !== "Passiv").forEach((product) => {
      rowsByProduct.set(normalize(product.name), createRow(product.name, product));
    });

    Object.entries(warehouseStock).forEach(([sourceWarehouseId, items]) => {
      if (warehouseId !== "all" && sourceWarehouseId !== warehouseId) return;
      (items || []).forEach((item) => {
        const key = normalize(item.product);
        const catalogProduct = productsByName.get(key);
        const row = rowsByProduct.get(key) || createRow(item.product, catalogProduct);
        row.total += Number(item.total || 0);
        row.reserved += Number(item.reserved || 0);
        row.salePrice = row.salePrice || Number(item.price || 0);
        row.serialTracked = catalogProduct?.serialTracked ?? isSerialTrackedProduct(item);
        row.reorderLevel = getReorderPoint(item, productsByName);
        row.warehouseDistribution.push({
          warehouse: warehouseById.get(sourceWarehouseId)?.name || sourceWarehouseId,
          warehouseId: sourceWarehouseId,
          total: Number(item.total || 0),
          available: getAvailableQuantity(item),
        });
        rowsByProduct.set(key, row);
      });
    });

    return [...rowsByProduct.values()]
      .map((row) => {
        const available = Math.max(0, row.total - row.reserved);
        return {
          ...row,
          warehouseName: row.warehouseDistribution.length === 0 ? "—" : `${row.warehouseDistribution.length} anbar`,
          warehouseCount: row.warehouseDistribution.length,
          available,
          status: getWarehouseBalanceStatus(available, row.reorderLevel),
          stockValue: row.total * row.costPrice,
          salesValue: row.total * row.salePrice,
        };
      })
      .sort((a, b) => a.product.localeCompare(b.product, "az"));
  }

  return Object.entries(warehouseStock)
    .flatMap(([sourceWarehouseId, items]) => {
      if (warehouseId !== "all" && sourceWarehouseId !== warehouseId) return [];
      const warehouse = warehouseById.get(sourceWarehouseId);
      return (items || []).map((item) => {
        const catalogProduct = productsByName.get(normalize(item.product));
        const totalQty = Number(item.total || 0);
        const reserved = Number(item.reserved || 0);
        const available = getAvailableQuantity(item);
        const reorderLevel = getReorderPoint(item, productsByName);
        const costPrice = Number(catalogProduct?.costPrice || 0);
        const salePrice = Number(catalogProduct?.salePrice || item.price || 0);
        return {
          key: `${sourceWarehouseId}-${catalogProduct?.id || item.product}`,
          warehouseId: sourceWarehouseId,
          warehouseName: warehouse?.name || sourceWarehouseId,
          product: item.product,
          productId: catalogProduct?.id || "",
          category: catalogProduct?.category || "Kataloqu olmayan",
          sku: catalogProduct?.sku || "—",
          unit: catalogProduct?.unit || "ədəd",
          serialTracked: catalogProduct?.serialTracked ?? isSerialTrackedProduct(item),
          costPrice,
          salePrice,
          reorderLevel,
          total: totalQty,
          reserved,
          available,
          warehouseDistribution: [],
          status: getWarehouseBalanceStatus(available, reorderLevel),
          stockValue: totalQty * costPrice,
          salesValue: totalQty * salePrice,
        };
      });
    })
    .sort((a, b) => a.warehouseName.localeCompare(b.warehouseName, "az") || a.product.localeCompare(b.product, "az"));
}

function filterWarehouseBalanceRows(rows, filters, globalQuery = "") {
  const search = normalize([filters.productQuery, globalQuery].filter(Boolean).join(" "));
  return rows.filter((row) => {
    const matchesSearch = !search || normalize(`${row.product} ${row.sku} ${row.category} ${row.warehouseName}`).includes(search);
    const matchesCategory = filters.category === "all" || row.category === filters.category;
    const matchesStock =
      filters.stockStatus === "all" ||
      (filters.stockStatus === "below" && (row.status === "Aşağı stok" || row.status === "Kritik stok" || row.status === "Stok tükənib")) ||
      (filters.stockStatus === "available" && row.available > 0) ||
      (filters.stockStatus === "empty" && row.available <= 0);
    const matchesReserve =
      filters.reserveStatus === "all" ||
      (filters.reserveStatus === "reserved" && row.reserved > 0) ||
      (filters.reserveStatus === "free" && row.reserved === 0);
    const matchesSerial =
      filters.serialStatus === "all" ||
      (filters.serialStatus === "serial" && row.serialTracked) ||
      (filters.serialStatus === "batch" && !row.serialTracked);
    const matchesMinimum = !filters.belowMinimum || row.status === "Aşağı stok" || row.status === "Kritik stok" || row.status === "Stok tükənib";
    return matchesSearch && matchesCategory && matchesStock && matchesReserve && matchesSerial && matchesMinimum;
  });
}

function exportWarehouseBalanceCsv(rows, view) {
  const headers = ["Kateqoriya", "Məhsul", "SKU", "Anbar", "Qalıq", "Minimum", "Rezerv", "Mövcud", "Vahid", "Maya", "Stok dəyəri", "Satış qiyməti", "Status"];
  const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csvRows = rows.map((row) => [
    row.category,
    row.product,
    row.sku,
    view === "products" ? row.warehouseName : row.warehouseName,
    row.total,
    row.reorderLevel,
    row.reserved,
    row.available,
    row.unit,
    row.costPrice,
    row.stockValue,
    row.salePrice,
    row.status,
  ].map(escapeValue).join(","));
  const blob = new Blob([`\uFEFF${headers.map(escapeValue).join(",")}\n${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `anbar-qaliqlari-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const warehouseImportHeaderAliases = {
  product: ["məhsul", "məhsul adı", "product", "name"],
  sku: ["sku", "kod", "code"],
  warehouse: ["anbar", "warehouse"],
  qty: ["miqdar", "qalıq", "qty", "quantity"],
  salePrice: ["satış qiyməti", "satış", "sale price", "sale_price", "price"],
  costPrice: ["alış qiyməti", "maya", "cost price", "cost_price"],
  category: ["kateqoriya", "category"],
  reorderLevel: ["minimum stok", "minimum", "reorder level", "reorder_level"],
  unit: ["ölçü vahidi", "vahid", "unit"],
  serialTracked: ["serial izləmə", "serial", "imei", "serial tracked"],
};

function parseDelimitedCsv(text) {
  const cleanText = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLine = cleanText.split("\n").find((line) => line.trim()) || "";
  const delimiter = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < cleanText.length; index += 1) {
    const character = cleanText[index];
    if (character === '"') {
      if (quoted && cleanText[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && character === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (!quoted && character === "\n") {
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += character;
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function parseWarehouseImportNumber(value) {
  const raw = String(value ?? "").trim().replace(/[₼\s]/g, "");
  if (!raw) return null;
  const commaIndex = raw.lastIndexOf(",");
  const dotIndex = raw.lastIndexOf(".");
  const normalizedValue = commaIndex > dotIndex
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(/,/g, "");
  const number = Number(normalizedValue);
  return Number.isFinite(number) ? number : null;
}

function parseWarehouseImportBoolean(value) {
  const normalizedValue = normalize(value)
    .replaceAll("ə", "e")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]/g, "");
  if (["beli", "yes", "true", "1"].includes(normalizedValue)) return true;
  if (["xeyr", "no", "false", "0"].includes(normalizedValue)) return false;
  return null;
}

function getWarehouseImportCell(record, aliases) {
  for (const alias of aliases) {
    const value = record[normalize(alias)];
    if (value !== undefined) return value;
  }
  return "";
}

function parseWarehouseImportCsv(text, warehouses = []) {
  const csvRows = parseDelimitedCsv(text);
  if (csvRows.length === 0) return { rows: [], errors: ["CSV faylı boşdur."] };

  const header = csvRows[0].map((value) => normalize(value));
  const hasProduct = warehouseImportHeaderAliases.product.some((alias) => header.includes(normalize(alias)));
  const hasWarehouse = warehouseImportHeaderAliases.warehouse.some((alias) => header.includes(normalize(alias)));
  const hasQuantity = warehouseImportHeaderAliases.qty.some((alias) => header.includes(normalize(alias)));
  if (!hasProduct || !hasWarehouse || !hasQuantity) {
    return { rows: [], errors: ["CSV başlığında Məhsul, Anbar və Miqdar sütunları olmalıdır."] };
  }

  const warehouseByName = new Map(warehouses.flatMap((warehouse) => [
    [normalize(warehouse.name), warehouse],
    [normalize(warehouse.code), warehouse],
  ]));
  const rows = [];
  const errors = [];

  csvRows.slice(1).forEach((cells, index) => {
    const record = Object.fromEntries(header.map((key, cellIndex) => [key, cells[cellIndex] || ""]));
    const product = String(getWarehouseImportCell(record, warehouseImportHeaderAliases.product)).trim();
    const warehouseInput = String(getWarehouseImportCell(record, warehouseImportHeaderAliases.warehouse)).trim();
    const quantity = parseWarehouseImportNumber(getWarehouseImportCell(record, warehouseImportHeaderAliases.qty));
    const salePrice = parseWarehouseImportNumber(getWarehouseImportCell(record, warehouseImportHeaderAliases.salePrice));
    const costPrice = parseWarehouseImportNumber(getWarehouseImportCell(record, warehouseImportHeaderAliases.costPrice));
    const reorderLevel = parseWarehouseImportNumber(getWarehouseImportCell(record, warehouseImportHeaderAliases.reorderLevel));
    const warehouse = warehouseByName.get(normalize(warehouseInput));
    const lineNumber = index + 2;

    if (!product) {
      errors.push(`Sətir ${lineNumber}: məhsul adı boşdur.`);
      return;
    }
    if (!warehouse) {
      errors.push(`Sətir ${lineNumber}: anbar tapılmadı (${warehouseInput || "boş"}).`);
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      errors.push(`Sətir ${lineNumber}: miqdar müsbət tam ədəd olmalıdır.`);
      return;
    }
    if ([salePrice, costPrice, reorderLevel].some((value) => value !== null && value < 0)) {
      errors.push(`Sətir ${lineNumber}: qiymət və minimum stok mənfi ola bilməz.`);
      return;
    }

    rows.push({
      product,
      sku: String(getWarehouseImportCell(record, warehouseImportHeaderAliases.sku)).trim().toUpperCase(),
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      qty: quantity,
      salePrice,
      costPrice,
      category: String(getWarehouseImportCell(record, warehouseImportHeaderAliases.category)).trim(),
      reorderLevel: reorderLevel === null ? null : Math.max(0, Math.round(reorderLevel)),
      unit: String(getWarehouseImportCell(record, warehouseImportHeaderAliases.unit)).trim(),
      serialTracked: parseWarehouseImportBoolean(getWarehouseImportCell(record, warehouseImportHeaderAliases.serialTracked)),
      lineNumber,
    });
  });

  return { rows, errors };
}

function downloadWarehouseImportTemplate() {
  const headers = ["Məhsul", "SKU", "Anbar", "Miqdar", "Satış qiyməti", "Alış qiyməti", "Kateqoriya", "Minimum stok", "Ölçü vahidi", "Serial izləmə"];
  const blob = new Blob([`\uFEFF${headers.join(";")}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "anbar-toplu-import-sablonu.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function WarehouseBalanceFilters({ filters, warehouses, categories, open, onChange, onApply, onClear }) {
  if (!open) return null;

  return (
    <section className="warehouse-balance-filters">
      <label>
        <span>Məhsul / qrup</span>
        <div className="warehouse-filter-search">
          <Search size={16} />
          <input value={filters.productQuery} placeholder="Məhsul adı, SKU və ya qrup" onChange={(event) => onChange("productQuery", event.target.value)} />
        </div>
      </label>
      <label>
        <span>Anbar</span>
        <select value={filters.warehouseId} onChange={(event) => onChange("warehouseId", event.target.value)}>
          <option value="all">Bütün anbarlar</option>
          {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
        </select>
      </label>
      <label>
        <span>Kateqoriya</span>
        <select value={filters.category} onChange={(event) => onChange("category", event.target.value)}>
          <option value="all">Bütün kateqoriyalar</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label>
        <span>Qalıq statusu</span>
        <select value={filters.stockStatus} onChange={(event) => onChange("stockStatus", event.target.value)}>
          <option value="all">Hamısı</option>
          <option value="below">Minimumdan aşağı</option>
          <option value="available">Stokda var</option>
          <option value="empty">Stok tükənib</option>
        </select>
      </label>
      <label>
        <span>Rezerv statusu</span>
        <select value={filters.reserveStatus} onChange={(event) => onChange("reserveStatus", event.target.value)}>
          <option value="all">Hamısı</option>
          <option value="reserved">Yalnız rezervli</option>
          <option value="free">Rezervsiz</option>
        </select>
      </label>
      <label>
        <span>Serial izləmə</span>
        <select value={filters.serialStatus} onChange={(event) => onChange("serialStatus", event.target.value)}>
          <option value="all">Hamısı</option>
          <option value="serial">IMEI / serial</option>
          <option value="batch">Batch</option>
        </select>
      </label>
      <label className="warehouse-minimum-toggle">
        <input type="checkbox" checked={filters.belowMinimum} onChange={(event) => onChange("belowMinimum", event.target.checked)} />
        <span>Minimumdan aşağı olanlar</span>
      </label>
      <div className="warehouse-filter-actions">
        <button type="button" className="secondary-btn" onClick={onClear}>Təmizlə</button>
        <button type="button" className="primary-btn" onClick={onApply}>Tətbiq et</button>
      </div>
    </section>
  );
}

function WarehouseBalanceTable({ rows, view, onEditProduct, onCreateProduct, onSelectWarehouse }) {
  const totals = rows.reduce((summary, row) => ({
    total: summary.total + Number(row.total || 0),
    reserved: summary.reserved + Number(row.reserved || 0),
    available: summary.available + Number(row.available || 0),
    stockValue: summary.stockValue + Number(row.stockValue || 0),
    salesValue: summary.salesValue + Number(row.salesValue || 0),
  }), { total: 0, reserved: 0, available: 0, stockValue: 0, salesValue: 0 });
  const locationHeading = view === "products" ? "Anbarlar" : "Anbar";

  return (
    <div className="warehouse-balance-table-wrap">
      <table className="warehouse-balance-table">
        <thead>
          <tr>
            <th>Kateqoriya</th><th>Məhsul</th><th>SKU</th><th>{locationHeading}</th><th>Qalıq</th><th>Minimum</th><th>Rezerv</th><th>Mövcud</th><th>Vahid</th><th>Maya</th><th>Stok dəyəri</th><th>Satış</th><th>Status</th><th>Əməliyyat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.category}</td>
              <td><strong>{row.product}</strong></td>
              <td className="warehouse-sku">{row.sku}</td>
              <td>{view === "products" ? <WarehouseDistribution distribution={row.warehouseDistribution} /> : row.warehouseName}</td>
              <td>{row.total}</td>
              <td>{row.reorderLevel || "—"}</td>
              <td>{row.reserved}</td>
              <td className={row.status === "Normal" ? "balance-qty good" : "balance-qty risk"}>{row.available}</td>
              <td>{row.unit}</td>
              <td>{money(row.costPrice)}</td>
              <td>{money(row.stockValue)}</td>
              <td>{money(row.salePrice)}</td>
              <td><StatusBadge status={row.status} /></td>
              <td>
                {view === "warehouses" ? (
                  <button className="text-btn" onClick={() => onSelectWarehouse(row.warehouseId)}>Anbara keç</button>
                ) : row.productId ? (
                  <button className="text-btn" onClick={() => onEditProduct(row.productId)}>Redaktə</button>
                ) : (
                  <button className="text-btn" onClick={onCreateProduct}>Kataloqa əlavə et</button>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="14" className="warehouse-balance-empty">Seçilmiş filtrə uyğun qalıq tapılmadı.</td></tr>}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="4">Cəmi</td><td>{totals.total}</td><td>—</td><td>{totals.reserved}</td><td className="balance-qty good">{totals.available}</td><td>—</td><td>—</td><td>{money(totals.stockValue)}</td><td>{money(totals.salesValue)}</td><td>—</td><td>—</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function WarehouseBalancesWorkspace({
  warehouses,
  warehouseStock,
  products,
  query,
  onReceiveStock,
  onOpenImport,
  onCreateProduct,
  onEditProduct,
  onSelectWarehouse,
  onOpenOperations,
  onTrackAction,
}) {
  const [view, setView] = useState("products");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [draftFilters, setDraftFilters] = useState(() => ({ ...warehouseBalanceFilterDefaults }));
  const [activeFilters, setActiveFilters] = useState(() => ({ ...warehouseBalanceFilterDefaults }));
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "az")),
    [products],
  );
  const balanceRows = useMemo(
    () => buildWarehouseBalanceRows({ warehouses, warehouseStock, products, view, warehouseId: activeFilters.warehouseId }),
    [warehouses, warehouseStock, products, view, activeFilters.warehouseId],
  );
  const visibleRows = useMemo(
    () => filterWarehouseBalanceRows(balanceRows, activeFilters, query),
    [balanceRows, activeFilters, query],
  );
  const productRows = useMemo(
    () => buildWarehouseBalanceRows({ warehouses, warehouseStock, products, view: "products", warehouseId: activeFilters.warehouseId }),
    [warehouses, warehouseStock, products, activeFilters.warehouseId],
  );
  const warehouseRows = useMemo(
    () => buildWarehouseBalanceRows({ warehouses, warehouseStock, products, view: "warehouses", warehouseId: activeFilters.warehouseId }),
    [warehouses, warehouseStock, products, activeFilters.warehouseId],
  );

  function changeDraftFilter(key, value) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters() {
    setActiveFilters({ ...draftFilters });
  }

  function clearFilters() {
    const next = { ...warehouseBalanceFilterDefaults };
    setDraftFilters(next);
    setActiveFilters(next);
  }

  function showReplenishmentRows() {
    const next = { ...activeFilters, stockStatus: "below", belowMinimum: true };
    const replenishmentCount = balanceRows.filter((row) => row.status === "Aşağı stok" || row.status === "Kritik stok" || row.status === "Stok tükənib").length;
    setDraftFilters(next);
    setActiveFilters(next);
    setFiltersOpen(true);
    onTrackAction?.("Ehtiyat tamamlama siyahısı açıldı", `${replenishmentCount} məhsul/anbar sətrinə minimum stok filtri tətbiq edildi`);
  }

  function handleExport() {
    exportWarehouseBalanceCsv(visibleRows, view);
    onTrackAction?.("Anbar qalıqları CSV ixrac edildi", `${visibleRows.length} sətir · ${view === "products" ? "məhsullar üzrə" : "anbarlar üzrə"}`);
  }

  function handlePrint() {
    onTrackAction?.("Anbar qalıqları çap üçün açıldı", `${visibleRows.length} sətir · ${view === "products" ? "məhsullar üzrə" : "anbarlar üzrə"}`);
    document.body.classList.add("warehouse-print-mode");
    const clearPrintMode = () => document.body.classList.remove("warehouse-print-mode");
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.print();
    window.setTimeout(clearPrintMode, 1000);
  }

  function selectWarehouse(warehouseId) {
    const next = { ...activeFilters, warehouseId };
    setDraftFilters(next);
    setActiveFilters(next);
    onSelectWarehouse(warehouseId);
  }

  return (
    <section className="warehouse-balance-workspace">
      <div className="warehouse-balance-toolbar">
        <div className="warehouse-balance-tabs" role="tablist" aria-label="Qalıq görünüşü">
          <button type="button" role="tab" aria-selected={view === "products"} className={view === "products" ? "active" : ""} onClick={() => setView("products")}>
            Məhsullar üzrə <strong>{productRows.length}</strong>
          </button>
          <button type="button" role="tab" aria-selected={view === "warehouses"} className={view === "warehouses" ? "active" : ""} onClick={() => setView("warehouses")}>
            Anbarlar üzrə <strong>{warehouseRows.length}</strong>
          </button>
        </div>
        <div className="warehouse-balance-actions">
          <button type="button" className="secondary-btn" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
            <Filter size={16} /> Filter
          </button>
          <button type="button" className="secondary-btn" onClick={handlePrint}>
            <FileText size={16} /> Çap
          </button>
          <button type="button" className="secondary-btn" onClick={handleExport}>
            <Download size={16} /> İxrac CSV
          </button>
          <button type="button" className="secondary-btn" onClick={showReplenishmentRows}>
            <RefreshCw size={16} /> Ehtiyatı tamamla
          </button>
          <div className="warehouse-action-menu">
            <button type="button" className="primary-btn" aria-expanded={actionMenuOpen} onClick={() => setActionMenuOpen((open) => !open)}>
              <ShoppingCart size={16} /> Əməliyyatlar <ChevronRight size={15} />
            </button>
            {actionMenuOpen && (
              <div className="warehouse-action-menu-popover">
                <button type="button" onClick={() => { setActionMenuOpen(false); onReceiveStock(); }}><Plus size={15} /> Mədaxil et</button>
                <button type="button" onClick={() => { setActionMenuOpen(false); onOpenImport(); }}><Upload size={15} /> Toplu import</button>
                <button type="button" onClick={() => { setActionMenuOpen(false); onCreateProduct(); }}><Package size={15} /> Məhsul yarat</button>
                <button type="button" onClick={() => { setActionMenuOpen(false); onOpenOperations(); }}><Warehouse size={15} /> Anbar idarəetməsi</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <WarehouseBalanceFilters
        filters={draftFilters}
        warehouses={warehouses}
        categories={categories}
        open={filtersOpen}
        onChange={changeDraftFilter}
        onApply={applyFilters}
        onClear={clearFilters}
      />
      <div className="warehouse-balance-table-meta">
        <span>{visibleRows.length} qalıq sətri</span>
        <strong>{view === "products" ? "Məhsullar üzrə cari qalıq" : "Anbarlar üzrə cari qalıq"}</strong>
      </div>
      <WarehouseBalanceTable
        rows={visibleRows}
        view={view}
        onEditProduct={onEditProduct}
        onCreateProduct={onCreateProduct}
        onSelectWarehouse={selectWarehouse}
      />
    </section>
  );
}

function WarehousePage({
  warehouses,
  warehouseStock,
  products,
  orders,
  selectedWarehouseId,
  query,
  onSelect,
  onEdit,
  onDelete,
  onCompleteDelivery,
  onTransferStock,
  onReceiveStock,
  onOpenImport,
  onCreateProduct,
  onEditProduct,
  onTrackAction,
}) {
  const [warehouseStatusFilter, setWarehouseStatusFilter] = useState("Hamısı");
  const [stockFilter, setStockFilter] = useState("Hamısı");
  const operationsRef = useRef(null);
  const isAllWarehouses = selectedWarehouseId === "all";
  const selectedWarehouse = isAllWarehouses
    ? null
    : warehouses.find((warehouse) => warehouse.id === selectedWarehouseId) || warehouses[0];
  const aggregateItems = buildAggregateWarehouseStock(warehouses, warehouseStock);
  const warehouseSummaries = buildWarehouseSummaries(warehouses, warehouseStock, products);
  const summaryByWarehouse = new Map(warehouseSummaries.map((summary) => [summary.warehouse.id, summary]));
  const aggregateSummary = getWarehouseStockSummary(
    aggregateItems,
    warehouses.reduce((sum, warehouse) => sum + Number(warehouse.capacity || 0), 0),
    products,
  );
  const selectedItems = isAllWarehouses
    ? aggregateItems
    : selectedWarehouse
      ? warehouseStock[selectedWarehouse.id] || []
      : [];
  const selectedSummary = isAllWarehouses
    ? aggregateSummary
    : summaryByWarehouse.get(selectedWarehouse?.id) || getWarehouseStockSummary([], 0, products);
  const stockAlerts = buildWarehouseStockAlerts(warehouses, warehouseStock, products);
  const transferSuggestions = buildWarehouseTransferSuggestions(warehouses, warehouseStock);
  const visibleWarehouses = filterRows(warehouses, query).filter((warehouse) =>
    warehouseStatusFilter === "Hamısı" ? true : warehouse.status === warehouseStatusFilter,
  );
  const warehouseList = visibleWarehouses.length > 0 ? visibleWarehouses : [];
  const visibleItems = filterWarehouseItems(filterRows(selectedItems, query), stockFilter);
  const wmsRows = buildWarehouseWmsRows(visibleItems, products);
  const reorderRows = wmsRows.filter((row) => row.reorderQty > 0);
  const deliveryOrders = orders.filter((order) => {
    const canDeliver =
      Array.isArray(order.productLines) &&
      order.productLines.length > 0 &&
      order.status !== "Təhvil verilib";
    if (!canDeliver) return false;
    if (isAllWarehouses) return true;
    return order.warehouseId === selectedWarehouse?.id;
  });
  const visibleStockAlerts = isAllWarehouses
    ? stockAlerts
    : stockAlerts.filter((alert) => alert.warehouseId === selectedWarehouse?.id);
  const visibleTransferSuggestions = isAllWarehouses
    ? transferSuggestions
    : transferSuggestions.filter(
        (suggestion) =>
          suggestion.fromWarehouseId === selectedWarehouse?.id || suggestion.toWarehouseId === selectedWarehouse?.id,
      );

  return (
    <div className="stack warehouse-module">
      <WarehouseBalancesWorkspace
        warehouses={warehouses}
        warehouseStock={warehouseStock}
        products={products}
        query={query}
        onReceiveStock={onReceiveStock}
        onOpenImport={onOpenImport}
        onCreateProduct={onCreateProduct}
        onEditProduct={onEditProduct}
        onSelectWarehouse={onSelect}
        onOpenOperations={() => {
          if (operationsRef.current) {
            operationsRef.current.open = true;
            operationsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        onTrackAction={onTrackAction}
      />
      <details className="warehouse-operations-drawer" ref={operationsRef}>
        <summary>
          <span><SlidersHorizontal size={17} /> Anbar əməliyyat nəzarəti</span>
          <span>Anbarlar, transfer, təhvil və WMS görünüşü <ChevronRight size={16} /></span>
        </summary>
        <div className="warehouse-operations-body">
      <section className="metric-grid four">
        <MetricCard label="Anbar sayı" value={warehouses.length} icon={Warehouse} tone="primary" />
        <MetricCard
          label="Satış üçün"
          value={`${aggregateSummary.available} ədəd`}
          trend={`${aggregateSummary.total} ümumi stok`}
          icon={Boxes}
          tone="info"
        />
        <MetricCard
          label="Rezervdə"
          value={`${aggregateSummary.reserved} ədəd`}
          trend={percent(aggregateSummary.reservedRate)}
          icon={Package}
          tone="warning"
        />
        <MetricCard
          label="Risk siqnalı"
          value={stockAlerts.length}
          trend={`${deliveryOrders.length} təhvil növbəsi`}
          icon={CircleAlert}
          tone={stockAlerts.length > 0 ? "danger" : "success"}
        />
      </section>

      <div className="warehouse-head-actions">
        <button className="secondary-btn" onClick={onCreateProduct}>
          <Plus size={16} />
          Məhsul yarat
        </button>
        <button
          className="primary-btn"
          disabled={warehouses.length === 0}
          title={warehouses.length === 0 ? "Əvvəl anbar yaradın" : "Anbara məhsul mədaxil edin"}
          onClick={onReceiveStock}
        >
          <Plus size={16} />
          Mədaxil et
        </button>
      </div>

      <WarehouseControlPanel
        summary={selectedSummary}
        deliveryCount={deliveryOrders.length}
        alerts={visibleStockAlerts}
        isAllWarehouses={isAllWarehouses}
        onSelect={onSelect}
      />

      <Panel className="wms-control-panel">
        <PanelHeader
          title="WMS əməliyyat nəzarəti"
          subtitle="SKU, rəf/bin, serial izləmə, sayım dövrü və minimum stok nöqtələri"
          icon={Boxes}
        />
        <div className="wms-summary-grid">
          <div>
            <span>Serial izlənən</span>
            <strong>{wmsRows.filter((row) => row.serialMode === "IMEI/Serial").length}</strong>
            <small>Bahalı cihazlar</small>
          </div>
          <div>
            <span>Sayımda</span>
            <strong>{wmsRows.filter((row) => row.cycleCount === "Bu həftə").length}</strong>
            <small>Cycle count prioriteti</small>
          </div>
          <div>
            <span>Satınalma siqnalı</span>
            <strong>{reorderRows.length}</strong>
            <small>Minimum stokdan aşağı</small>
          </div>
          <div>
            <span>Rezerv yükü</span>
            <strong>{selectedSummary.reserved}</strong>
            <small>Təhvilə bağlı stok</small>
          </div>
        </div>
        <DataTable
          columns={["SKU", "Məhsul", "Barkod/QR", "Serial status", "Bin/Rəf", "İzləmə", "Sayım", "Satış üçün", "Reorder", "Status"]}
          rows={wmsRows.slice(0, 8).map((row) => [
            <strong>{row.sku}</strong>,
            row.product,
            <BarcodeBadge barcode={row.barcode} qrPayload={row.qrPayload} />,
            <TwoLine
              title={row.sampleSerial}
              subtitle={`${row.serialSummary.available} anbarda · ${row.serialSummary.reserved} rezerv · ${row.serialSummary.sold} satılıb`}
            />,
            row.bin,
            row.serialMode,
            row.cycleCount,
            row.available,
            row.reorderQty > 0 ? `${row.reorderQty} ədəd` : "Yoxdur",
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>

      <Panel className="product-catalog-panel">
        <PanelHeader title="Məhsul kataloqu" subtitle="SKU, kateqoriya, qiymət və minimum stok nəzarəti" icon={Package} />
        <DataTable
          columns={["SKU", "Məhsul", "Kateqoriya", "Alış", "Satış", "Minimum stok", "İzləmə", "Əməliyyat"]}
          rows={products.map((product) => [
            <strong>{product.sku}</strong>,
            product.name,
            product.category,
            money(product.costPrice),
            money(product.salePrice),
            product.reorderLevel,
            product.serialTracked ? "IMEI / Serial" : "Batch",
            <button className="text-btn" onClick={() => onEditProduct(product.id)}>Redaktə</button>,
          ])}
        />
      </Panel>

      <section className="warehouse-layout">
        <Panel>
          <PanelHeader title="Anbarlar" subtitle="Ümumi və ya konkret anbar seçin" />
          <div className="warehouse-filter-row">
            <select
              aria-label="Anbar status filteri"
              value={warehouseStatusFilter}
              onChange={(event) => setWarehouseStatusFilter(event.target.value)}
            >
              <option>Hamısı</option>
              <option>Aktiv</option>
              <option>Passiv</option>
              <option>Təmir</option>
            </select>
          </div>
          <div className="warehouse-card-list">
            <article className={`warehouse-card ${isAllWarehouses ? "active" : ""}`}>
              <button className="warehouse-main" onClick={() => onSelect("all")}>
                <div className="warehouse-card-head">
                  <div>
                    <strong>Ümumi</strong>
                    <span>Bütün anbarlar · Məcmu qalıq</span>
                  </div>
                  <StatusBadge status="Toplam" />
                </div>
                <p>Bütün anbarlar üzrə malların ümumi qalıq və satış üçün miqdarı.</p>
                <div className="warehouse-stats">
                  <span>{aggregateItems.length} məhsul</span>
                  <span>{aggregateSummary.total} ədəd</span>
                  <span>{aggregateSummary.available} satış üçün</span>
                </div>
                <ProgressRow label="" value={(aggregateSummary.available / Math.max(aggregateSummary.total, 1)) * 100} compact />
              </button>
              <div className="warehouse-actions">
                <button className="text-btn" onClick={() => onSelect("all")}>
                  Ümumiyə bax
                </button>
              </div>
            </article>
            {warehouseList.map((warehouse) => {
              const items = warehouseStock[warehouse.id] || [];
              const warehouseSummary = summaryByWarehouse.get(warehouse.id) || getWarehouseStockSummary(items, warehouse.capacity, products);
              return (
                <article
                  className={`warehouse-card ${warehouse.id === selectedWarehouse?.id ? "active" : ""}`}
                  key={warehouse.id}
                >
                  <button className="warehouse-main" onClick={() => onSelect(warehouse.id)}>
                    <div className="warehouse-card-head">
                      <div>
                        <strong>{warehouse.name}</strong>
                        <span>{warehouse.code} · {warehouse.city}</span>
                      </div>
                      <StatusBadge status={warehouse.status} />
                    </div>
                    <p>{warehouse.address}</p>
                    <div className="warehouse-stats">
                      <span>{items.length} məhsul</span>
                      <span>{warehouseSummary.available} satış üçün</span>
                      <span>{warehouseSummary.utilization}% doluluq</span>
                    </div>
                    <ProgressRow label="" value={warehouseSummary.utilization} compact />
                  </button>
                  <div className="warehouse-actions">
                    <button className="text-btn" onClick={() => onSelect(warehouse.id)}>
                      Daxil ol
                    </button>
                    <button className="text-btn" onClick={() => onEdit(warehouse.id)}>
                      Redaktə
                    </button>
                    <button className="text-btn danger" onClick={() => onDelete(warehouse.id)}>
                      Sil
                    </button>
                  </div>
                </article>
              );
            })}
            {warehouseList.length === 0 && <EmptyState title="Anbar tapılmadı" />}
          </div>
        </Panel>

        <Panel className="warehouse-detail-panel">
          {isAllWarehouses ? (
            <>
              <div className="warehouse-detail-head">
                <div>
                  <h2>Ümumi anbar qalığı</h2>
                  <p>Bütün anbarlar üzrə məhsul qalıqları və anbar paylanması</p>
                </div>
              </div>
              <div className="warehouse-info-grid">
                <TwoLine title="Anbar sayı" subtitle={`${warehouses.length} anbar`} />
                <TwoLine title="Unikal məhsul" subtitle={`${aggregateItems.length} məhsul`} />
                <TwoLine title="Ümumi / rezerv" subtitle={`${aggregateSummary.total} / ${aggregateSummary.reserved} ədəd`} />
                <TwoLine title="Satış üçün dəyər" subtitle={money(aggregateSummary.value)} />
              </div>
              <WarehouseStockToolbar filter={stockFilter} setFilter={setStockFilter} />
              <DataTable
                columns={["Məhsul", "Ümumi", "Rezerv", "Satış üçün", "Anbar paylanması", "Dəyər", "Risk"]}
                rows={visibleItems.map((item) => [
                  <strong>{item.product}</strong>,
                  item.total,
                  item.reserved,
                  getAvailableQuantity(item),
                  <WarehouseDistribution distribution={item.distribution} />,
                  money(getAvailableQuantity(item) * item.price),
                  getAvailableQuantity(item) <= 3 ? <StatusBadge status="Aşağı stok" /> : "Normal",
                ])}
              />
              <WarehouseTransferPanel
                suggestions={visibleTransferSuggestions}
                onTransferStock={onTransferStock}
              />
              <DeliveryOrdersPanel
                orders={deliveryOrders}
                isAllWarehouses={isAllWarehouses}
                onCompleteDelivery={onCompleteDelivery}
              />
            </>
          ) : selectedWarehouse ? (
            <>
              <div className="warehouse-detail-head">
                <div>
                  <h2>{selectedWarehouse.name}</h2>
                  <p>
                    {selectedWarehouse.code} · {selectedWarehouse.type} · {selectedWarehouse.city}
                  </p>
                </div>
                <div className="warehouse-head-actions">
                  <button className="secondary-btn" onClick={() => onEdit(selectedWarehouse.id)}>
                    Redaktə et
                  </button>
                  <button className="secondary-btn danger-outline" onClick={() => onDelete(selectedWarehouse.id)}>
                    Sil
                  </button>
                </div>
              </div>
              <div className="warehouse-info-grid">
                <TwoLine title="Məsul şəxs" subtitle={selectedWarehouse.manager} />
                <TwoLine title="Ünvan" subtitle={selectedWarehouse.address} />
                <TwoLine title="Tutum" subtitle={`${selectedSummary.total} / ${selectedWarehouse.capacity} ədəd`} />
                <TwoLine title="Satış üçün dəyər" subtitle={money(selectedSummary.value)} />
              </div>
              <WarehouseStockToolbar filter={stockFilter} setFilter={setStockFilter} />
              <DataTable
                columns={["Məhsul", "Ümumi", "Rezerv", "Satış üçün", "Qiymət", "Dəyər", "Risk"]}
                rows={visibleItems.map((item) => [
                  <strong>{item.product}</strong>,
                  item.total,
                  item.reserved,
                  getAvailableQuantity(item),
                  money(item.price),
                  money(getAvailableQuantity(item) * item.price),
                  getAvailableQuantity(item) <= 3 ? <StatusBadge status="Aşağı stok" /> : "Normal",
                ])}
              />
              <WarehouseTransferPanel
                suggestions={visibleTransferSuggestions}
                onTransferStock={onTransferStock}
              />
              <DeliveryOrdersPanel
                orders={deliveryOrders}
                isAllWarehouses={isAllWarehouses}
                onCompleteDelivery={onCompleteDelivery}
              />
            </>
          ) : (
            <EmptyState title="Anbar seçilməyib" />
          )}
        </Panel>
      </section>
        </div>
      </details>
    </div>
  );
}

function DeliveriesPage({ orders, advanceOrder, onCompleteDelivery }) {
  const [deliveryFilter, setDeliveryFilter] = useState("Hamısı");
  const [driverFilter, setDriverFilter] = useState("Bütün sürücülər");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(orders[0]?.id || "");
  const deliveryOrders = useMemo(() => orders.map(enrichDeliveryOrder), [orders]);
  const activeOrders = deliveryOrders.filter((order) => order.status !== "Təhvil verilib");
  const readyOrders = deliveryOrders.filter((order) => order.status === "Hazırdır" || order.status === "Təhvilə çıxıb");
  const onRoadOrders = deliveryOrders.filter((order) => order.status === "Yoldadır" || order.status === "Təhvilə çıxıb");
  const riskOrders = deliveryOrders.filter((order) => order.risk === "Gecikmə riski" || order.risk === "Sürücü yoxdur");
  const driverStats = buildDriverDeliveryStats(deliveryOrders);
  const driverOptions = [...new Set(deliveryOrders.map((order) => order.driver).filter((driver) => driver && driver !== "—"))];
  const filterItems = [
    { label: "Hamısı", count: deliveryOrders.length },
    { label: "Aktiv", count: activeOrders.length },
    { label: "Yoldadır", count: deliveryOrders.filter((order) => order.status === "Yoldadır").length },
    { label: "Hazırdır", count: deliveryOrders.filter((order) => order.status === "Hazırdır").length },
    { label: "Təhvilə çıxıb", count: deliveryOrders.filter((order) => order.status === "Təhvilə çıxıb").length },
    { label: "Gecikmə riski", count: riskOrders.length },
    { label: "Tamamlanan", count: deliveryOrders.filter((order) => order.status === "Təhvil verilib").length },
  ];
  const visibleOrders = deliveryOrders.filter((order) => {
    const matchesDriver = driverFilter === "Bütün sürücülər" || order.driver === driverFilter;
    return matchesDeliveryFilter(order, deliveryFilter) && matchesDriver;
  });
  const selectedOrder =
    visibleOrders.find((order) => order.id === selectedDeliveryId) ||
    deliveryOrders.find((order) => order.id === selectedDeliveryId) ||
    visibleOrders[0] ||
    deliveryOrders[0];

  function runDeliveryAction(order) {
    if (!order || order.status === "Təhvil verilib") return;
    if (order.status === "Təhvilə çıxıb") {
      onCompleteDelivery(order.id);
      return;
    }
    advanceOrder(order.id);
  }

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Aktiv təhvillər" value={activeOrders.length} trend={`${readyOrders.length} prioritet`} icon={Truck} tone="primary" />
        <MetricCard
          label="Yoldadır"
          value={onRoadOrders.length}
          trend={`${driverStats.length} sürücü`}
          icon={CalendarClock}
          tone="info"
        />
        <MetricCard
          label="Hazır gözləyir"
          value={readyOrders.length}
          trend={`${riskOrders.length} risk siqnalı`}
          icon={Package}
          tone="warning"
        />
        <MetricCard
          label="Bu ay təhvil"
          value={deliveryOrders.filter((order) => order.status === "Təhvil verilib").length}
          icon={Check}
          tone="success"
        />
      </section>

      <Panel className="delivery-control-panel">
        <PanelHeader title="Təhvil nəzarəti" subtitle="Marşrut, sürücü, risk və mərhələ idarəetməsi" icon={Truck} />
        <div className="delivery-control-grid">
          <div className="delivery-control-tile">
            <span>Bugünkü prioritet</span>
            <strong>{readyOrders.length}</strong>
            <small>Hazır və təhvilə çıxanlar</small>
          </div>
          <div className="delivery-control-tile">
            <span>Gecikmə/risk</span>
            <strong>{riskOrders.length}</strong>
            <small>Nəzarət tələb edir</small>
          </div>
          <div className="delivery-control-tile">
            <span>Ödəniş qalığı</span>
            <strong>{deliveryOrders.filter((order) => order.balance > 0).length}</strong>
            <small>{money(total(deliveryOrders, "balance"))} qalıq</small>
          </div>
          <div className="delivery-control-tile">
            <span>Orta yaş</span>
            <strong>
              {deliveryOrders.length > 0
                ? Math.round(deliveryOrders.reduce((sum, order) => sum + order.ageDays, 0) / deliveryOrders.length)
                : 0}{" "}
              gün
            </strong>
            <small>{formatPaymentDate(parsePaymentDate(currentBusinessDate))} üzrə</small>
          </div>
        </div>
        <div className="delivery-signal-list">
          {riskOrders.slice(0, 4).map((order) => (
            <button key={order.id} className="delivery-signal-row" onClick={() => setSelectedDeliveryId(order.id)}>
              <div>
                <strong>
                  {order.id} · {order.customer}
                </strong>
                <span>
                  {order.risk} · {order.ageDays} gün · {order.driver || "Sürücü yoxdur"}
                </span>
              </div>
              <StatusBadge status={order.risk} />
            </button>
          ))}
          {riskOrders.length === 0 && (
            <div className="delivery-signal-empty">
              <Check size={16} />
              Risk siqnalı yoxdur
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Workflow Tracker — Mərhələlər" subtitle="Zavod → Təhvil verilib" />
        <div className="stage-rail">
          {stages.map((stage, index) => (
            <button
              className={`stage-pill ${deliveryFilter === stage ? "active" : ""}`}
              key={stage}
              onClick={() => setDeliveryFilter(stage)}
            >
              <span>{index + 1}</span>
              <strong>{deliveryOrders.filter((order) => order.status === stage).length}</strong>
              <small>{stage}</small>
            </button>
          ))}
        </div>
      </Panel>

      <section className="delivery-workspace">
        <Panel>
          <PanelHeader title="Sürücü yükü" subtitle="Aktiv marşrut və tamamlanan təhvillər" />
          <div className="driver-load-list">
            {driverStats.map((driver) => (
              <div className="driver-load-row" key={driver.driver}>
                <div className="driver-load-main">
                  <TwoLine title={driver.driver} subtitle={`${driver.active} aktiv · ${driver.completed} tamamlandı`} />
                  <strong>{driver.outForDelivery}</strong>
                </div>
                <ProgressRow value={driver.load} compact />
              </div>
            ))}
            {driverStats.length === 0 && <EmptyState title="Sürücü tapılmadı" />}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Təhvil kartı" subtitle={selectedOrder?.id || "Sifariş seçilməyib"} />
          {selectedOrder ? (
            <div className="delivery-detail-card">
              <div className="delivery-detail-head">
                <div>
                  <h3>{selectedOrder.customer}</h3>
                  <span>{selectedOrder.address}</span>
                </div>
                <StatusBadge status={selectedOrder.risk} />
              </div>
              <div className="delivery-detail-grid">
                <div>
                  <span>Məhsul</span>
                  <strong>{summarizeOrderProducts(selectedOrder)}</strong>
                  <small>{selectedOrder.warehouseName || "Anbar qeyd edilməyib"}</small>
                </div>
                <div>
                  <span>Sürücü</span>
                  <strong>{selectedOrder.driver || "—"}</strong>
                  <small>{selectedOrder.ageDays} gün əvvəl yaradılıb</small>
                </div>
                <div>
                  <span>Ödəniş</span>
                  <strong>{selectedOrder.paymentStatus || getOrderPaymentMethod(selectedOrder)}</strong>
                  <small>{selectedOrder.balance > 0 ? `${money(selectedOrder.balance)} qalıq` : "Qalıq yoxdur"}</small>
                </div>
                <div>
                  <span>Mərhələ</span>
                  <strong>{selectedOrder.status}</strong>
                  <small>{percent(selectedOrder.progress)}</small>
                </div>
              </div>
              <ProgressRow value={selectedOrder.progress} compact />
              <WorkflowSteps activeStage={selectedOrder.status} compact />
              <button
                className="secondary-btn full"
                disabled={selectedOrder.status === "Təhvil verilib"}
                onClick={() => runDeliveryAction(selectedOrder)}
              >
                <ChevronRight size={16} />
                {getDeliveryActionLabel(selectedOrder)}
              </button>
            </div>
          ) : (
            <EmptyState title="Təhvil seçilməyib" />
          )}
        </Panel>
      </section>

      <Panel className="delivery-registry-panel">
        <PanelHeader title="Təhvil reyestri" subtitle="Mərhələ, sürücü və risk üzrə filterləyin" />
        <div className="delivery-filter-toolbar">
          <div className="tabs delivery-filter-tabs">
            {filterItems.map((item) => (
              <button
                key={item.label}
                className={deliveryFilter === item.label ? "active" : ""}
                onClick={() => setDeliveryFilter(item.label)}
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
          <label className="delivery-driver-filter">
            <span>Sürücü</span>
            <select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
              <option>Bütün sürücülər</option>
              {driverOptions.map((driver) => (
                <option key={driver}>{driver}</option>
              ))}
            </select>
          </label>
        </div>
        <DataTable
          columns={["Sifariş", "Müştəri", "Məhsul", "Ünvan", "Sürücü", "Risk", "Mərhələ", "Əməliyyat"]}
          rows={visibleOrders.map((order) => [
            <button
              className={`row-link ${selectedOrder?.id === order.id ? "active" : ""}`}
              onClick={() => setSelectedDeliveryId(order.id)}
            >
              {order.id}
            </button>,
            <TwoLine title={order.customer} subtitle={order.fin} />,
            <TwoLine title={summarizeOrderProducts(order)} subtitle={order.warehouseName || "Anbar yoxdur"} />,
            order.address,
            order.driver || "—",
            <StatusBadge status={order.risk} />,
            <TwoLine title={order.status} subtitle={`${order.ageDays} gün`} />,
            <button
              className="text-btn"
              disabled={order.status === "Təhvil verilib"}
              onClick={() => runDeliveryAction(order)}
            >
              {getDeliveryActionLabel(order)}
            </button>,
          ])}
        />
      </Panel>
    </div>
  );
}

function FinancePage({
  expenses,
  cashEntries,
  orders,
  credits,
  currencyRows = [],
  setExpenseStatus,
  accounts = [],
  openingBalance = 0,
  onCreateAccount,
  onEditAccount,
  onEditExpense,
  onDeleteExpense,
}) {
  const [financeFilter, setFinanceFilter] = useState("Hamısı");
  const [categoryFilter, setCategoryFilter] = useState("Bütün kateqoriyalar");
  const pending = expenses.filter((expense) => expense.status === "Təsdiq gözləyir");
  const approvedExpenses = expenses.filter((expense) => expense.status === "Təsdiq edildi");
  const approvedCashExpenses = approvedExpenses.filter((expense) => hasExpenseCashImpact(expense));
  const pendingCashExpenses = pending.filter((expense) => hasExpenseCashImpact(expense));
  const nonCashExpenseTotal = expenses
    .filter((expense) => !hasExpenseCashImpact(expense))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const ledger = useMemo(() => buildFinanceLedger({ orders, expenses, cashEntries }), [orders, expenses, cashEntries]);
  const financeScenario = useMemo(
    () => buildFinanceScenario({ orders, expenses, credits, cashEntries, openingBalance }),
    [orders, expenses, credits, cashEntries, openingBalance],
  );
  const categoryRows = buildExpenseCategoryRows(expenses);
  const approvedExpenseTotal = total(approvedCashExpenses, "amount");
  const pendingExpenseTotal = total(pendingCashExpenses, "amount");
  const inflowTotal = ledger
    .filter((row) => row.direction === "in")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const creditCashTotal = ledger
    .filter((row) => row.type === "Kredit")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const penaltyIncome = ledger.reduce((sum, row) => sum + Number(row.penalty || 0), 0);
  const cashTotal = Number(openingBalance || 0) + inflowTotal - approvedExpenseTotal;
  const netFlow = inflowTotal - approvedExpenseTotal;
  const expectedCredit = credits.reduce((sum, credit) => {
    if (normalize(credit.status).includes("tamam")) return sum;
    const plan = getCreditDisplayPlan(credit);
    const paymentState = getCreditPaymentState(credit, plan);
    return sum + Number(paymentState.nextInstallment?.amount || 0);
  }, 0);
  const filterItems = [
    { label: "Hamısı", count: ledger.length },
    { label: "Daxilolma", count: ledger.filter((row) => row.direction === "in").length },
    { label: "Satış", count: ledger.filter((row) => row.type === "Satış").length },
    { label: "Kredit", count: ledger.filter((row) => row.type === "Kredit").length },
    { label: "Xərc", count: ledger.filter((row) => row.type === "Xərc").length },
    { label: "Gecikmə gəliri", count: ledger.filter((row) => Number(row.penalty || 0) > 0).length },
    { label: "Təsdiq gözləyir", count: pending.length },
    { label: "Cash təsirsiz", count: ledger.filter((row) => row.direction === "accrual").length },
  ];
  const categoryOptions = ["Bütün kateqoriyalar", ...new Set(ledger.map((row) => row.category).filter(Boolean))];
  const visibleLedger = ledger.filter((row) => {
    const matchesFilter = matchesFinanceFilter(row, financeFilter);
    const matchesCategory = categoryFilter === "Bütün kateqoriyalar" || row.category === categoryFilter;
    return matchesFilter && matchesCategory;
  });
  const maxCategoryTotal = Math.max(1, ...categoryRows.map((row) => row.total));
  const fxExposure = currencyRows.reduce((sum, row) => sum + Math.abs(Number(row.exposureAzn || 0)), 0);

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Cash balans" value={money(cashTotal)} icon={Wallet} tone="success" />
        <MetricCard label="Daxilolma" value={money(inflowTotal)} trend={`${orders.length} satış/kredit mənbəyi`} icon={TrendingUp} tone="primary" />
        <MetricCard label="Real cash çıxışı" value={money(approvedExpenseTotal)} trend={`${money(pendingExpenseTotal)} təsdiqdə · ${money(nonCashExpenseTotal)} cash təsirsiz`} icon={BarChart3} tone="warning" />
        <MetricCard
          label="Kredit kassası"
          value={money(creditCashTotal)}
          trend={`${money(penaltyIncome)} gecikmə gəliri`}
          icon={CreditCard}
          tone="info"
        />
      </section>

      <Panel className="finance-control-panel">
        <PanelHeader title="Maliyyə nəzarəti" subtitle="Kassa, satış, kredit və xərc axınlarının icmalı" icon={Wallet} />
        <div className="finance-control-grid">
          <div className="finance-control-tile">
            <span>Başlanğıc balans</span>
            <strong>{money(openingBalance)}</strong>
            <small>{accounts.length} hesab üzrə</small>
          </div>
          <div className="finance-control-tile">
            <span>Net axın</span>
            <strong>{money(netFlow)}</strong>
            <small>Daxilolma - təsdiqli xərclər</small>
          </div>
          <div className="finance-control-tile">
            <span>Gözlənilən kredit</span>
            <strong>{money(expectedCredit)}</strong>
            <small>Növbəti aylıq ödənişlər</small>
          </div>
          <div className="finance-control-tile">
            <span>Bugün</span>
            <strong>{formatPaymentDate(parsePaymentDate(baseFinanceDate))}</strong>
            <small>{pending.length} təsdiq gözləyir</small>
          </div>
        </div>
        <div className="finance-signal-list">
          {pending.slice(0, 4).map((expense) => (
            <button key={expense.id} className="finance-signal-row" onClick={() => setExpenseStatus(expense.id, "Təsdiq edildi")}>
              <div>
                <strong>{expense.description}</strong>
                <span>
                  {expense.category} · {money(expense.amount)} · kliklə təsdiqlə
                </span>
              </div>
              <StatusBadge status={expense.status} />
            </button>
          ))}
          {pending.length === 0 && (
            <div className="finance-signal-empty">
              <Check size={16} />
              Təsdiq gözləyən xərc yoxdur
            </div>
          )}
        </div>
      </Panel>

      <Panel className="finance-account-panel">
        <div className="warehouse-detail-head">
          <div>
            <h2>Kassa və bank hesabları</h2>
            <p>Açılış balansları hesablar üzrə mühasibat və kassa proqnozuna daxil edilir.</p>
          </div>
          <button className="secondary-btn" onClick={onCreateAccount}>
            <Plus size={16} />
            Hesab əlavə et
          </button>
        </div>
        <DataTable
          columns={["Hesab", "Tip", "Valyuta", "Açılış balansı", "Status", "Əməliyyat"]}
          rows={accounts.map((account) => [
            <TwoLine title={account.name} subtitle={account.code} />,
            account.type,
            account.currency,
            <strong>{money(account.openingBalance)}</strong>,
            <StatusBadge status={account.status} />,
            <button className="text-btn" onClick={() => onEditAccount(account.id)}>Redaktə</button>,
          ])}
        />
      </Panel>

      <Panel className="finance-scenario-panel">
        <PanelHeader
          title="İdarəetmə uçotu"
          subtitle="P&L, debitor qalıqları və təsdiq gözləyən xərclərin kassaya təsiri"
          icon={BarChart3}
        />
        <div className="finance-scenario-grid">
          <div>
            <span>Brüt satış</span>
            <strong>{money(financeScenario.grossSales)}</strong>
            <small>Satış modulu üzrə</small>
          </div>
          <div>
            <span>Təxmini maya</span>
            <strong>{money(financeScenario.estimatedCost)}</strong>
            <small>68% məhsul maya modeli</small>
          </div>
          <div>
            <span>Brüt mənfəət</span>
            <strong>{money(financeScenario.grossProfit)}</strong>
            <small>{percent(financeScenario.margin)} marja</small>
          </div>
          <div>
            <span>Debitor portfeli</span>
            <strong>{money(financeScenario.creditBalance)}</strong>
            <small>Kredit qalıqları</small>
          </div>
          <div>
            <span>Gözləyən xərclərdən sonra</span>
            <strong>{money(financeScenario.cashAfterPending)}</strong>
            <small>Kassa proqnozu</small>
          </div>
        </div>
      </Panel>

      <Panel className="finance-currency-panel">
        <PanelHeader
          title="Multi-valyuta nəzarəti"
          subtitle="Satış, yığım və açıq kredit portfeli üzrə AZN/USD/EUR ekvivalenti"
          icon={Wallet}
        />
        <div className="finance-scenario-grid">
          <div>
            <span>FX risk</span>
            <strong>{money(fxExposure)}</strong>
            <small>Açıq portfel üzrə təxmini təsir</small>
          </div>
          <div>
            <span>Valyuta sayı</span>
            <strong>{currencyRows.length}</strong>
            <small>Aktiv kurs masası</small>
          </div>
          <div>
            <span>Baza valyuta</span>
            <strong>AZN</strong>
            <small>Kassa və mühasibat bazası</small>
          </div>
        </div>
        <DataTable
          columns={["Valyuta", "Kurs", "Satış ekvivalenti", "Yığım ekvivalenti", "FX təsir", "Status"]}
          rows={currencyRows.map((row) => [
            <TwoLine title={row.code} subtitle={row.name} />,
            row.rate,
            `${row.salesEquivalent} ${row.code}`,
            `${row.collectedEquivalent} ${row.code}`,
            money(row.exposureAzn),
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>

      <section className="dashboard-grid">
        <Panel>
          <PanelHeader title="Xərc kateqoriyaları" subtitle="Təsdiqli, gözləyən və imtina edilmiş xərclər" />
          <div className="finance-category-list">
            {categoryRows.map((row) => (
              <div className="finance-category-row" key={row.category}>
                <div className="finance-category-main">
                  <TwoLine title={row.category} subtitle={`${money(row.approved)} təsdiqli · ${money(row.pending)} gözləyir`} />
                  <strong>{money(row.total)}</strong>
                </div>
                <ProgressRow value={(row.total / maxCategoryTotal) * 100} compact />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="span-2">
          <PanelHeader title="Xərc təsdiq növbəsi" subtitle="Rəhbərlik təsdiqi və imtina axını" />
          <DataTable
            columns={["Təsvir", "Kateqoriya", "Tarix", "Məbləğ", "Status", "Əməliyyat"]}
            rows={expenses.map((expense) => [
              <strong>{expense.description}</strong>,
              expense.category,
              expense.date,
              money(expense.amount),
              <StatusBadge status={expense.status} />,
              <div className="row-actions operation-table-actions">
                {expense.status === "Təsdiq gözləyir" && (
                  <>
                    <button className="text-btn" onClick={() => setExpenseStatus(expense.id, "Təsdiq edildi")}>
                      Təsdiq
                    </button>
                    <button className="text-btn danger" onClick={() => setExpenseStatus(expense.id, "İmtina edildi")}>
                      İmtina
                    </button>
                  </>
                )}
                <button className="text-btn" onClick={() => onEditExpense(expense.id)}>Redaktə</button>
                <button className="text-btn danger" onClick={() => onDeleteExpense(expense.id)}>Sil</button>
              </div>,
            ])}
          />
        </Panel>
      </section>

      <Panel className="finance-ledger-panel">
        <PanelHeader title="Kassa axını" subtitle="Satış, kredit ödənişi və xərclər vahid reyestrdə" />
        <div className="finance-filter-toolbar">
          <div className="tabs finance-filter-tabs">
            {filterItems.map((item) => (
              <button
                key={item.label}
                className={financeFilter === item.label ? "active" : ""}
                onClick={() => setFinanceFilter(item.label)}
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
          <label className="finance-category-filter">
            <span>Kateqoriya</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
        <DataTable
          columns={["Tarix", "Tip", "Mənbə", "Müştəri/Təsvir", "Əsas", "Gecikmə", "Məbləğ", "Status"]}
          rows={visibleLedger.map((row) => [
            row.date,
            <StatusBadge status={row.type} />,
            <TwoLine title={row.title} subtitle={row.description} />,
            row.party,
            row.principal > 0 ? money(row.principal) : "—",
            row.penalty > 0 ? money(row.penalty) : "—",
            <strong className={`finance-amount ${row.direction}`}>
              {row.direction === "out" ? "-" : row.direction === "in" ? "+" : ""}
              {money(row.amount)}
            </strong>,
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Kredit kassa daxilolmaları" subtitle="Əsas məbləğ və gecikmə gəliri ayrı izlənir" />
        <DataTable
          columns={["Tarix", "Müştəri", "Kredit", "Müqavilə", "Əsas", "Gecikmə", "Kassa"]}
          rows={cashEntries.map((entry) => [
            entry.date,
            <strong>{entry.customer}</strong>,
            entry.creditId,
            entry.contractId || "—",
            money(entry.principal),
            money(entry.penalty),
            <StatusBadge status={money(entry.amount)} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function InvoicesPage({ invoices, summary, invoiceSettings = {}, onExport }) {
  const [invoiceFilter, setInvoiceFilter] = useState("Hamısı");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const exportInvoices = () => {
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Faktura", "Sifaris", "Musteri", "FIN", "Mehsullar", "Net", "EDV", "Cemi", "Qaliq", "E-qaimə"],
      ...visibleInvoices.map((invoice) => [
        invoice.id,
        invoice.orderId,
        invoice.customer,
        invoice.fin,
        invoice.products,
        invoice.netAmount,
        invoice.vatAmount,
        invoice.totalAmount,
        invoice.balance,
        invoice.eTaxStatus,
      ]),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `fakturalar-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    onExport?.(`Faktura PDF/Excel (${visibleInvoices.length} faktura)`);
  };
  const filterItems = [
    { label: "Hamısı", count: invoices.length },
    { label: "Ödənilib", count: invoices.filter((invoice) => invoice.status === "Ödənilib").length },
    {
      label: "Qismən ödənilib",
      count: invoices.filter((invoice) => invoice.status === "Qismən ödənilib").length,
    },
    {
      label: "Ödəniş gözləyir",
      count: invoices.filter((invoice) => invoice.status === "Ödəniş gözləyir").length,
    },
    {
      label: "Göndərişə hazır",
      count: invoices.filter((invoice) => invoice.eTaxStatus === "Göndərişə hazır").length,
    },
  ];
  const visibleInvoices = invoices.filter((invoice) => {
    if (invoiceFilter === "Hamısı") return true;
    if (invoiceFilter === "Göndərişə hazır") return invoice.eTaxStatus === invoiceFilter;
    return invoice.status === invoiceFilter;
  });

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Faktura sayı" value={summary.count} icon={FileText} tone="primary" />
        <MetricCard label="Ümumi məbləğ" value={money(summary.total)} icon={Wallet} tone="success" />
        <MetricCard label="ƏDV" value={money(summary.vat)} icon={BarChart3} tone="info" />
        <MetricCard label="Açıq qalıq" value={money(summary.balance)} icon={CircleAlert} tone="warning" />
      </section>

      <Panel className="invoice-control-panel">
        <PanelHeader
          title="E-qaimə idarə paneli"
          subtitle="Satış sifarişlərindən avtomatik formalaşan faktura və ƏDV bölgüsü"
          icon={FileText}
        />
        <div className="finance-control-grid">
          <div className="finance-control-tile">
            <span>Prefiks</span>
            <strong>{invoiceSettings.prefix || "EQ"}</strong>
            <small>{invoiceSettings.eTaxMode || "E-qaimə inteqrasiya rejimi"}</small>
          </div>
          <div className="finance-control-tile">
            <span>ƏDV dərəcəsi</span>
            <strong>{invoiceSettings.vatRate || 18}%</strong>
            <small>Satış məbləğindən ayrılır</small>
          </div>
          <div className="finance-control-tile">
            <span>Göndərişə hazır</span>
            <strong>{summary.ready}</strong>
            <small>E-tax növbəsi</small>
          </div>
          <div className="finance-control-tile">
            <span>Ödənilib</span>
            <strong>{money(summary.paid)}</strong>
            <small>Kassaya düşən fakturalar</small>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="finance-filter-toolbar">
          <div className="tabs finance-filter-tabs">
            {filterItems.map((item) => (
              <button
                key={item.label}
                className={invoiceFilter === item.label ? "active" : ""}
                onClick={() => setInvoiceFilter(item.label)}
              >
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
          <button className="secondary-btn" onClick={exportInvoices}>
            <Download size={16} />
            PDF/Excel
          </button>
        </div>
        <DataTable
          columns={["Faktura", "Sifariş", "Müştəri", "Məhsul", "Net", "ƏDV", "Cəmi", "Qalıq", "E-qaimə", "Əməliyyat"]}
          rows={visibleInvoices.map((invoice) => [
            <TwoLine title={invoice.id} subtitle={invoice.date} />,
            <TwoLine title={invoice.orderId} subtitle={invoice.contractId} />,
            <TwoLine title={invoice.customer} subtitle={`FİN ${invoice.fin}`} />,
            invoice.products,
            money(invoice.netAmount),
            money(invoice.vatAmount),
            <strong>{money(invoice.totalAmount)}</strong>,
            invoice.balance > 0 ? money(invoice.balance) : "Yoxdur",
            <StatusBadge status={invoice.eTaxStatus} />,
            <button className="text-btn" onClick={() => setSelectedInvoice(invoice)}>
              Çap/PDF
            </button>,
          ])}
        />
      </Panel>
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          invoiceSettings={invoiceSettings}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

function InvoicePrintModal({ invoice, invoiceSettings = {}, onClose }) {
  function downloadHtml() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.id}</title></head><body><h1>${invoice.id}</h1><p>${invoice.customer}</p><p>${invoice.products}</p><p>Cəmi: ${money(invoice.totalAmount)}</p><p>ƏDV: ${money(invoice.vatAmount)}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card invoice-print-card">
        <div className="modal-head">
          <div>
            <h2>{invoice.id}</h2>
            <p>Faktura/e-qaimə çap görünüşü və HTML/PDF export hazırlığı.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <section className="invoice-paper">
          <div className="invoice-paper-head">
            <div>
              <span>Satıcı</span>
              <strong>{invoice.seller}</strong>
              <small>VÖEN {invoice.voen}</small>
            </div>
            <div>
              <span>Faktura</span>
              <strong>{invoice.id}</strong>
              <small>{invoice.date} · {invoice.currency}</small>
            </div>
          </div>
          <div className="invoice-paper-grid">
            <TwoLine title="Alıcı" subtitle={`${invoice.customer} · FİN ${invoice.fin}`} />
            <TwoLine title="Sifariş/Müqavilə" subtitle={`${invoice.orderId} · ${invoice.contractId}`} />
            <TwoLine title="Ödəniş tipi" subtitle={invoice.paymentMethod} />
            <TwoLine title="Son tarix" subtitle={invoice.dueDate} />
          </div>
          <div className="invoice-product-box">
            <span>Məhsul/Xidmət</span>
            <strong>{invoice.products}</strong>
          </div>
          <div className="invoice-total-grid">
            <TwoLine title="Net məbləğ" subtitle={money(invoice.netAmount)} />
            <TwoLine title={`ƏDV ${invoiceSettings.vatRate || 18}%`} subtitle={money(invoice.vatAmount)} />
            <TwoLine title="Cəmi" subtitle={money(invoice.totalAmount)} />
            <TwoLine title="Qalıq" subtitle={invoice.balance > 0 ? money(invoice.balance) : "Yoxdur"} />
          </div>
          <StatusBadge status={invoice.eTaxStatus} />
        </section>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={downloadHtml}>
            <Download size={16} />
            HTML export
          </button>
          <button type="button" className="primary-btn" onClick={() => window.print()}>
            <FileText size={16} />
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractPrintModal({ contract, settings = {}, onClose }) {
  function downloadDocument() {
    const content = `<!doctype html><html><head><meta charset="utf-8"><title>${contract.id}</title></head><body><h1>${settings.company || "ERP+CRM AZ"}</h1><h2>Satış müqaviləsi ${contract.id}</h2><p><strong>Müştəri:</strong> ${contract.customer}</p><p><strong>FİN:</strong> ${contract.fin || "—"}</p><p><strong>Məhsul:</strong> ${contract.product}</p><p><strong>Məbləğ:</strong> ${money(contract.amount)}</p><p><strong>Status:</strong> ${contract.status}</p><p>Bu sənəd ERP+CRM AZ sistemində formalaşdırılmışdır.</p></body></html>`;
    const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${contract.id}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-shell print-modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card invoice-print-card">
        <div className="modal-head no-print">
          <div>
            <h2>Müqavilə sənədi</h2>
            <p>PDF üçün çap dialoqundan “Save as PDF” seçin və ya Word sənədini endirin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <article className="invoice-paper">
          <div className="invoice-paper-head">
            <div>
              <strong>{settings.company || "ERP+CRM AZ"}</strong>
              <span>{settings.voen ? `VÖEN: ${settings.voen}` : ""}</span>
            </div>
            <div><strong>MÜQAVİLƏ</strong><span>{contract.id}</span></div>
          </div>
          <div className="invoice-meta-grid">
            <TwoLine title="Müştəri" subtitle={contract.customer} />
            <TwoLine title="FİN" subtitle={contract.fin || "—"} />
            <TwoLine title="Məhsul" subtitle={contract.product} />
            <TwoLine title="Məbləğ" subtitle={money(contract.amount)} />
          </div>
          <p className="contract-body-copy">Tərəflər məhsulun təhvil verilməsi, ödəniş və zəmanət şərtlərinin bu müqavilə üzrə tətbiq olunduğunu təsdiq edir.</p>
          <div className="contract-signatures"><span>Satıcı imzası</span><span>Müştəri imzası</span></div>
        </article>
        <div className="modal-actions no-print">
          <button className="secondary-btn" onClick={downloadDocument}><Download size={16} /> Word sənədi</button>
          <button className="primary-btn" onClick={() => window.print()}><FileText size={16} /> Print / PDF</button>
        </div>
      </div>
    </div>
  );
}

function AccountingPage({ accounting, closeRun }) {
  const { balance, pl, cashFlow, journalRows, chartRows } = accounting;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Aktivlər" value={money(balance.assets)} icon={Wallet} tone="primary" />
        <MetricCard label="Öhdəliklər" value={money(balance.liabilities)} icon={CircleAlert} tone="warning" />
        <MetricCard label="Kapital" value={money(balance.equity)} icon={ShieldCheck} tone="success" />
        <MetricCard label="Net mənfəət" value={money(pl.netProfit)} trend={percent(pl.margin)} icon={TrendingUp} tone="info" />
      </section>

      {closeRun && (
        <Panel className="module-action-panel">
          <PanelHeader title="Son jurnal exportu" subtitle="Mühasibat bağlanışı üçün hazırlanan son əməliyyat" icon={FileText} />
          <div className="db-status-grid">
            <div>
              <span>Dövr</span>
              <strong>{closeRun.period}</strong>
            </div>
            <div>
              <span>Export vaxtı</span>
              <strong>{closeRun.exportedAt}</strong>
            </div>
            <div>
              <span>Jurnal sətri</span>
              <strong>{closeRun.journalCount}</strong>
            </div>
            <div>
              <span>Net mənfəət</span>
              <strong>{money(closeRun.netProfit)}</strong>
            </div>
          </div>
        </Panel>
      )}

      <section className="accounting-statement-grid">
        <Panel>
          <PanelHeader title="Balans" subtitle="Aktiv, öhdəlik və kapitalın qısa görünüşü" icon={BarChart3} />
          <div className="statement-list">
            <TwoLine title="Aktivlər" subtitle={money(balance.assets)} />
            <TwoLine title="Öhdəliklər" subtitle={money(balance.liabilities)} />
            <TwoLine title="Kapital" subtitle={money(balance.equity)} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="P&L" subtitle="Satış, maya, xərc və mənfəət" icon={TrendingUp} />
          <div className="statement-list">
            <TwoLine title="Satış gəliri" subtitle={money(pl.revenue)} />
            <TwoLine title="Maya dəyəri" subtitle={money(pl.costOfGoods)} />
            <TwoLine title="Əməliyyat xərci" subtitle={money(pl.operatingExpenses)} />
            <TwoLine title="Net mənfəət" subtitle={money(pl.netProfit)} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Cash flow" subtitle="Açılış, daxilolma, çıxış və bağlanış" icon={Wallet} />
          <div className="statement-list">
            <TwoLine title="Açılış" subtitle={money(cashFlow.opening)} />
            <TwoLine title="Daxilolma" subtitle={money(cashFlow.inflow)} />
            <TwoLine title="Çıxış" subtitle={money(cashFlow.outflow)} />
            <TwoLine title="Bağlanış" subtitle={money(cashFlow.closing)} />
          </div>
        </Panel>
      </section>

      <Panel>
        <PanelHeader title="Hesablar planı" subtitle="IFRS məntiqinə yaxınlaşdırılmış əməliyyat hesab qalıqları" />
        <DataTable
          columns={["Kod", "Hesab", "Tip", "Debet", "Kredit", "Qalıq"]}
          rows={chartRows.map((row) => [
            <strong>{row.code}</strong>,
            row.account,
            <StatusBadge status={row.type} />,
            row.debit > 0 ? money(row.debit) : "—",
            row.credit > 0 ? money(row.credit) : "—",
            <strong>{money(row.balance)}</strong>,
          ])}
        />
      </Panel>

      <Panel>
        <PanelHeader title="Jurnal yazılışları" subtitle="Satış, kredit kassası və xərc əməliyyatlarının ikili yazılışı" />
        <DataTable
          columns={["Tarix", "Mənbə", "Debet", "Kredit", "Məbləğ", "Status"]}
          rows={journalRows.map((row) => [
            row.date,
            <strong>{row.source}</strong>,
            row.debit,
            row.credit,
            money(row.amount),
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function TaxPage({ taxRows, payrollTaxRows, invoiceSummary, accounting }) {
  const overdue = taxRows.filter((row) => row.status === "Gecikib");
  const soon = taxRows.filter((row) => row.status === "Bu gün" || row.status === "Yaxınlaşır");
  const payrollLiability = payrollTaxRows.reduce(
    (sum, row) =>
      sum +
      Number(row.incomeTax || 0) +
      Number(row.employeeSocial || 0) +
      Number(row.employeeUnemployment || 0) +
      Number(row.employerSocial || 0) +
      Number(row.employerUnemployment || 0),
    0,
  );
  const employerCost = total(payrollTaxRows, "employerCost");

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Yaxın öhdəlik" value={soon.length} icon={CalendarClock} tone="warning" />
        <MetricCard label="Gecikən" value={overdue.length} icon={CircleAlert} tone={overdue.length ? "danger" : "success"} />
        <MetricCard label="ƏDV bazası" value={money(invoiceSummary.vat)} icon={FileText} tone="info" />
        <MetricCard label="Payroll vergi/DSMF" value={money(payrollLiability)} icon={UserCog} tone="primary" />
      </section>

      <Panel>
        <PanelHeader title={`${currentBusinessYear} vergi təqvimi`} subtitle={`Bugünkü nəzarət tarixi: ${formatPaymentDate(parsePaymentDate(currentBusinessDate))}`} icon={CalendarClock} />
        <DataTable
          columns={["Öhdəlik", "Dövr", "Son tarix", "Qalan gün", "Təxmini məbləğ", "Məsul", "Status"]}
          rows={taxRows.map((row) => [
            <TwoLine title={row.title} subtitle={row.type} />,
            row.period,
            row.dueDate,
            row.daysLeft >= 0 ? `${row.daysLeft} gün` : `${Math.abs(row.daysLeft)} gün gecikib`,
            money(row.amount),
            row.owner,
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>

      <section className="accounting-statement-grid">
        <Panel>
          <PanelHeader title="ƏDV icmalı" subtitle="Faktura modulundan gələn ƏDV hesabı" />
          <div className="statement-list">
            <TwoLine title="Satış ƏDV" subtitle={money(invoiceSummary.vat)} />
            <TwoLine title="ƏDV öhdəliyi" subtitle={money(accounting.vatPayable)} />
            <TwoLine title="E-qaimə sayı" subtitle={`${invoiceSummary.count} faktura`} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Əmək haqqı kalkulyatoru" subtitle={`${currentBusinessYear} vergi, DSMF və işəgötürən xərci`} />
          <div className="statement-list">
            <TwoLine title="İşəgötürən xərci" subtitle={money(employerCost)} />
            <TwoLine title="Tutulmalar" subtitle={money(payrollLiability)} />
            <TwoLine title="Əməkdaş sayı" subtitle={payrollTaxRows.length} />
          </div>
        </Panel>
      </section>

      <Panel>
        <PanelHeader title="Payroll vergi hesabı" subtitle="Gross, gəlir vergisi, sosial ödəniş və net əmək haqqı" />
        <DataTable
          columns={["Əməkdaş", "Şöbə", "Gross", "Gəlir vergisi", "İşçi DSMF/işsizlik", "Net", "İşəgötürən xərci"]}
          rows={payrollTaxRows.map((row) => [
            <strong>{row.employee}</strong>,
            row.department,
            money(row.gross),
            money(row.incomeTax),
            money(row.employeeSocial + row.employeeUnemployment),
            <strong>{money(row.net)}</strong>,
            money(row.employerCost),
          ])}
        />
      </Panel>
    </div>
  );
}

function ApiPage({ webhooks, dbMeta = {}, auditLog = [] }) {
  const activeHooks = webhooks.filter((webhook) => webhook.status === "Aktiv");
  const queueTotal = total(webhooks, "queueCount");

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Endpoint" value={webhooks.length} icon={ShieldCheck} tone="primary" />
        <MetricCard label="Aktiv webhook" value={activeHooks.length} icon={Check} tone="success" />
        <MetricCard label="Göndəriş növbəsi" value={queueTotal} icon={Bell} tone="warning" />
        <MetricCard label="Audit yazısı" value={auditLog.length} icon={FileText} tone="info" />
      </section>

      <Panel className="api-console-panel">
        <PanelHeader
          title="API konsolu"
          subtitle="Satış, faktura, kredit, anbar və PO hadisələri üçün webhook idarəetməsi"
          icon={ShieldCheck}
        />
        <div className="db-status-grid">
          <div>
            <span>DB provider</span>
            <strong>{dbMeta.provider || "Local persistent DB"}</strong>
          </div>
          <div>
            <span>Son əməliyyat</span>
            <strong>{dbMeta.lastAction || "—"}</strong>
          </div>
          <div>
            <span>Versiya</span>
            <strong>{dbMeta.version || 1}</strong>
          </div>
          <div>
            <span>Queue</span>
            <strong>{queueTotal}</strong>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Webhook qaydaları" subtitle="Hadisə, endpoint, növbə və son payload" />
        <DataTable
          columns={["Qayda", "Event", "Endpoint", "Növbə", "Son payload", "Son test", "Məsul", "Status"]}
          rows={webhooks.map((webhook) => [
            <TwoLine title={webhook.name} subtitle={webhook.id} />,
            <StatusBadge status={webhook.event} />,
            webhook.target,
            <strong>{webhook.queueCount}</strong>,
            webhook.lastPayload,
            webhook.lastTestAt || "—",
            webhook.owner,
            <StatusBadge status={webhook.health} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function CreditsPage({ credits, sendCreditSms, onUpdatePaymentDate, onReceivePayment, onCreateCredit }) {
  const [creditFilter, setCreditFilter] = useState("Hamısı");
  const [sourceFilter, setSourceFilter] = useState("Bütün mənbələr");
  const [monthFilter, setMonthFilter] = useState("Bütün aylar");
  const [yearFilter, setYearFilter] = useState(String(currentBusinessYear));
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [detailCreditId, setDetailCreditId] = useState("");
  const enrichedCredits = useMemo(
    () =>
      credits.map((credit) => {
        const plan = getCreditDisplayPlan(credit);
        const paymentState = getCreditPaymentState(credit, plan);
        const progress =
          credit.rate ?? Math.round((Number(credit.paidMonths || 0) / Math.max(1, plan.months)) * 100);

        return { credit, plan, paymentState, progress };
      }),
    [credits],
  );
  const activeCredits = enrichedCredits.filter((item) => normalize(item.credit.status).includes("aktiv"));
  const todayCredits = enrichedCredits.filter((item) => item.paymentState.isDueToday);
  const overdueCredits = enrichedCredits.filter((item) => item.paymentState.isOverdue);
  const completedCredits = enrichedCredits.filter((item) => normalize(item.credit.status).includes("tamam"));
  const salesCredits = enrichedCredits.filter((item) => getCreditSourceLabel(item.credit) === "Satışdan gələn");
  const monthlyDue = enrichedCredits.reduce((sum, item) => {
    if (normalize(item.credit.status).includes("tamam")) return sum;
    return sum + Number(item.paymentState.nextInstallment?.amount || 0);
  }, 0);
  const overdueAmount = overdueCredits.reduce(
    (sum, item) => sum + Number(item.paymentState.nextInstallment?.amount || 0),
    0,
  );
  const portfolioBalance = enrichedCredits.reduce((sum, item) => sum + Number(item.plan.balance || 0), 0);
  const paidTotal = enrichedCredits.reduce((sum, item) => sum + getCreditPaidTotal(item.plan), 0);
  const averageMonthly = activeCredits.length ? Math.round(monthlyDue / activeCredits.length) : 0;
  const currentMonthCredits = enrichedCredits.filter((item) => matchesCreditManagementFilter(item, "Cari ay"));
  const filterItems = [
    { label: "Hamısı", title: "Hamısı", count: enrichedCredits.length, tone: "primary" },
    { label: "Aktiv", title: "Aktiv", count: activeCredits.length, tone: "success" },
    { label: "Gözləyən", title: "Gözləyən", count: enrichedCredits.filter((item) => matchesCreditManagementFilter(item, "Gözləyən")).length, tone: "warning" },
    { label: "Gecikmiş", title: "Gecikmiş", count: overdueCredits.length, tone: "danger" },
    { label: "Bağlanmış", title: "Bağlanmış", count: completedCredits.length, tone: "info" },
    { label: "Bugünkü", title: "Bugünkü", count: todayCredits.length, tone: "neutral" },
    { label: "Cari ay", title: "Cari ay", count: currentMonthCredits.length, tone: "neutral" },
  ];
  const sourceFilters = ["Bütün mənbələr", "Satışdan gələn", "Manual kredit"];
  const yearOptions = [
    ...new Set(
      enrichedCredits
        .map((item) => getCreditRowDate(item)?.getFullYear())
        .filter(Boolean)
        .map((year) => String(year))
        .concat(String(currentBusinessYear)),
    ),
  ].sort((a, b) => Number(b) - Number(a));
  const visibleCredits = enrichedCredits
    .filter((item) => {
      const date = getCreditRowDate(item);
      const matchesMonth = monthFilter === "Bütün aylar" || (date && monthNamesAz[date.getMonth()] === monthFilter);
      const matchesYear = yearFilter === "Bütün illər" || (date && String(date.getFullYear()) === String(yearFilter));
      return (
        matchesCreditManagementFilter(item, creditFilter) &&
        matchesCreditSourceFilter(item, sourceFilter) &&
        matchesCreditSearch(item, searchTerm) &&
        matchesMonth &&
        matchesYear
      );
    })
    .sort((a, b) => {
      if (a.paymentState.isOverdue !== b.paymentState.isOverdue) return a.paymentState.isOverdue ? -1 : 1;
      const dateA = getCreditRowDate(a)?.getTime() || 0;
      const dateB = getCreditRowDate(b)?.getTime() || 0;
      return dateA - dateB;
    });
  const tableCredits = visibleCredits.slice(0, pageSize);
  const detailItem = detailCreditId ? enrichedCredits.find((item) => item.credit.id === detailCreditId) : null;
  const todayLabel = formatPaymentDate(parsePaymentDate(baseCreditDate));
  const resetFilters = () => {
    setCreditFilter("Hamısı");
    setSourceFilter("Bütün mənbələr");
    setMonthFilter("Bütün aylar");
    setYearFilter(String(currentBusinessYear));
    setSearchTerm("");
    setPageSize(10);
  };
  const applyFilters = () => {
    setSearchTerm((value) => value.trim());
  };
  const exportVisibleCredits = () => {
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Kod", "Müştəri", "FIN", "Müqavilə", "Cihaz", "Məbləğ", "Qalıq", "Aylıq", "Növbəti tarix", "Status", "Gecikmə", "Mənbə"],
      ...visibleCredits.map((item) => {
        const { credit, plan, paymentState } = item;
        return [
          credit.id,
          credit.customer,
          credit.fin,
          credit.contractId,
          credit.device || credit.product,
          plan.total,
          plan.balance,
          paymentState.nextInstallment?.amount || plan.monthly,
          paymentState.nextInstallment?.due || credit.next,
          getCreditManagementStatus(item),
          paymentState.isOverdue ? `${paymentState.daysOverdue} gün` : "",
          getCreditSourceLabel(credit),
        ];
      }),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `kreditler-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Aktiv kreditlər" value={activeCredits.length} icon={CreditCard} tone="primary" />
        <MetricCard label="Portfel qalığı" value={money(portfolioBalance)} trend={`${money(paidTotal)} ödənilib`} icon={Wallet} tone="success" />
        <MetricCard label="Bu ay yığım" value={money(monthlyDue)} trend={`Orta ${money(averageMonthly)}`} icon={CalendarClock} tone="info" />
        <MetricCard label="Gecikmiş" value={overdueCredits.length} trend={money(overdueAmount)} icon={CircleAlert} tone="danger" />
      </section>

      <section className="credit-management-shell">
        <div className="credit-management-topline">
          <div>
            <h2>Portfel siyahısı</h2>
            <p>Kreditləri prioritet, tarix və mənbə üzrə idarə edin.</p>
          </div>
          <div className="credit-management-summary" aria-label="Kredit portfeli xülasəsi">
            <span><strong>{visibleCredits.length}</strong> nəticə</span>
            <span><strong>{todayCredits.length}</strong> bu gün</span>
            <span><strong>{salesCredits.length}</strong> satışdan</span>
          </div>
        </div>

        <div className="credit-status-strip">
          {filterItems.map((item) => (
            <button
              key={item.label}
              className={`credit-status-chip ${item.tone} ${creditFilter === item.label ? "active" : ""}`}
              onClick={() => setCreditFilter(item.label)}
            >
              <span>{item.title}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </div>

        <Panel className="credit-directory-panel">
          <div className="credit-directory-head">
            <div>
              <h3>
                <CreditCard size={17} />
                Kredit siyahısı
              </h3>
              <span>{todayLabel} tarixinə portfel icmalı</span>
            </div>
            <strong>{visibleCredits.length} kredit</strong>
          </div>

          <div className="credit-directory-filters">
            <label>
              <span>Göstər</span>
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Ay</span>
              <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                <option>Bütün aylar</option>
                {monthNamesAz.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </select>
            </label>
            <label>
              <span>İl</span>
              <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option>Bütün illər</option>
                {yearOptions.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="credit-search-field">
              <span>Axtarış</span>
              <div>
                <Search size={15} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Müştəri, kredit kodu, müqavilə..."
                />
              </div>
            </label>
            <label>
              <span>Mənbə</span>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                {sourceFilters.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button className="primary-btn icon-only" title="Filterləri tətbiq et" type="button" onClick={applyFilters}>
              <Filter size={16} />
            </button>
            <button className="secondary-btn icon-only" title="Filterləri sıfırla" type="button" onClick={resetFilters}>
              <RefreshCw size={16} />
            </button>
            <button className="secondary-btn credit-excel-btn" type="button" onClick={exportVisibleCredits}>
              <Download size={16} />
              Excel
            </button>
          </div>

          <DataTable
            columns={["#", "Müştəri / müqavilə", "Qalıq", "Növbəti ödəniş", "Status", "Mənbə", "Əməl."]}
            rows={tableCredits.map((item, index) => {
              const { credit, plan, paymentState } = item;
              const nextAmount = Number(paymentState.nextInstallment?.amount || 0);
              const paid = getCreditPaidTotal(plan);
              const compactCode = String(credit.id || "").replace(/\D/g, "").slice(-4) || credit.id;
              const customerMeta = [credit.fin, credit.contractId, credit.device || credit.product].filter(Boolean).join(" · ");
              return [
                index + 1,
                <div className="credit-customer-cell">
                  <span className="credit-avatar">{getCreditInitials(credit.customer)}</span>
                  <div className="credit-customer-copy">
                    <strong>{credit.customer}</strong>
                    <span>
                      <b>#{compactCode}</b>
                      {customerMeta ? ` · ${customerMeta}` : ""}
                    </span>
                  </div>
                </div>,
                <TwoLine title={money(plan.balance)} subtitle={`Ümumi ${money(plan.total)} · ödənilib ${money(paid)}`} />,
                <TwoLine title={paymentState.nextInstallment?.due || credit.next || "—"} subtitle={nextAmount > 0 ? `${money(nextAmount)} aylıq` : "Plan tamamlanıb"} />,
                <div className="credit-status-stack">
                  <StatusBadge status={getCreditManagementStatus(item)} />
                  {paymentState.isOverdue && <strong className="credit-overdue-days">{paymentState.daysOverdue} gün gecikmə</strong>}
                </div>,
                <StatusBadge status={getCreditSourceLabel(credit)} />,
                <div className="credit-table-actions">
                  <button className="icon-btn" title="Kredit kartına bax" onClick={() => setDetailCreditId(credit.id)}>
                    <Eye size={16} />
                  </button>
                  <button className="icon-btn" title="Ödəniş tarixçəsi" onClick={() => setDetailCreditId(credit.id)}>
                    <RefreshCw size={16} />
                  </button>
                </div>,
              ];
            })}
          />
        </Panel>

        {detailItem ? (
          <CreditDetailModal
            item={detailItem}
            sendCreditSms={sendCreditSms}
            onUpdatePaymentDate={onUpdatePaymentDate}
            onReceivePayment={onReceivePayment}
            onClose={() => setDetailCreditId("")}
          />
        ) : null}
      </section>
    </div>
  );
}

function CreditListRow({ item, active, onSelect }) {
  const { credit, plan, paymentState } = item;
  const statusText = paymentState.isOverdue
    ? `${paymentState.daysOverdue} gün gecikib`
    : paymentState.isDueToday
      ? "Bu gün"
      : credit.status;
  const sourceLabel = getCreditSourceLabel(credit);

  return (
    <button
      className={`credit-list-row ${active ? "active" : ""} ${paymentState.isOverdue ? "overdue" : ""}`}
      onClick={onSelect}
    >
      <div className="credit-list-main">
        <strong>{credit.customer}</strong>
        <span>
          {credit.id} · {credit.contractId || "Müqaviləsiz"}
        </span>
      </div>
      <div className="credit-list-meta">
        <span>{credit.device || credit.product || "Cihaz qeyd edilməyib"}</span>
        <strong>{money(paymentState.nextInstallment?.amount || plan.monthly)}</strong>
      </div>
      <div className="credit-list-extra">
        <span>{sourceLabel}</span>
        <strong>{money(plan.balance)} qalıq</strong>
      </div>
      <StatusBadge status={statusText} />
    </button>
  );
}

function CreditDetailModal({ item, sendCreditSms, onUpdatePaymentDate, onReceivePayment, onClose }) {
  const { credit } = item;

  return (
    <div className="modal-shell credit-detail-modal-shell" role="dialog" aria-modal="true" aria-labelledby="credit-detail-modal-title">
      <div className="modal-card credit-detail-modal-card">
        <div className="modal-head credit-detail-modal-head">
          <div>
            <h2 id="credit-detail-modal-title">Kredit kartı</h2>
            <p>{credit.customer} üzrə fərdi müqavilə, ödəniş və tarixçə məlumatları</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <div className="credit-detail-modal-body">
          <CreditDetail
            item={item}
            sendCreditSms={sendCreditSms}
            onUpdatePaymentDate={onUpdatePaymentDate}
            onReceivePayment={onReceivePayment}
          />
        </div>
      </div>
    </div>
  );
}

function CreditDetail({ item, sendCreditSms, onUpdatePaymentDate, onReceivePayment }) {
  const { credit, plan, paymentState, progress } = item;

  return (
    <div className="credit-detail">
      <div className="credit-detail-layout">
        <section className="credit-detail-primary">
          <div className="credit-detail-head">
            <div>
              <span>{credit.id}</span>
              <h2>{credit.customer}</h2>
            </div>
            <StatusBadge status={paymentState.isOverdue ? `${paymentState.daysOverdue} gün gecikib` : credit.status} />
          </div>
          <CreditContext credit={credit} />
          <div className="credit-detail-values">
            <TwoLine title="Ümumi məbləğ" subtitle={money(plan.total)} />
            <TwoLine title="İlkin ödəniş" subtitle={money(plan.initialPayment)} />
            <TwoLine title="Qalıq" subtitle={money(plan.balance)} />
            <TwoLine title="Müddət" subtitle={`${plan.months} ay`} />
          </div>
          <div className="credit-plan-card">
            <div className="credit-plan-note">
              <span>
                {plan.months > 1 ? `${plan.months - 1} ay` : "Aylıq"} <strong>{money(plan.monthly)}</strong>
              </span>
              <span>
                Son ay <strong>{money(plan.lastPayment)}</strong>
              </span>
            </div>
            <ProgressRow label={`${credit.paidMonths}/${plan.months} ay`} value={progress} />
          </div>
          <div className="credit-detail-records">
            <CreditPaymentHistory payments={credit.payments || []} />
            <div className="credit-schedule-edit-block">
              <div className="credit-schedule-head">
                <div>
                  <h3>Ödəniş tarixləri</h3>
                  <p>Hələlik tarix redaktəsi bütün istifadəçilər üçün açıqdır.</p>
                </div>
              </div>
              <CreditSchedule
                installments={plan.installments}
                onUpdatePaymentDate={(month, due) => onUpdatePaymentDate(credit.id, month, due)}
              />
            </div>
          </div>
        </section>

        <aside className="credit-detail-aside">
          <CreditPaymentAlert paymentState={paymentState} />
          <CreditPaymentForm
            key={credit.id}
            credit={credit}
            paymentState={paymentState}
            onReceivePayment={onReceivePayment}
          />
          <CreditHealthSummary item={item} />
          <div className="credit-detail-actions">
            <span>Növbəti: {paymentState.nextInstallment?.due || credit.next}</span>
            <button className="secondary-btn" onClick={() => sendCreditSms(credit.id)}>
              SMS xatırlatma
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CreditHealthSummary({ item }) {
  const { credit, plan, paymentState, progress } = item;
  const paidTotal = getCreditPaidTotal(plan);

  return (
    <div className="credit-health-grid">
      <div>
        <span>Ödənilib</span>
        <strong>{money(paidTotal)}</strong>
        <small>{Math.round(progress)}% tamamlanıb</small>
      </div>
      <div>
        <span>Qalıq borc</span>
        <strong>{money(plan.balance)}</strong>
        <small>{plan.months} aylıq plan</small>
      </div>
      <div className={paymentState.isOverdue ? "danger" : paymentState.isDueToday ? "info" : ""}>
        <span>Yığım statusu</span>
        <strong>{getCreditRiskLabel(item)}</strong>
        <small>{paymentState.nextInstallment?.due || credit.next || "Tarix yoxdur"}</small>
      </div>
      <div>
        <span>Mənbə</span>
        <strong>{getCreditSourceLabel(credit)}</strong>
        <small>{credit.orderId ? `${credit.orderId} sifarişi` : "Manual qeyd"}</small>
      </div>
    </div>
  );
}

function CreditContext({ credit }) {
  return (
    <div className="credit-context-grid">
      <div>
        <span>Müqavilə</span>
        <strong>{credit.contractId || "Müqavilə qeyd edilməyib"}</strong>
      </div>
      <div>
        <span>Cihaz</span>
        <strong>{credit.device || credit.product || "Cihaz qeyd edilməyib"}</strong>
      </div>
      {credit.orderId && (
        <div>
          <span>Sifariş</span>
          <strong>{credit.orderId}</strong>
        </div>
      )}
      <div>
        <span>Mənbə</span>
        <strong>{getCreditSourceLabel(credit)}</strong>
      </div>
      {credit.warehouseName && (
        <div>
          <span>Anbar</span>
          <strong>{credit.warehouseName}</strong>
        </div>
      )}
    </div>
  );
}

function CreditPaymentAlert({ paymentState }) {
  const amount = paymentState.nextInstallment?.amount || 0;
  const due = paymentState.nextInstallment?.due || "—";
  const label = paymentState.isOverdue
    ? `${paymentState.daysOverdue} gün gecikib`
    : paymentState.isDueToday
      ? "Bu gün ödənilməlidir"
      : "Növbəti ödəniş";

  return (
    <div className={`credit-payment-alert ${paymentState.isOverdue ? "overdue" : ""} ${paymentState.isDueToday ? "today" : ""}`}>
      <CalendarClock size={16} />
      <div>
        <strong>{money(amount)}</strong>
        <span>
          {label} · {due}
        </span>
      </div>
    </div>
  );
}

function CreditPaymentForm({ credit, paymentState, onReceivePayment }) {
  const currentPrincipal = Number(paymentState.nextInstallment?.amount || 0);
  const [principalAmount, setPrincipalAmount] = useState(currentPrincipal);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const principal = Math.max(0, Math.round(Number(principalAmount || 0)));
  const penalty = Math.max(0, Math.round(Number(penaltyAmount || 0)));
  const extraPrincipal = Math.max(0, principal - currentPrincipal);
  const cashIn = principal + penalty;

  function submit(event) {
    event.preventDefault();
    onReceivePayment(credit.id, {
      principalAmount: principal,
      penaltyAmount: penalty,
    });
    setPrincipalAmount("");
    setPenaltyAmount(0);
  }

  return (
    <form className="credit-payment-form" onSubmit={submit}>
      <div className="credit-payment-form-head">
        <div>
          <h3>Ödəniş qəbul et</h3>
          <p>Əsas məbləğ borcdan silinir, gecikmə faizi yalnız kassaya daxil olur.</p>
        </div>
      </div>
      <div className="credit-payment-inputs">
        <label>
          <span>Əsas məbləğ</span>
          <input
            aria-label="Əsas məbləğ"
            type="number"
            min="0"
            value={principalAmount}
            onChange={(event) => setPrincipalAmount(event.target.value)}
          />
        </label>
        <label>
          <span>Gecikmə faizi</span>
          <input
            aria-label="Gecikmə faizi"
            type="number"
            min="0"
            value={penaltyAmount}
            onChange={(event) => setPenaltyAmount(event.target.value)}
          />
        </label>
      </div>
      <div className="credit-payment-preview">
        <span>
          Borcdan silinir <strong>{money(principal)}</strong>
        </span>
        <span>
          Gecikmə gəliri <strong>{money(penalty)}</strong>
        </span>
        <span>
          Kassaya daxil olur <strong>{money(cashIn)}</strong>
        </span>
        {extraPrincipal > 0 && (
          <span className="success">
            Növbəti aydan azalır <strong>{money(extraPrincipal)}</strong>
          </span>
        )}
      </div>
      <button type="submit" className="primary-btn">
        Ödənişi qəbul et
      </button>
    </form>
  );
}

function CreditPaymentHistory({ payments }) {
  const rows = payments || [];

  return (
    <div className="credit-payment-history">
      <div className="credit-history-head">
        <div>
          <h3>Ödəniş tarixçəsi</h3>
          <p>Əsas məbləğ borcdan silinir, gecikmə faizi yalnız kassaya gəlir.</p>
        </div>
        <span>{rows.length} əməliyyat</span>
      </div>
      {rows.length === 0 ? (
        <div className="credit-history-empty">Bu kredit üzrə hələ ödəniş qəbul edilməyib.</div>
      ) : (
        <div className="credit-history-list">
          {rows.slice(0, 6).map((payment, index) => {
            const principal = Number(payment.principal || 0);
            const penalty = Number(payment.penalty || 0);
            const cashIn = Number(payment.cashIn ?? principal + penalty);
            const extraApplied = Number(payment.extraApplied || 0);

            return (
              <div className="credit-payment-row" key={`${payment.date}-${index}`}>
                <div>
                  <strong>{payment.date || baseCreditDate}</strong>
                  <span>
                    Əsas {money(principal)} · Gecikmə {money(penalty)}
                  </span>
                  {extraApplied > 0 && <em>Növbəti aylardan azaldıldı: {money(extraApplied)}</em>}
                </div>
                <b>{money(cashIn)}</b>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreditSchedule({ installments, onUpdatePaymentDate }) {
  return (
    <div className="credit-schedule" aria-label="Kredit ödəniş tarixləri">
      {installments.map((installment) => (
        <label key={installment.month}>
          <em>{installment.month}. ay</em>
          <strong>{money(installment.amount)}</strong>
          <input
            aria-label={`${installment.month}. ay ödəniş tarixi`}
            type="date"
            value={toDateInputValue(installment.due)}
            onChange={(event) => onUpdatePaymentDate(installment.month, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

function ReceivablesPage({ rows, syncMeta }) {
  const debtorRows = rows.filter((row) => row.type === "Debitor");
  const creditorRows = rows.filter((row) => row.type === "Kreditor");
  const overdueRows = rows.filter((row) => Number(row.overdueDays || 0) > 0);
  const totalDebitor = total(debtorRows, "amount");
  const totalCreditor = total(creditorRows, "amount");
  const netPosition = totalDebitor - totalCreditor;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Debitor borcu" value={money(totalDebitor)} trend={`${debtorRows.length} müştəri`} icon={Wallet} tone="primary" />
        <MetricCard label="Kreditor borcu" value={money(totalCreditor)} trend={`${creditorRows.length} vendor`} icon={Building2} tone="warning" />
        <MetricCard label="Net mövqe" value={money(netPosition)} icon={TrendingUp} tone={netPosition >= 0 ? "success" : "danger"} />
        <MetricCard label="Gecikmə riski" value={overdueRows.length} trend={money(total(overdueRows, "amount"))} icon={CircleAlert} tone={overdueRows.length ? "warning" : "success"} />
      </section>
      {syncMeta && (
        <Panel className="module-action-panel">
          <PanelHeader title="Son balans yenilənməsi" subtitle="Satış, kredit və vendor məlumatlarından son sinxron nəticə" icon={RefreshCw} />
          <div className="db-status-grid">
            <div>
              <span>Vaxt</span>
              <strong>{syncMeta.at}</strong>
            </div>
            <div>
              <span>Debitor</span>
              <strong>{money(syncMeta.debtorTotal)}</strong>
            </div>
            <div>
              <span>Kreditor</span>
              <strong>{money(syncMeta.creditorTotal)}</strong>
            </div>
            <div>
              <span>Gecikmə</span>
              <strong>{syncMeta.overdueCount}</strong>
            </div>
          </div>
        </Panel>
      )}
      <Panel className="receivable-control-panel">
        <PanelHeader
          title="Debitor/Kreditor reyestri"
          subtitle="Satış, kredit və vendor PO məlumatlarından avtomatik formalaşır"
          icon={Wallet}
        />
        <DataTable
          columns={["Tip", "Tərəf", "Mənbə", "Məbləğ", "Gecikmə", "Məsul", "Detal", "Status"]}
          rows={rows.map((row) => [
            <StatusBadge status={row.type} />,
            <strong>{row.party}</strong>,
            row.source,
            <strong>{money(row.amount)}</strong>,
            Number(row.overdueDays || 0) > 0 ? `${row.overdueDays} gün` : "Yoxdur",
            row.owner,
            row.detail,
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function ProjectsPage({ projects }) {
  const revenue = total(projects, "revenue");
  const profit = total(projects, "profit");
  const cost = total(projects, "totalCost");
  const avgRoi = projects.length ? projects.reduce((sum, project) => sum + Number(project.roi || 0), 0) / projects.length : 0;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Layihə gəliri" value={money(revenue)} icon={Wallet} tone="success" />
        <MetricCard label="Layihə xərci" value={money(cost)} icon={BarChart3} tone="warning" />
        <MetricCard label="Mənfəət" value={money(profit)} icon={TrendingUp} tone={profit >= 0 ? "success" : "danger"} />
        <MetricCard label="Orta ROI" value={percent(avgRoi)} icon={SlidersHorizontal} tone="primary" />
      </section>
      <Panel className="project-roi-panel">
        <PanelHeader title="Layihə və kampaniya ROI" subtitle="Məhsul, xərc kateqoriyası və satış nəticələri əsasında hesablanır" icon={BarChart3} />
        <DataTable
          columns={["Layihə", "Sahib", "Satış", "Toplanıb", "Xərc", "Mənfəət", "ROI", "Export", "Status"]}
          rows={projects.map((project) => [
            <TwoLine title={project.name} subtitle={`${project.start} → ${project.end}`} />,
            project.owner,
            <TwoLine title={money(project.revenue)} subtitle={`${project.orders} sifariş`} />,
            money(project.collected),
            money(project.totalCost),
            <strong>{money(project.profit)}</strong>,
            <ProgressRow value={Math.max(0, Math.min(100, project.roi))} caption={percent(project.roi)} compact />,
            project.lastExportAt ? <TwoLine title={project.lastExportAt} subtitle={`${project.exportCount || 1} export`} /> : "—",
            <StatusBadge status={project.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function ProductionPage({ plans }) {
  const totalCost = total(plans, "totalCost");
  const totalRevenue = total(plans, "projectedRevenue");
  const riskCount = plans.filter((plan) => normalize(plan.status).includes("risk")).length;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Plan sayı" value={plans.length} icon={Package} tone="primary" />
        <MetricCard label="Maya dəyəri" value={money(totalCost)} icon={Wallet} tone="warning" />
        <MetricCard label="Proqnoz gəlir" value={money(totalRevenue)} icon={TrendingUp} tone="success" />
        <MetricCard label="Xammal riski" value={riskCount} icon={CircleAlert} tone={riskCount ? "danger" : "success"} />
      </section>
      <Panel className="production-panel">
        <PanelHeader title="BOM və maya dəyəri" subtitle="Anbar qalığı, xammal sərfi, əmək və overhead əsasında hesablanır" icon={Package} />
        <DataTable
          columns={["Plan", "Say", "Material", "Əmək/Overhead", "Vahid maya", "Marja", "Bottleneck", "Status"]}
          rows={plans.map((plan) => [
            <TwoLine title={plan.product} subtitle={plan.id} />,
            `${plan.plannedQty} ədəd`,
            <TwoLine title={money(plan.materialCost)} subtitle={plan.materials.map((item) => `${item.product}: ${item.needed}`).join(", ")} />,
            `${money(Number(plan.laborCost || 0) + Number(plan.overheadCost || 0))}`,
            <strong>{money(plan.unitCost)}</strong>,
            <ProgressRow value={Math.max(0, Math.min(100, plan.margin))} caption={percent(plan.margin)} compact />,
            plan.bottleneck,
            <StatusBadge status={plan.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function VendorsPage({
  vendors,
  warehouseStock = {},
  products = [],
  orders = [],
  purchaseOrders = [],
  onCreatePurchaseOrder,
  onApprovePurchaseOrder,
  canManagePo = false,
}) {
  const procurementRows = useMemo(
    () => buildProcurementRows(vendors, warehouseStock, orders, products),
    [vendors, warehouseStock, orders, products],
  );
  const purchaseNeed = procurementRows.filter((row) => row.recommendedQty > 0);
  const procurementBudget = purchaseNeed.reduce((sum, row) => sum + Number(row.estimatedCost || 0), 0);
  const vendorRiskCount = vendors.filter(
    (vendor) => normalize(vendor.status).includes("risk") || normalize(vendor.status).includes("aşağı"),
  ).length;
  const pendingPoCount = purchaseOrders.filter((po) => po.status === "Təsdiq gözləyir").length;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Aktiv vendorlar" value={vendors.length} icon={Building2} tone="primary" />
        <MetricCard label="Ümumi SKU" value={total(vendors, "sku")} trend="+24 bu ay" icon={Boxes} tone="info" />
        <MetricCard
          label="Kvota icrası"
          value={percent((total(vendors, "sold") / total(vendors, "quota")) * 100)}
          trend={`Q${currentBusinessQuarter} ${currentBusinessYear}`}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="PO tövsiyəsi"
          value={pendingPoCount || purchaseNeed.length}
          trend={pendingPoCount > 0 ? `${pendingPoCount} təsdiq gözləyir` : money(procurementBudget)}
          icon={Package}
          tone={purchaseNeed.length > 0 ? "warning" : "success"}
        />
      </section>
      <Panel className="procurement-panel">
        <PanelHeader
          title="Procurement planı"
          subtitle="Anbar qalığı və satış tempinə görə vendor üzrə sifariş tövsiyələri"
          icon={Package}
        />
        <div className="procurement-summary-grid">
          <div>
            <span>Satınalma büdcəsi</span>
            <strong>{money(procurementBudget)}</strong>
            <small>{purchaseNeed.length} məhsul üçün PO açıla bilər</small>
          </div>
          <div>
            <span>Vendor riski</span>
            <strong>{vendorRiskCount}</strong>
            <small>Kvota və icra nəzarəti</small>
          </div>
          <div>
            <span>Stok kifayətdir</span>
            <strong>{procurementRows.filter((row) => row.status === "Kifayət edir").length}</strong>
            <small>Satış üçün sağlam qalıq</small>
          </div>
        </div>
        <DataTable
          columns={["Məhsul", "Vendor", "Satış", "Satış üçün", "Tövsiyə", "Büdcə", "Status", "PO"]}
          rows={procurementRows.slice(0, 8).map((row) => [
            <strong>{row.product}</strong>,
            row.vendor,
            `${row.sold} ədəd`,
            `${row.available} ədəd`,
            row.recommendedQty > 0 ? `${row.recommendedQty} ədəd` : "Yoxdur",
            row.estimatedCost > 0 ? money(row.estimatedCost) : "—",
            <StatusBadge status={row.status} />,
            <button
              className="text-btn"
              disabled={!canManagePo}
              onClick={() => onCreatePurchaseOrder(row)}
            >
              PO yarat
            </button>,
          ])}
        />
      </Panel>
      <Panel className="po-action-panel">
        <PanelHeader
          title="Purchase Order axını"
          subtitle="PO təsdiqlənəndə məhsul avtomatik anbara mədaxil edilir və alış xərci maliyyəyə düşür"
          icon={FileText}
        />
        <DataTable
          columns={["PO", "Vendor", "Məhsul", "Anbar", "Say", "Məbləğ", "Status", "Əməliyyat"]}
          rows={purchaseOrders.map((po) => [
            <strong>{po.id}</strong>,
            po.vendor,
            po.product,
            po.warehouseName,
            `${po.qty} ədəd`,
            money(po.amount),
            <StatusBadge status={po.status} />,
            po.status === "Təsdiq gözləyir" ? (
              <button className="text-btn" disabled={!canManagePo} onClick={() => onApprovePurchaseOrder(po.id)}>
                Təsdiq et
              </button>
            ) : (
              <TwoLine title="Mədaxil edilib" subtitle={po.receivedAt || po.approvedAt} />
            ),
          ])}
        />
      </Panel>
      <Panel>
        <PanelHeader title={`Vendor Kvota Cədvəli — ${currentBusinessYear} Q${currentBusinessQuarter}`} subtitle="Satış hədəfi və risk statusu" />
        <DataTable
          columns={["Vendor", "Ölkə", "SKU", "Satılıb", "Kvota", "İcra", "Status"]}
          rows={vendors.map((vendor) => [
            <strong>{vendor.name}</strong>,
            vendor.country,
            vendor.sku,
            vendor.sold,
            vendor.quota,
            <ProgressRow label="" value={(vendor.sold / vendor.quota) * 100} compact />,
            <StatusBadge status={vendor.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

const hrLevelOptions = ["Rəhbərlik", "Şöbə rəhbəri", "Komanda lideri", "Komanda üzvü", "Təcrübəçi"];
const hrPlatformTabs = ["Komanda", "İş vaxtı", "Məzuniyyət", "Payroll", "Recruitment"];

function getEmployeeKey(employee = {}) {
  return employee.id || `EMP-${normalize(employee.name)}`;
}

function getEmployeeLevel(employee) {
  if (employee.level) return employee.level;

  const position = normalize(employee.position);
  if (position.includes("direktor")) return "Rəhbərlik";
  if (position.includes("baş") || position.includes("rəhbər")) return "Şöbə rəhbəri";
  return "Komanda üzvü";
}

function isHrLeadershipLevel(level) {
  const text = normalize(level);
  return text.includes("rəhb") || text.includes("lider") || text.includes("direktor");
}

function getEmployeeManager(employee, employees = []) {
  const employeeKey = getEmployeeKey(employee);
  const byId = employee.managerId
    ? employees.find((item) => getEmployeeKey(item) === employee.managerId)
    : null;
  if (byId && getEmployeeKey(byId) !== employeeKey) return byId;

  const byName = employee.managerName
    ? employees.find((item) => item.name === employee.managerName && getEmployeeKey(item) !== employeeKey)
    : null;
  return byName || null;
}

function getEmployeeManagerName(employee, employees) {
  const savedManager = getEmployeeManager(employee, employees);
  if (savedManager) return savedManager.name;
  if (employee.managerName !== undefined) return employee.managerName;

  const position = normalize(employee.position);
  if (position.includes("direktor") || position.includes("baş") || position.includes("rəhbər")) return "";

  const departmentLead = employees.find((item) => {
    if (item.name === employee.name || item.department !== employee.department) return false;
    const leadPosition = normalize(item.position);
    return leadPosition.includes("baş") || leadPosition.includes("rəhbər");
  });

  return departmentLead?.name || "";
}

function getDepartmentParentName(employee = {}) {
  if (employee.departmentParent) return employee.departmentParent;
  const parts = String(employee.department || "")
    .split(/\s*(?:\/|>|›)\s*/)
    .filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join(" / ") : "";
}

function getHrDraft(employee, employees) {
  return {
    department: employee?.department || "",
    departmentParent: employee ? getDepartmentParentName(employee) : "",
    position: employee?.position || "",
    managerName: employee ? getEmployeeManagerName(employee, employees) : "",
    level: employee ? getEmployeeLevel(employee) : "Komanda üzvü",
  };
}

function buildHrStructure(employees, departmentRecords = []) {
  const normalizedEmployees = employees.map((employee) => ({
    ...employee,
    managerName: getEmployeeManagerName(employee, employees),
    level: getEmployeeLevel(employee),
  }));
  const departmentNames = [...new Set(normalizedEmployees.map((employee) => employee.department || "Şöbəsiz"))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );

  const structures = departmentNames.map((department) => {
    const departmentRows = normalizedEmployees.filter((employee) => (employee.department || "Şöbəsiz") === department);
    const departmentNames = new Set(departmentRows.map((employee) => employee.name));
    const byManager = new Map();

    departmentRows.forEach((employee) => {
      const manager = departmentNames.has(employee.managerName) ? employee.managerName : "";
      const children = byManager.get(manager) || [];
      children.push(employee);
      byManager.set(manager, children);
    });

    const buildNode = (employee, visited = new Set()) => {
      if (visited.has(employee.name)) {
        return { ...employee, children: [] };
      }
      const nextVisited = new Set(visited);
      nextVisited.add(employee.name);
      const children = (byManager.get(employee.name) || [])
        .filter((child) => child.name !== employee.name)
        .sort((a, b) => a.name.localeCompare(b.name, "az"))
        .map((child) => buildNode(child, nextVisited));

      return { ...employee, children };
    };

    return {
      department,
      parentDepartment: departmentRows.map((employee) => getDepartmentParentName(employee)).find(Boolean) || "",
      leadCount: departmentRows.filter((employee) => isHrLeadershipLevel(employee.level)).length,
      salary: total(departmentRows, "salary"),
      avgKpi: departmentRows.length ? Math.round(total(departmentRows, "kpi") / departmentRows.length) : 0,
      roots: (byManager.get("") || []).sort((a, b) => a.name.localeCompare(b.name, "az")).map((employee) => buildNode(employee)),
      count: departmentRows.length,
    };
  });

  const structuresByDepartment = new Map(structures.map((department) => [department.department, department]));
  departmentRecords.forEach((record) => {
    const department = String(record.name || "").trim();
    if (!department) return;

    const existing = structuresByDepartment.get(department);
    if (existing) {
      existing.parentDepartment = String(record.parentDepartment || existing.parentDepartment || "").trim();
      return;
    }

    structuresByDepartment.set(department, {
      department,
      parentDepartment: String(record.parentDepartment || "").trim(),
      leadCount: 0,
      salary: 0,
      avgKpi: 0,
      roots: [],
      count: 0,
    });
  });

  return [...structuresByDepartment.values()].sort((left, right) => left.department.localeCompare(right.department, "az"));
}

function buildHrDepartmentTree(structure = []) {
  const nodes = new Map();
  const ensureNode = (department, parentDepartment = "", source = null) => {
    if (!department) return null;
    const current = nodes.get(department) || {
      id: department,
      department,
      parentDepartment,
      children: [],
      isVirtual: !source,
      count: 0,
      leadCount: 0,
      salary: 0,
      avgKpi: 0,
    };
    if (source) {
      Object.assign(current, {
        ...source,
        id: department,
        parentDepartment: source.parentDepartment || parentDepartment,
        children: current.children || [],
        isVirtual: false,
      });
    }
    nodes.set(department, current);
    return current;
  };

  structure.forEach((department) => {
    const parentDepartment = department.parentDepartment || "";
    ensureNode(department.department, parentDepartment, department);
    if (parentDepartment) ensureNode(parentDepartment);
  });

  const roots = [];
  nodes.forEach((node) => {
    node.children = [];
  });
  nodes.forEach((node) => {
    const parent = node.parentDepartment && nodes.get(node.parentDepartment);
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  });
  const sortNodes = (items) => items
    .sort((a, b) => a.department.localeCompare(b.department, "az"))
    .map((node) => ({ ...node, children: sortNodes(node.children) }));
  return sortNodes(roots);
}

function getHrDepartmentIds(nodes = [], ids = []) {
  nodes.forEach((node) => {
    ids.push(node.id);
    getHrDepartmentIds(node.children, ids);
  });
  return ids;
}

function getHrDepartmentLead(department) {
  const roots = department.roots || [];
  return roots.find((employee) => isHrLeadershipLevel(employee.level)) || roots[0] || null;
}

function getHrDepartmentScope(departmentTree, selectedDepartment) {
  if (!selectedDepartment || selectedDepartment === "all") return null;
  const collect = (nodes) => {
    for (const node of nodes) {
      if (node.id === selectedDepartment) {
        const names = new Set();
        const visit = (current) => {
          names.add(current.department);
          current.children.forEach(visit);
        };
        visit(node);
        return names;
      }
      const nested = collect(node.children);
      if (nested) return nested;
    }
    return null;
  };
  return collect(departmentTree) || new Set([selectedDepartment]);
}

function buildHrReportingForest(employees = [], departmentScope = null) {
  const normalizedEmployees = employees.map((employee) => ({
    ...employee,
    employeeKey: getEmployeeKey(employee),
    manager: getEmployeeManager(employee, employees),
    managerName: getEmployeeManagerName(employee, employees),
    level: getEmployeeLevel(employee),
  }));
  const rowsByKey = new Map(normalizedEmployees.map((employee) => [employee.employeeKey, employee]));
  const childrenByManager = new Map();
  normalizedEmployees.forEach((employee) => {
    const managerKey = employee.manager ? getEmployeeKey(employee.manager) : "";
    const children = childrenByManager.get(managerKey) || [];
    children.push(employee);
    childrenByManager.set(managerKey, children);
  });

  const buildNode = (employee, visited = new Set()) => {
    if (visited.has(employee.employeeKey)) return { ...employee, children: [] };
    const nextVisited = new Set(visited);
    nextVisited.add(employee.employeeKey);
    const children = (childrenByManager.get(employee.employeeKey) || [])
      .filter((child) => child.employeeKey !== employee.employeeKey)
      .sort((a, b) => a.name.localeCompare(b.name, "az"))
      .map((child) => buildNode(child, nextVisited));
    const isInScope = !departmentScope || departmentScope.has(employee.department);
    if (!isInScope && children.length === 0) return null;
    return { ...employee, children: children.filter(Boolean), isInScope };
  };

  const roots = normalizedEmployees
    .filter((employee) => !employee.manager || !rowsByKey.has(getEmployeeKey(employee.manager)))
    .sort((a, b) => a.name.localeCompare(b.name, "az"))
    .map((employee) => buildNode(employee))
    .filter(Boolean);

  const nestedKeys = new Set();
  const collectKeys = (node) => {
    nestedKeys.add(node.employeeKey);
    node.children.forEach(collectKeys);
  };
  roots.forEach(collectKeys);
  normalizedEmployees.forEach((employee) => {
    if (!nestedKeys.has(employee.employeeKey)) {
      const node = buildNode(employee);
      if (node) roots.push(node);
    }
  });
  return roots;
}

function buildHrPlanningRows(structure) {
  return structure.map((department, index) => {
    const vacancyNeed = department.count < 2 ? 1 : department.avgKpi < 90 ? 1 : 0;
    const trainingNeed = department.avgKpi < 95 ? "Təlim planı" : "Standart izləmə";
    const payrollForecast = Math.round(Number(department.salary || 0) * 1.08);

    return {
      department: department.department,
      headcount: department.count,
      leaders: department.leadCount,
      avgKpi: department.avgKpi,
      vacancyNeed,
      trainingNeed,
      payrollForecast,
      onboarding: vacancyNeed > 0 ? (index % 2 ? "Satış təcrübəçisi" : "Əməliyyat assistenti") : "Yeni qəbul yoxdur",
      status: vacancyNeed > 0 ? "Vakansiya aç" : department.avgKpi < 95 ? "Təlim lazımdır" : "Stabil",
    };
  });
}

function buildHrEmployeeRecords(employees) {
  return employees.map((employee) => {
    const salary = Number(employee.salary || 0);
    const kpi = Number(employee.kpi || 0);
    const bonus = kpi >= 105 ? Math.round(salary * 0.14) : kpi >= 95 ? Math.round(salary * 0.07) : 0;
    const payrollTax = calculatePayrollTax2026(salary + bonus);
    const tax = payrollTax.incomeTax;
    const social = payrollTax.employeeSocial + payrollTax.employeeUnemployment;
    const netSalary = payrollTax.net;
    const documentReviewRequired = Boolean(employee.documentReviewRequired || employee.hrStatus === "Məlumat gözləyir");
    const documentsComplete = documentReviewRequired ? Number(employee.documentsComplete || 0) : 100;
    const attendanceRate = Number(employee.attendanceRate || 0);
    const lateDays = Number(employee.lateDays || 0);
    const leaveBalance = Number(employee.leaveBalance || 0);

    return {
      ...employee,
      level: getEmployeeLevel(employee),
      managerName: getEmployeeManagerName(employee, employees),
      hireDate: employee.hireDate || "",
      workMode: employee.workMode || "Təyin edilməyib",
      shift: employee.shift || "Təyin edilməyib",
      employmentType: employee.employmentType || "Təyin edilməyib",
      leaveBalance,
      usedLeave: Number(employee.usedLeave || 0),
      attendanceRate,
      lateDays,
      documentsComplete,
      skills: Array.isArray(employee.skills) ? employee.skills : [],
      nextReview: employee.nextReview || "",
      bonus,
      tax,
      social,
      employerSocial: payrollTax.employerSocial,
      employerUnemployment: payrollTax.employerUnemployment,
      employerCost: payrollTax.employerCost,
      netSalary,
      hrStatus: employee.hrStatus || "Stabil",
    };
  });
}

function buildHrAttendanceRows(records) {
  return records.filter((record) => record.checkIn || record.checkOut).map((record) => ({
    id: `${record.name}-attendance`,
    employee: record.name,
    department: record.department,
    shift: record.shift,
    checkIn: record.checkIn || "—",
    checkOut: record.checkOut || "—",
    lateDays: record.lateDays,
    attendanceRate: record.attendanceRate,
    status: record.attendanceRate < 90 ? "Nəzarət" : record.lateDays > 2 ? "Gecikmə var" : "Normal",
  }));
}

function buildHrLeaveRows(records, leaveRequests = []) {
  const recordByKey = new Map(records.map((record) => [getEmployeeKey(record), record]));
  return leaveRequests.map((request) => {
    const employee = recordByKey.get(request.employeeId) || records.find((record) => record.name === request.employeeName);
    return {
      id: request.id,
      employee: employee?.name || request.employeeName || "Əməkdaş silinib",
      department: employee?.department || request.department || "—",
      type: request.type,
      from: request.from,
      to: request.to,
      days: Number(request.days || 0),
      balance: Math.max(0, Number(employee?.leaveBalance || 0) - (request.status === "Təsdiq edildi" ? Number(request.days || 0) : 0)),
      approver: request.approver || employee?.managerName || "HR",
      status: request.status || "Təsdiq gözləyir",
    };
  });
}

function buildHrPayrollRows(records) {
  return records.map((record) => ({
    employee: record.name,
    department: record.department,
    salary: Number(record.salary || 0),
    bonus: record.bonus,
    deductions: record.tax + record.social,
    netSalary: record.netSalary,
    employerCost: record.employerCost,
    status: record.hrStatus === "Məlumat gözləyir" ? "Sənəd gözləyir" : "Hesablama hazırdır",
  }));
}

function buildHrRecruitmentRows(planningRows, vacancies = []) {
  const activeVacancies = vacancies.map((vacancy) => ({
    ...vacancy,
    candidates: Number(vacancy.candidates || 0),
    stage: vacancy.stage || "Namizəd gözlənilir",
    status: vacancy.status || "Aktiv vakansiya",
  }));
  const knownDepartments = new Set(activeVacancies.map((vacancy) => vacancy.department));
  const plannedVacancies = planningRows
    .filter((row) => Number(row.vacancyNeed || 0) > 0 && !knownDepartments.has(row.department))
    .map((row) => ({
      id: `PLAN-${row.department}`,
      role: `${row.department} üzrə mütəxəssis`,
      department: row.department,
      candidates: 0,
      stage: "Planlanır",
      owner: "HR",
      targetDate: "Təyin edilməyib",
      status: "Planlanır",
    }));
  return [...activeVacancies, ...plannedVacancies];
}

function HrPage({ employees, allEmployees = employees, departments = [], leaveRequests = [], vacancies = [], onUpdateEmployeeStructure, onEditEmployee, onDeleteEmployee, onCreateDepartment, onCreateLeaveRequest, onCreateVacancy }) {
  const structure = useMemo(() => buildHrStructure(allEmployees, departments), [allEmployees, departments]);
  const [hrView, setHrView] = useState("Komanda");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(allEmployees[0]?.name || "");
  const [teamQuery, setTeamQuery] = useState("");
  const [teamDepartment, setTeamDepartment] = useState("Hamısı");
  const [teamStatus, setTeamStatus] = useState("Hamısı");
  const selectedEmployee =
    allEmployees.find((employee) => employee.name === selectedEmployeeName) || allEmployees[0] || null;
  const departmentCount = structure.length;
  const leaders = allEmployees.filter((employee) => isHrLeadershipLevel(getEmployeeLevel(employee)));
  const averageKpi = employees.length ? total(employees, "kpi") / employees.length : 0;
  const hrPlanningRows = useMemo(() => buildHrPlanningRows(structure), [structure]);
  const vacancyCount = hrPlanningRows.reduce((sum, row) => sum + Number(row.vacancyNeed || 0), 0);
  const hrEmployeeRecords = useMemo(() => buildHrEmployeeRecords(allEmployees), [allEmployees]);
  const teamDepartments = useMemo(
    () => [...new Set(hrEmployeeRecords.map((record) => record.department).filter(Boolean))].sort((a, b) => a.localeCompare(b, "az")),
    [hrEmployeeRecords],
  );
  const visibleHrEmployeeRecords = useMemo(() => {
    const query = normalize(teamQuery);
    return hrEmployeeRecords.filter((record) => {
      const matchesQuery = !query || [record.name, record.position, record.department, record.managerName]
        .some((value) => normalize(value).includes(query));
      const matchesDepartment = teamDepartment === "Hamısı" || record.department === teamDepartment;
      const matchesStatus = teamStatus === "Hamısı" || record.hrStatus === teamStatus;
      return matchesQuery && matchesDepartment && matchesStatus;
    });
  }, [hrEmployeeRecords, teamDepartment, teamQuery, teamStatus]);
  const visibleEmployeeNames = useMemo(
    () => new Set(visibleHrEmployeeRecords.map((record) => record.name)),
    [visibleHrEmployeeRecords],
  );
  const visibleRegistryEmployees = employees.filter((employee) => visibleEmployeeNames.has(employee.name));
  const selectedHrRecord =
    visibleHrEmployeeRecords.find((record) => record.name === selectedEmployeeName) || visibleHrEmployeeRecords[0] || null;
  const attendanceRows = useMemo(() => buildHrAttendanceRows(hrEmployeeRecords), [hrEmployeeRecords]);
  const leaveRows = useMemo(() => buildHrLeaveRows(hrEmployeeRecords, leaveRequests), [hrEmployeeRecords, leaveRequests]);
  const payrollRows = useMemo(() => buildHrPayrollRows(hrEmployeeRecords), [hrEmployeeRecords]);
  const recruitmentRows = useMemo(() => buildHrRecruitmentRows(hrPlanningRows, vacancies), [hrPlanningRows, vacancies]);
  const payrollTotal = payrollRows.reduce((sum, row) => sum + Number(row.netSalary || 0), 0);
  const pendingLeaveCount = leaveRows.filter((row) => row.status === "Təsdiq gözləyir").length;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Ümumi əməkdaş" value={employees.length} icon={Users} tone="primary" />
        <MetricCard label="Aylıq maaş fondu" value={money(total(employees, "salary"))} icon={Wallet} tone="success" />
        <MetricCard
          label="Orta KPI"
          value={percent(averageKpi)}
          icon={TrendingUp}
          tone="info"
        />
        <MetricCard label="Struktur şöbələri" value={departmentCount} trend={`${leaders.length} rəhbər rol`} icon={Building2} tone="warning" />
      </section>

      <Panel className="hr-platform-panel">
        <PanelHeader
          title="HR Platform"
          subtitle="Əməkdaş 360, iş vaxtı, məzuniyyət, payroll və recruitment axınları"
          icon={UserCog}
        />
        <div className="hr-platform-toolbar">
          <div className="tabs">
            {hrPlatformTabs.map((tab) => (
              <button key={tab} className={hrView === tab ? "active" : ""} onClick={() => setHrView(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="hr-platform-kpis">
            <span>{pendingLeaveCount} məzuniyyət təsdiqdə</span>
            <span>{money(payrollTotal)} net payroll</span>
            <span>{vacancyCount} vakansiya</span>
          </div>
        </div>
        {hrView === "Komanda" && (
          <div className="hr-team-workspace">
            <div className="hr-team-controls">
              <label className="hr-team-search">
                <Search size={16} />
                <input value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} placeholder="Əməkdaş, vəzifə və ya rəhbər axtar..." />
              </label>
              <select value={teamDepartment} onChange={(event) => setTeamDepartment(event.target.value)}>
                <option>Hamısı</option>
                {teamDepartments.map((department) => <option key={department}>{department}</option>)}
              </select>
              <select value={teamStatus} onChange={(event) => setTeamStatus(event.target.value)}>
                <option>Hamısı</option>
                <option>Stabil</option>
                <option>Məlumat gözləyir</option>
              </select>
              <strong>{visibleHrEmployeeRecords.length} əməkdaş</strong>
            </div>
            <HrEmployeePlatform
              records={visibleHrEmployeeRecords}
              selectedRecord={selectedHrRecord}
              onSelect={setSelectedEmployeeName}
              onEdit={onEditEmployee}
              onDelete={onDeleteEmployee}
            />
          </div>
        )}
        {hrView === "İş vaxtı" && <HrAttendancePlatform rows={attendanceRows} />}
        {hrView === "Məzuniyyət" && <HrLeavePlatform rows={leaveRows} onCreate={onCreateLeaveRequest} />}
        {hrView === "Payroll" && <HrPayrollPlatform rows={payrollRows} />}
        {hrView === "Recruitment" && <HrRecruitmentPlatform rows={recruitmentRows} onCreate={onCreateVacancy} />}
      </Panel>

      <Panel className="hr-planning-panel">
        <PanelHeader
          title="HR planlama"
          subtitle="Vakansiya, onboarding, təlim və maaş forecast göstəriciləri"
          icon={UserCog}
        />
        <div className="hr-planning-summary">
          <div>
            <span>Açılacaq vakansiya</span>
            <strong>{vacancyCount}</strong>
            <small>Şöbə yükünə görə</small>
          </div>
          <div>
            <span>Növbəti maaş forecast</span>
            <strong>{money(hrPlanningRows.reduce((sum, row) => sum + row.payrollForecast, 0))}</strong>
            <small>8% artım modeli</small>
          </div>
          <div>
            <span>Təlim ehtiyacı</span>
            <strong>{hrPlanningRows.filter((row) => row.status === "Təlim lazımdır").length}</strong>
            <small>KPI 95%-dən aşağı</small>
          </div>
        </div>
        <DataTable
          columns={["Şöbə", "Headcount", "Rəhbər", "Orta KPI", "Onboarding", "Maaş forecast", "Status"]}
          rows={hrPlanningRows.map((row) => [
            <strong>{row.department}</strong>,
            row.headcount,
            row.leaders,
            `${row.avgKpi}%`,
            row.onboarding,
            money(row.payrollForecast),
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>

      <section className="hr-structure-layout">
        <Panel className="hr-builder-panel">
          <PanelHeader title="Struktur qurucusu" subtitle="Əməkdaşı seçin, rəhbər və şöbə əlaqəsini təyin edin" icon={UserCog} />
          {selectedEmployee ? (
            <HrStructureBuilder
              key={selectedEmployee.name}
              employees={allEmployees}
              departments={departments}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={setSelectedEmployeeName}
              onUpdate={onUpdateEmployeeStructure}
            />
          ) : (
            <EmptyState title="Struktur üçün əməkdaş yoxdur" />
          )}
        </Panel>

        <Panel className="hr-tree-panel">
          <PanelHeader title="Struktur ağacı" subtitle="Şöbə, rəhbər və komanda xətti" icon={Building2} />
          <div className="hr-structure-actions">
            <button className="secondary-btn" onClick={onCreateDepartment}><Plus size={16} /> Şöbə əlavə et</button>
          </div>
          <HrStructureTree structure={structure} employees={allEmployees} onSelectEmployee={setSelectedEmployeeName} />
        </Panel>
      </section>

      <Panel className="hr-employee-registry-panel">
        <PanelHeader title={`Əməkdaşlar (${visibleRegistryEmployees.length})`} subtitle="Vəzifə, şöbə, maaş və KPI" />
        <DataTable
          columns={["Əməkdaş", "Vəzifə", "Şöbə", "Rəhbər", "Səviyyə", "Maaş", "KPI", ""]}
          rows={visibleRegistryEmployees.map((employee) => [
            <AvatarLine initials={employee.initials} title={employee.name} />,
            employee.position,
            employee.department,
            getEmployeeManagerName(employee, allEmployees) || "Birbaşa",
            <StatusBadge status={getEmployeeLevel(employee)} />,
            money(employee.salary),
            <ProgressRow label={`${employee.kpi}%`} value={employee.kpi} compact />,
            <div className="hr-row-actions">
              <button className="icon-btn hr-row-edit" title="Əməkdaşı redaktə et" aria-label={`${employee.name} əməkdaşını redaktə et`} onClick={() => onEditEmployee(employee)}><Pencil size={16} /></button>
              <button className="icon-btn hr-row-delete" title="Əməkdaşı sil" aria-label={`${employee.name} əməkdaşını sil`} onClick={() => onDeleteEmployee(employee)}><Trash2 size={16} /></button>
            </div>,
          ])}
        />
        <div className="hr-mobile-employee-list">
          {visibleRegistryEmployees.map((employee) => (
            <div className="hr-mobile-employee-card" key={employee.name}>
              <div className="hr-mobile-employee-head">
                <AvatarLine initials={employee.initials} title={employee.name} subtitle={employee.position} />
                <div className="hr-row-actions">
                  <button className="icon-btn hr-row-edit" title="Əməkdaşı redaktə et" aria-label={`${employee.name} əməkdaşını redaktə et`} onClick={() => onEditEmployee(employee)}><Pencil size={16} /></button>
                  <button className="icon-btn hr-row-delete" title="Əməkdaşı sil" aria-label={`${employee.name} əməkdaşını sil`} onClick={() => onDeleteEmployee(employee)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="hr-mobile-employee-meta">
                <span>{employee.department}</span>
                <span>{getEmployeeManagerName(employee, allEmployees) || "Birbaşa"}</span>
                <span>{money(employee.salary)}</span>
              </div>
              <ProgressRow label={`${employee.kpi}% KPI`} value={employee.kpi} compact />
              <StatusBadge status={getEmployeeLevel(employee)} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function HrEmployeePlatform({ records, selectedRecord, onSelect, onEdit, onDelete }) {
  if (!selectedRecord) return <EmptyState title={records.length ? "Əməkdaş seçilməyib" : "Filterə uyğun əməkdaş tapılmadı"} />;

  const documentRows = [
    ["Şəxsiyyət/FİN", "Tamam"],
    ["Əmək müqaviləsi", selectedRecord.documentsComplete >= 90 ? "Tamam" : "Yenilənməlidir"],
    ["Vəzifə təlimatı", selectedRecord.documentsComplete === 100 ? "Tamam" : "Təsdiq gözləyir"],
    ["NDA / daxili qaydalar", "Tamam"],
  ];

  return (
    <section className="hr-employee-platform">
      <div className="hr-people-list">
        {records.map((record) => (
          <button
            key={record.name}
            className={`hr-person-row ${selectedRecord.name === record.name ? "active" : ""}`}
            onClick={() => onSelect(record.name)}
          >
            <AvatarLine initials={record.initials} title={record.name} subtitle={`${record.department} · ${record.position}`} />
            <StatusBadge status={record.hrStatus} />
          </button>
        ))}
      </div>

      <div className="hr-profile-360">
        <div className="hr-profile-head">
          <div className="avatar large">{selectedRecord.initials}</div>
          <div>
            <span>{selectedRecord.level}</span>
            <h3>{selectedRecord.name}</h3>
            <p>{selectedRecord.position} · {selectedRecord.department}</p>
          </div>
          <div className="hr-profile-actions">
            <StatusBadge status={selectedRecord.hrStatus} />
            <button className="icon-btn hr-profile-edit" title="Əməkdaşı redaktə et" aria-label={`${selectedRecord.name} əməkdaşını redaktə et`} onClick={() => onEdit(selectedRecord)}><Pencil size={16} /></button>
            <button className="icon-btn hr-row-delete hr-profile-delete" title="Əməkdaşı sil" aria-label={`${selectedRecord.name} əməkdaşını sil`} onClick={() => onDelete(selectedRecord)}><Trash2 size={16} /></button>
          </div>
        </div>
        <div className="hr-profile-grid">
          <TwoLine title="Rəhbər" subtitle={selectedRecord.managerName || "Birbaşa rəhbərlik"} />
          <TwoLine title="İş rejimi" subtitle={`${selectedRecord.workMode} · ${selectedRecord.shift}`} />
          <TwoLine title="İşə qəbul" subtitle={selectedRecord.hireDate} />
          <TwoLine title="Növbəti review" subtitle={selectedRecord.nextReview} />
          <TwoLine title="Attendance" subtitle={percent(selectedRecord.attendanceRate)} />
          <TwoLine title="Məzuniyyət balansı" subtitle={`${selectedRecord.leaveBalance} gün`} />
          <TwoLine title="Sənəd uyğunluğu" subtitle={percent(selectedRecord.documentsComplete)} />
          <TwoLine title="Net payroll" subtitle={money(selectedRecord.netSalary)} />
        </div>
        <div className="hr-skill-strip">
          {selectedRecord.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <div className="hr-document-grid">
          {documentRows.map(([title, status]) => (
            <div key={title}>
              <span>{title}</span>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HrAttendancePlatform({ rows }) {
  const averageAttendance = rows.length
    ? rows.reduce((sum, row) => sum + Number(row.attendanceRate || 0), 0) / rows.length
    : 0;
  const lateTotal = rows.reduce((sum, row) => sum + Number(row.lateDays || 0), 0);

  return (
    <div className="hr-platform-section">
      <div className="hr-platform-summary">
        <div>
          <span>Orta davamiyyət</span>
          <strong>{percent(averageAttendance)}</strong>
          <small>Bu ay üzrə</small>
        </div>
        <div>
          <span>Gecikmə</span>
          <strong>{lateTotal}</strong>
          <small>Toplam gecikmə günü</small>
        </div>
        <div>
          <span>Nəzarət</span>
          <strong>{rows.filter((row) => row.status !== "Normal").length}</strong>
          <small>HR follow-up</small>
        </div>
      </div>
      <DataTable
        columns={["Əməkdaş", "Şöbə", "Növbə", "Giriş", "Çıxış", "Gecikmə", "Davamiyyət", "Status"]}
        rows={rows.map((row) => [
          <strong>{row.employee}</strong>,
          row.department,
          row.shift,
          row.checkIn,
          row.checkOut,
          `${row.lateDays} gün`,
          <ProgressRow value={row.attendanceRate} label={percent(row.attendanceRate)} compact />,
          <StatusBadge status={row.status} />,
        ])}
      />
    </div>
  );
}

function HrLeavePlatform({ rows, onCreate }) {
  const pending = rows.filter((row) => row.status === "Təsdiq gözləyir");
  const plannedDays = rows.reduce((sum, row) => sum + Number(row.days || 0), 0);

  return (
    <div className="hr-platform-section">
      <div className="hr-operation-toolbar">
        <span>Məzuniyyət tələbləri və balans nəzarəti</span>
        <button className="secondary-btn" onClick={onCreate}><Plus size={16} /> Məzuniyyət qeydi</button>
      </div>
      <div className="hr-platform-summary">
        <div>
          <span>Təsdiq gözləyir</span>
          <strong>{pending.length}</strong>
          <small>Rəhbər baxışı</small>
        </div>
        <div>
          <span>Planlanan gün</span>
          <strong>{plannedDays}</strong>
          <small>Məzuniyyət yükü</small>
        </div>
        <div>
          <span>Orta balans</span>
          <strong>{rows.length ? Math.round(rows.reduce((sum, row) => sum + row.balance, 0) / rows.length) : 0}</strong>
          <small>Qalıq gün</small>
        </div>
      </div>
      <DataTable
        columns={["Əməkdaş", "Tip", "Tarix", "Gün", "Balans", "Təsdiqləyən", "Status"]}
        rows={rows.map((row) => [
          <TwoLine title={row.employee} subtitle={row.department} />,
          row.type,
          `${row.from} → ${row.to}`,
          row.days,
          `${row.balance} gün`,
          row.approver,
          <StatusBadge status={row.status} />,
        ])}
      />
    </div>
  );
}

function HrPayrollPlatform({ rows }) {
  const gross = rows.reduce((sum, row) => sum + Number(row.salary || 0) + Number(row.bonus || 0), 0);
  const deductions = rows.reduce((sum, row) => sum + Number(row.deductions || 0), 0);
  const net = rows.reduce((sum, row) => sum + Number(row.netSalary || 0), 0);
  const employerCost = rows.reduce((sum, row) => sum + Number(row.employerCost || 0), 0);

  return (
    <div className="hr-platform-section">
      <div className="hr-platform-summary">
        <div>
          <span>Gross payroll</span>
          <strong>{money(gross)}</strong>
          <small>Maaş + bonus</small>
        </div>
        <div>
          <span>Tutulmalar</span>
          <strong>{money(deductions)}</strong>
          <small>Vergi və sosial</small>
        </div>
        <div>
          <span>Net ödəniş</span>
          <strong>{money(net)}</strong>
          <small>Kassadan çıxış</small>
        </div>
        <div>
          <span>İşəgötürən xərci</span>
          <strong>{money(employerCost)}</strong>
          <small>Gross + işəgötürən ödənişləri</small>
        </div>
      </div>
      <DataTable
        columns={["Əməkdaş", "Şöbə", "Maaş", "Bonus", "Tutulma", "Net", "İşəgötürən xərci", "Status"]}
        rows={rows.map((row) => [
          <strong>{row.employee}</strong>,
          row.department,
          money(row.salary),
          money(row.bonus),
          money(row.deductions),
          <strong>{money(row.netSalary)}</strong>,
          money(row.employerCost),
          <StatusBadge status={row.status} />,
        ])}
      />
    </div>
  );
}

function HrRecruitmentPlatform({ rows, onCreate }) {
  const activeRows = rows.filter((row) => row.status === "Aktiv vakansiya");

  return (
    <div className="hr-platform-section">
      <div className="hr-operation-toolbar">
        <span>Vakansiya pipeline və namizəd mərhələləri</span>
        <button className="secondary-btn" onClick={onCreate}><Plus size={16} /> Vakansiya əlavə et</button>
      </div>
      <div className="hr-recruitment-pipeline">
        {rows.map((row) => (
          <div className="hr-recruitment-card" key={`${row.department}-${row.role}`}>
            <div>
              <strong>{row.role}</strong>
              <span>{row.department} · {row.owner}</span>
            </div>
            <div className="hr-recruitment-meta">
              <b>{row.candidates}</b>
              <small>namizəd</small>
            </div>
            <StatusBadge status={row.stage} />
          </div>
        ))}
      </div>
      <DataTable
        columns={["Rol", "Şöbə", "Namizəd", "Mərhələ", "Owner", "Hədəf tarix", "Status"]}
        rows={rows.map((row) => [
          <strong>{row.role}</strong>,
          row.department,
          row.candidates,
          row.stage,
          row.owner,
          row.targetDate,
          <StatusBadge status={activeRows.includes(row) ? "Aktiv vakansiya" : row.status} />,
        ])}
      />
    </div>
  );
}

function HrStructureBuilder({ employees, departments: departmentRecords = [], selectedEmployee, onSelectEmployee, onUpdate }) {
  const [draft, setDraft] = useState(() => getHrDraft(selectedEmployee, employees));
  const departments = [...new Set([
    ...employees.map((employee) => employee.department),
    ...departmentRecords.map((department) => department.name),
  ].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );
  const parentDepartments = [...new Set([
    ...departments,
    ...employees.map((employee) => getDepartmentParentName(employee)),
    ...departmentRecords.map((department) => department.parentDepartment),
  ].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );
  const managerOptions = employees.filter((employee) => employee.name !== selectedEmployee.name);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onUpdate(selectedEmployee.name, draft);
  }

  return (
    <form className="hr-builder-form" onSubmit={submit}>
      <label>
        <span>Əməkdaş</span>
        <select value={selectedEmployee.name} onChange={(event) => onSelectEmployee(event.target.value)}>
          {employees.map((employee) => (
            <option key={employee.name} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Şöbə</span>
        <input
          value={draft.department}
          list="hr-departments"
          onChange={(event) => updateDraft("department", event.target.value)}
        />
        <datalist id="hr-departments">
          {departments.map((department) => (
            <option key={department} value={department} />
          ))}
        </datalist>
      </label>
      <label>
        <span>Vəzifə</span>
        <input value={draft.position} onChange={(event) => updateDraft("position", event.target.value)} />
      </label>
      <label>
        <span>Üst şöbə</span>
        <input
          value={draft.departmentParent}
          list="hr-parent-departments"
          onChange={(event) => updateDraft("departmentParent", event.target.value)}
        />
        <datalist id="hr-parent-departments">
          <option value="" />
          {parentDepartments.map((department) => (
            <option key={department} value={department} />
          ))}
        </datalist>
      </label>
      <label>
        <span>Kimə tabedir</span>
        <select value={draft.managerName} onChange={(event) => updateDraft("managerName", event.target.value)}>
          <option value="">Birbaşa rəhbərlik</option>
          {managerOptions.map((employee) => (
            <option key={employee.name} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Səviyyə</span>
        <select value={draft.level} onChange={(event) => updateDraft("level", event.target.value)}>
          {hrLevelOptions.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      </label>
      <div className="hr-builder-preview">
        <TwoLine title={selectedEmployee.name} subtitle={`${draft.position} · ${draft.department}`} />
        <StatusBadge status={draft.level} />
        <small>{draft.managerName ? `${draft.managerName} rəhbərliyində` : "Birbaşa rəhbərlik xətti"} · {draft.departmentParent || "Əsas şöbə"}</small>
      </div>
      <button className="primary-btn" type="submit">
        Strukturda yadda saxla
      </button>
    </form>
  );
}

function HrStructureTree({ structure, employees, onSelectEmployee }) {
  const departmentTree = useMemo(() => buildHrDepartmentTree(structure), [structure]);
  const departmentIds = useMemo(() => getHrDepartmentIds(departmentTree), [departmentTree]);
  const departmentTreeKey = departmentIds.join("|");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [expandedDepartments, setExpandedDepartments] = useState(() => new Set(departmentIds));
  useEffect(() => {
    setExpandedDepartments(new Set(departmentIds));
  }, [departmentTreeKey]);
  const departmentScope = useMemo(
    () => getHrDepartmentScope(departmentTree, selectedDepartment),
    [departmentTree, selectedDepartment],
  );
  const reportingRoots = useMemo(
    () => buildHrReportingForest(employees, departmentScope),
    [employees, departmentScope],
  );
  const selectedTitle = selectedDepartment === "all" ? "Bütün şirkət" : selectedDepartment;

  function toggleDepartment(departmentId) {
    setExpandedDepartments((current) => {
      const next = new Set(current);
      if (next.has(departmentId)) next.delete(departmentId);
      else next.add(departmentId);
      return next;
    });
  }

  function activateDepartment(department) {
    setSelectedDepartment(department.id);
    if (department.children.length > 0) toggleDepartment(department.id);
  }

  if (structure.length === 0) {
    return <EmptyState title="Struktur ağacı boşdur" />;
  }

  return (
    <div className="hr-tree">
      <div className="hr-org-chart-scroll">
        <div className="hr-org-chart-canvas">
          <button className={`hr-org-company-card ${selectedDepartment === "all" ? "active" : ""}`} onClick={() => setSelectedDepartment("all")}>
            <span className="hr-org-company-icon"><Building2 size={20} /></span>
            <span>
              <strong>ERP+CRM AZ</strong>
              <small>Şirkət strukturu</small>
            </span>
          </button>
          <div className={`hr-org-children hr-org-root-children ${departmentTree.length > 1 ? "multiple" : ""}`}>
            {departmentTree.map((department, index) => (
              <HrOrganizationNode
                key={department.id}
                department={department}
                depth={0}
                index={index}
                selectedDepartment={selectedDepartment}
                expandedDepartments={expandedDepartments}
                onActivate={activateDepartment}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="hr-reporting-panel">
        <div className="hr-reporting-head">
          <div>
            <strong>{selectedTitle} üzrə tabeçilik xətti</strong>
            <span>{departmentScope ? `${departmentScope.size} şöbə` : `${employees.length} əməkdaş`}</span>
          </div>
          <StatusBadge status={`${reportingRoots.length} rəhbərlik xətti`} />
        </div>
        <div className="hr-employee-branch">
          {reportingRoots.map((employee) => (
            <HrEmployeeTreeNode key={employee.employeeKey} employee={employee} onSelectEmployee={onSelectEmployee} />
          ))}
          {reportingRoots.length === 0 && <EmptyState title="Bu şöbə üzrə tabeçilik xətti yoxdur" />}
        </div>
      </div>
    </div>
  );
}

function HrOrganizationNode({ department, depth, index, selectedDepartment, expandedDepartments, onActivate }) {
  const hasChildren = department.children.length > 0;
  const expanded = expandedDepartments.has(department.id);
  const lead = getHrDepartmentLead(department);
  const cardNumber = String(index + 1).padStart(2, "0");

  return (
    <div className={`hr-org-branch ${hasChildren ? "has-children" : ""}`}>
      <button
        className={`hr-org-card tone-${(depth + index) % 4} ${selectedDepartment === department.id ? "active" : ""}`}
        aria-expanded={hasChildren ? expanded : undefined}
        onClick={() => onActivate(department)}
      >
        <span className="hr-org-card-number">{cardNumber}</span>
        <span className="hr-org-card-label">{department.isVirtual ? "Şöbə qrupu" : "Şöbə"}</span>
        <strong>{department.department}</strong>
        <span className="hr-org-card-count"><Users size={13} />{department.count} əməkdaş</span>
        <span className="hr-org-card-lead">
          <span className="small-avatar">{lead?.initials || "HR"}</span>
          <span>
            <b>{lead?.name || "Rəhbər təyin edilməyib"}</b>
            <small>{lead?.position || "Alt şöbələr"}</small>
          </span>
        </span>
        {hasChildren && <ChevronRight size={16} className={`hr-org-card-chevron ${expanded ? "expanded" : ""}`} />}
      </button>
      {hasChildren && expanded && (
        <div className={`hr-org-children ${department.children.length > 1 ? "multiple" : ""}`}>
          {department.children.map((child, childIndex) => (
            <HrOrganizationNode
              key={child.id}
              department={child}
              depth={depth + 1}
              index={childIndex}
              selectedDepartment={selectedDepartment}
              expandedDepartments={expandedDepartments}
              onActivate={onActivate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HrEmployeeTreeNode({ employee, onSelectEmployee }) {
  return (
    <div className="hr-tree-item">
      <button className={`hr-employee-node ${employee.isInScope ? "in-scope" : ""}`} onClick={() => onSelectEmployee(employee.name)}>
        <span className="small-avatar">{employee.initials}</span>
        <div>
          <strong>{employee.name}</strong>
          <span>{employee.position} · {employee.department}</span>
          <small>{employee.managerName ? `${employee.managerName}-a tabedir` : "Birbaşa rəhbərlik"}</small>
        </div>
        <StatusBadge status={employee.level} />
      </button>
      {employee.children.length > 0 && (
        <div className="hr-tree-children">
          {employee.children.map((child) => (
            <HrEmployeeTreeNode key={child.employeeKey} employee={child} onSelectEmployee={onSelectEmployee} />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiPage({ employees, salesBonuses = [] }) {
  const [bonusFilter, setBonusFilter] = useState("Hamısı");
  const ranking = [...employees].sort((a, b) => b.kpi - a.kpi);
  const companyKpi = ranking.length
    ? Math.round(ranking.reduce((sum, employee) => sum + Number(employee.kpi || 0), 0) / ranking.length)
    : 0;
  const topPerformer = ranking[0];
  const bonusSellers = [...new Set(salesBonuses.map((row) => row.seller).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );
  const visibleBonuses = salesBonuses.filter((row) => bonusFilter === "Hamısı" || row.seller === bonusFilter);
  const bonusTotal = total(salesBonuses, "bonusAmount");
  const visibleBonusTotal = total(visibleBonuses, "bonusAmount");

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Şirkət ümumi KPI" value={percent(companyKpi)} trend={`${ranking.length} əməkdaş üzrə`} icon={TrendingUp} tone="success" />
        <MetricCard label="Top performer" value={topPerformer?.name || "Məlumat yoxdur"} trend={topPerformer ? `${topPerformer.kpi}% KPI` : "Əməkdaş əlavə edilməyib"} icon={ShieldCheck} tone="primary" />
        <MetricCard label="Aktiv hədəflər" value={goals.length} icon={SlidersHorizontal} tone="info" />
        <MetricCard
          label="Satış bonusu"
          value={money(bonusTotal)}
          trend={`${salesBonuses.length} bonus sətri`}
          icon={Wallet}
          tone="warning"
        />
      </section>
      <section className="dashboard-grid">
        <Panel className="span-2">
          <PanelHeader title="Hədəflər" subtitle="Aktual şirkət performansı" />
          <div className="progress-list">
            {goals.map((goal) => (
              <ProgressRow
                key={goal.label}
                label={goal.label}
                value={goal.inverse ? (goal.target / goal.value) * 100 : (goal.value / goal.target) * 100}
                caption={`${goal.value}${goal.unit} / ${goal.target}${goal.unit}`}
              />
            ))}
            {goals.length === 0 && <EmptyState title="KPI hədəfi əlavə edilməyib" />}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Əməkdaş Reytinqi" subtitle="KPI nəticələrinə görə" />
          <div className="rank-list">
            {ranking.map((employee, index) => (
              <div className="rank-row" key={employee.name}>
                <span>{index + 1}</span>
                <AvatarLine initials={employee.initials} title={employee.name} subtitle={employee.position} />
                <strong>{employee.kpi}%</strong>
              </div>
            ))}
            {ranking.length === 0 && <EmptyState title="Əməkdaş məlumatı yoxdur" />}
          </div>
        </Panel>
      </section>
      <Panel className="kpi-bonus-panel">
        <PanelHeader
          title="Satışdan gələn bonuslar"
          subtitle="Satış sifarişində qeyd olunan satıcı bonus faizlərinə görə hesablanır"
          icon={Wallet}
        />
        <div className="kpi-bonus-toolbar">
          <div className="tabs" aria-label="Satış bonusu filtri">
            {["Hamısı", ...bonusSellers].map((filter) => (
              <button
                key={filter}
                className={bonusFilter === filter ? "active" : ""}
                onClick={() => setBonusFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="kpi-bonus-total">
            <span>Seçilmiş bonus</span>
            <strong>{money(visibleBonusTotal)}</strong>
          </div>
        </div>
        <DataTable
          columns={["Sifariş", "Satıcı", "Müştəri", "Məhsul", "Ödəniş", "% bonus", "Bonus", "Status"]}
          rows={visibleBonuses.map((row) => [
            <TwoLine title={row.orderId} subtitle={row.date} />,
            row.seller,
            row.customer,
            row.product,
            <TwoLine title={money(row.paid)} subtitle={row.paymentMethod} />,
            `${row.rate}%`,
            <strong>{money(row.bonusAmount)}</strong>,
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function ContractsPage({ contracts, onExport }) {
  return (
    <div className="stack">
      <section className="metric-grid three">
        <MetricCard label="Aktiv müqavilə" value={contracts.length} icon={FileText} tone="primary" />
        <MetricCard
          label="İmzalanıb"
          value={contracts.filter((contract) => contract.status === "İmzalanıb").length}
          trend="Bu ay"
          icon={Check}
          tone="success"
        />
        <MetricCard label="Şablon sayı" value={contractTemplates.length} icon={SlidersHorizontal} tone="info" />
      </section>
      <section className="template-grid">
        {contractTemplates.map((template) => (
          <Panel key={template.title}>
            <div className="template-card">
              <FileText size={22} />
              <h3>{template.title}</h3>
              <p>{template.desc}</p>
            </div>
          </Panel>
        ))}
      </section>
      <Panel>
        <PanelHeader title="Son Müqavilələr" subtitle="PDF/DOCX formatında ixrac" />
        <DataTable
          columns={["№", "Müştəri", "FİN", "Məhsul", "Məbləğ", "Status", "Əməliyyat"]}
          rows={contracts.map((contract) => [
            <strong>{contract.id}</strong>,
            contract.customer,
            contract.fin,
            contract.product,
            money(contract.amount),
            <StatusBadge status={contract.status} />,
            <button className="text-btn" onClick={() => onExport(contract.id)}>
              PDF
            </button>,
          ])}
        />
      </Panel>
    </div>
  );
}

function ReportsPage({ orders = [], credits = [], vendors = [], employees = [], exports = [], onExport }) {
  const executiveInsights = useMemo(
    () => buildExecutiveInsights({ orders, credits, vendors, employees }),
    [orders, credits, vendors, employees],
  );
  const revenue = total(orders, "amount");
  const activeCustomers = new Set(orders.map((order) => order.fin || order.customer).filter(Boolean)).size;
  const averageOrder = orders.length ? revenue / orders.length : 0;
  const products = useMemo(() => {
    const byProduct = new Map();
    orders.forEach((order) => {
      (order.productLines || []).forEach((line) => {
        const current = byProduct.get(line.product) || { count: 0, amount: 0 };
        byProduct.set(line.product, {
          count: current.count + Number(line.qty || 0),
          amount: current.amount + Number(line.qty || 0) * Number(line.price || 0),
        });
      });
    });
    return [...byProduct.entries()]
      .map(([name, values]) => [name, values.count, values.amount])
      .sort((a, b) => b[2] - a[2])
      .slice(0, 4);
  }, [orders]);
  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Satış gəliri" value={money(revenue)} trend={`${orders.length} sifariş`} icon={Wallet} tone="success" />
        <MetricCard label="Aktiv müştəri" value={activeCustomers} icon={Users} tone="primary" />
        <MetricCard label="Orta sifariş" value={money(averageOrder)} icon={ShoppingCart} tone="info" />
        <MetricCard label="Hesabat şablonu" value={reportTemplates.length} icon={FileText} tone="warning" />
      </section>
      <Panel className="executive-insight-panel">
        <PanelHeader
          title="Executive insight"
          subtitle="Satış, kredit, anbar, vendor və HR siqnallarından avtomatik idarəetmə xülasəsi"
          icon={BarChart3}
        />
        <div className="executive-insight-grid">
          {executiveInsights.map((insight) => (
            <div className={`executive-insight-card ${insight.tone}`} key={insight.title}>
              <span>{insight.title}</span>
              <strong>{insight.value}</strong>
              <small>{insight.desc}</small>
            </div>
          ))}
        </div>
        <div className="automation-rule-list">
          <div>
            <strong>Kredit gecikməsi</strong>
            <span>1 gün gecikmə olduqda SMS, 7 gündən sonra zəng taskı, 30+ gündə restruktur mərhələsi açılsın.</span>
          </div>
          <div>
            <strong>Minimum stok</strong>
            <span>Satış üçün qalıq reorder point-dən aşağı düşdükdə vendor PO draft yaradılsın.</span>
          </div>
          <div>
            <strong>Təhvil SLA</strong>
            <span>Hazır statusunda 2 gündən çox qalan sifarişlər delivery rəhbərinə eskalasiya edilsin.</span>
          </div>
        </div>
      </Panel>
      <section className="dashboard-grid">
        <Panel className="span-2">
          <PanelHeader title="Hesabat Şablonları" subtitle="Bir kliklə ixrac" />
          <div className="report-list">
            {reportTemplates.map((report) => (
              <button key={report.title} className="report-row" onClick={() => onExport(report.title)}>
                <div>
                  <strong>{report.title}</strong>
                  <span>{report.desc}</span>
                </div>
                <StatusBadge status={report.cadence} />
                <Download size={17} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Top 4 Məhsul" subtitle="Bu ay üzrə satış" />
          <div className="rank-list product">
            {products.map(([name, count, amount], index) => (
              <div className="rank-row" key={name}>
                <span>{index + 1}</span>
                <TwoLine title={name} subtitle={`${count} ədəd`} />
                <strong>{money(amount)}</strong>
              </div>
            ))}
            {products.length === 0 && <EmptyState title="Satış məlumatı yoxdur" />}
          </div>
        </Panel>
      </section>
      <Panel>
        <PanelHeader title="Son exportlar" subtitle="PDF/Excel hazırlıq əməliyyatları və audit izi" icon={Download} />
        <DataTable
          columns={["ID", "Hesabat", "Vaxt", "Sətir", "İcraçı", "Status"]}
          rows={exports.map((row) => [
            <strong>{row.id}</strong>,
            row.title,
            row.at,
            row.rows,
            row.owner,
            <StatusBadge status={row.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function SupportPage({ tickets }) {
  const openTickets = tickets.filter((ticket) => ticket.status !== "Bağlandı");
  const highPriority = tickets.filter((ticket) => ticket.priority === "Yüksək");
  const avgSla = tickets.length ? Math.round(tickets.reduce((sum, ticket) => sum + Number(ticket.slaHours || 0), 0) / tickets.length) : 0;

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Açıq sorğu" value={openTickets.length} icon={MessageSquare} tone="primary" />
        <MetricCard label="Yüksək prioritet" value={highPriority.length} icon={CircleAlert} tone={highPriority.length ? "warning" : "success"} />
        <MetricCard label="Orta SLA" value={`${avgSla} saat`} icon={CalendarClock} tone="info" />
        <MetricCard label="Modul əhatəsi" value={new Set(tickets.map((ticket) => ticket.module)).size} icon={ShieldCheck} tone="success" />
      </section>
      <Panel className="support-panel">
        <PanelHeader title="Support və task növbəsi" subtitle="Sorğu, prioritet, məsul şəxs və SLA üzrə tətbiq izləmə" icon={MessageSquare} />
        <DataTable
          columns={["Sorğu", "Requester", "Modul", "Prioritet", "Məsul", "SLA", "Status"]}
          rows={tickets.map((ticket) => [
            <TwoLine title={ticket.title} subtitle={`${ticket.id} · ${ticket.createdAt}`} />,
            ticket.requester,
            ticket.module,
            <StatusBadge status={ticket.priority} />,
            ticket.owner,
            `${ticket.slaHours} saat`,
            <StatusBadge status={ticket.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function HelpCenterPage({ articles }) {
  const categories = [...new Set(articles.map((article) => article.category))];

  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Məqalə" value={articles.length} icon={FileText} tone="primary" />
        <MetricCard label="Kateqoriya" value={categories.length} icon={SlidersHorizontal} tone="info" />
        <MetricCard label="FAQ hazırdır" value="100%" icon={Check} tone="success" />
        <MetricCard label="Təlim etiketi" value={articles.reduce((sum, article) => sum + article.tags.length, 0)} icon={Filter} tone="warning" />
      </section>
      <Panel className="help-center-panel">
        <PanelHeader title="Kömək mərkəzi və FAQ" subtitle="Modul izahları, istifadə qaydaları və komandaya təlim materialları" icon={FileText} />
        <div className="help-article-grid">
          {articles.map((article) => (
            <article className="help-article" key={article.id}>
              <div>
                <StatusBadge status={article.category} />
                <h3>{article.title}</h3>
                <p>{article.answer}</p>
              </div>
              <div className="help-tags">
                {article.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function OnboardingPage({ onboarding = {}, rows }) {
  return (
    <div className="stack">
      <section className="metric-grid four">
        <MetricCard label="Qurulum mərhələsi" value={onboarding.companyStage || "Go-live hazırlığı"} icon={ShieldCheck} tone="primary" />
        <MetricCard label="Biznes sahəsi" value={onboarding.businessArea || "Təyin edilməyib"} icon={Building2} tone="info" />
        <MetricCard label="Əməkdaş sayı" value={onboarding.employeeCount || "—"} icon={Users} tone="warning" />
        <MetricCard label="Tamamlanma" value={percent(rows.progress)} icon={Check} tone="success" />
      </section>
      <Panel className="onboarding-panel">
        <PanelHeader title="Yeni şirkət onboarding wizard" subtitle="Şirkət, anbar, rol, maliyyə, bildiriş və təlim addımları" icon={ShieldCheck} />
        <div className="onboarding-progress">
          <ProgressRow value={rows.progress} caption={`${rows.completed}/${rows.steps.length} addım tamamlandı`} />
          {rows.nextStep && <TwoLine title="Növbəti addım" subtitle={`${rows.nextStep.title} · ${rows.nextStep.owner}`} />}
        </div>
        <DataTable
          columns={["Addım", "Məsul", "Status"]}
          rows={rows.steps.map((step) => [
            <TwoLine title={step.title} subtitle={step.id} />,
            step.owner,
            <StatusBadge status={step.status} />,
          ])}
        />
      </Panel>
    </div>
  );
}

function MessagesPage({
  conversations,
  conversationId,
  setConversationId,
  draftMessage,
  setDraftMessage,
  sendMessage,
}) {
  const selected = conversations.find((item) => item.id === conversationId) || conversations[0];
  return (
    <section className="messages-layout">
      <Panel className="message-list-panel">
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-row ${conversation.id === selected?.id ? "active" : ""}`}
              onClick={() => setConversationId(conversation.id)}
            >
              <AvatarLine
                initials={conversation.initials}
                title={conversation.person}
                subtitle={conversation.preview}
              />
              <div className="conversation-meta">
                <span>{conversation.time}</span>
                {conversation.unread > 0 && <strong>{conversation.unread}</strong>}
              </div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel className="chat-panel">
        {selected ? (
          <>
            <div className="chat-head">
              <AvatarLine initials={selected.initials} title={selected.person} subtitle={`${selected.team} şöbəsi · onlayn`} />
            </div>
            <div className="chat-body">
              {selected.messages.map((message, index) => (
                <div key={`${message.time}-${index}`} className={`bubble ${message.from === "Admin" ? "mine" : ""}`}>
                  <p>{message.text}</p>
                  <span>{message.time}</span>
                </div>
              ))}
            </div>
            <div className="composer">
              <input
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Mesaj yazın..."
              />
              <button className="primary-btn icon-only" onClick={sendMessage} aria-label="Mesaj göndər">
                <Send size={17} />
              </button>
            </div>
          </>
        ) : (
          <EmptyState title="Mesaj tapılmadı" />
        )}
      </Panel>
    </section>
  );
}

function NotificationsPage({ notifications, automationRows = [], filter, setFilter, markAll, lastSweepAt }) {
  const filters = ["Cəmi", "Push", "SMS", "Oxunmamış"];
  const list = notifications.filter((item) => {
    if (filter === "Cəmi") return true;
    if (filter === "Oxunmamış") return item.unread;
    return item.type === filter;
  });
  return (
    <div className="stack">
      <Panel>
        <div className="filter-bar">
          <div className="tabs">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
                {item}
              </button>
            ))}
          </div>
          <button className="secondary-btn" onClick={markAll}>
            <Check size={16} />
            Hamısını oxunmuş işarələ
          </button>
        </div>
        {lastSweepAt && (
          <div className="module-action-note">
            <Check size={16} />
            <span>Son oxunma yoxlaması: {lastSweepAt}</span>
          </div>
        )}
      </Panel>
      <Panel className="notification-automation-panel">
        <PanelHeader
          title="Telegram/WhatsApp avtomasiya qaydaları"
          subtitle="Kredit gecikməsi, aşağı stok, PO və payroll siqnalları üçün göndəriş növbəsi"
          icon={Bell}
        />
        <DataTable
          columns={["Qayda", "Kanal", "Trigger", "Növbə", "Son hadisə", "Məsul", "Status"]}
          rows={automationRows.map((rule) => [
            <TwoLine title={rule.name} subtitle={rule.id} />,
            <StatusBadge status={rule.channel} />,
            rule.trigger,
            <strong>{rule.queueCount}</strong>,
            rule.lastEvent,
            rule.owner,
            <StatusBadge status={rule.health} />,
          ])}
        />
      </Panel>
      <Panel>
        <div className="notification-list">
          {list.map((item) => (
            <article className={`notification-row ${item.unread ? "unread" : ""}`} key={item.id}>
              <span className={`dot ${item.unread ? "danger" : ""}`} />
              <div>
                <div className="notification-title">
                  <strong>{item.title}</strong>
                  <StatusBadge status={item.type} />
                </div>
                <p>{item.body}</p>
                <small>{item.time}</small>
              </div>
            </article>
          ))}
          {list.length === 0 && <EmptyState title="Bu filtrdə bildiriş yoxdur" />}
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage({
  settings,
  activeRole,
  auditLog = [],
  dbMeta = {},
  integrityReport = {},
  integritySnapshot = null,
  goLiveReport = {},
  goLiveSnapshot = null,
  permissionCatalog = [],
  modulePermissionCatalog = [],
  users = [],
  toggleSetting,
  updateCompany,
  onSaveSettings,
  onChangeRole,
  onCreateUser,
  onUpdateUserStatus,
  onToggleUserModule,
  onRunIntegrityCheck,
  onRunGoLiveCheck,
  onExportBackup,
  onImportBackup,
  notify,
  requiresPassword = false,
}) {
  const [userDraft, setUserDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: activeRole?.name || defaultRoles[0].name,
    moduleAccess: getDefaultModuleAccessForRole(activeRole?.name || defaultRoles[0].name, defaultRoles),
  });
  const integrations = [
    ["AKB", "Müştəri kredit tarixçəsi sorğusu", "Aktiv"],
    ["SMS Gateway", "Bildirişlər və OTP üçün", "Aktiv"],
    ["1C Mühasibat", "Maliyyə məlumatlarının sinxronizasiyası", "Gözləyir"],
    ["ASAN İmza", "Müqavilələrin rəqəmsal imzalanması", "Gözləyir"],
    ["E-Qaimə Sistemi", "Elektron qaimələrin avtomatik göndərilməsi", "Aktiv"],
  ];
  const roles = settings.roles || defaultRoles;
  const currentRole = activeRole || getActiveRole(settings);
  const shownIntegrity = integritySnapshot || integrityReport;
  const integrityIssues = shownIntegrity.issues || [];
  const shownGoLive = goLiveSnapshot || goLiveReport;
  const goLiveItems = shownGoLive.items || [];
  const formatAuditDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || "—";
    return new Intl.DateTimeFormat("az-AZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  function submitUser(event) {
    event.preventDefault();
    onCreateUser(userDraft);
    setUserDraft({
      name: "",
      email: "",
      password: "",
      role: roles[0]?.name || defaultRoles[0].name,
      moduleAccess: getDefaultModuleAccessForRole(roles[0]?.name || defaultRoles[0].name, roles),
    });
  }

  function changeDraftRole(roleName) {
    setUserDraft((current) => ({
      ...current,
      role: roleName,
      moduleAccess: getDefaultModuleAccessForRole(roleName, roles),
    }));
  }

  function toggleDraftModule(moduleId) {
    setUserDraft((current) => {
      const currentAccess = uniqueModuleIds(current.moduleAccess || []);
      const nextAccess = currentAccess.includes(moduleId)
        ? currentAccess.filter((id) => id !== moduleId)
        : [...currentAccess, moduleId];
      return {
        ...current,
        moduleAccess: nextAccess.length > 0 ? nextAccess : ["dashboard"],
      };
    });
  }

  return (
    <div className="settings-grid">
      <Panel>
        <PanelHeader title="Şirkət Məlumatları" subtitle="Əsas hüquqi və əlaqə məlumatları" />
        <div className="form-grid">
          <Field label="Şirkət adı" value={settings.company} onChange={(value) => updateCompany("company", value)} />
          <Field label="VÖEN" value={settings.voen} onChange={(value) => updateCompany("voen", value)} />
          <Field label="Telefon" value={settings.phone} onChange={(value) => updateCompany("phone", value)} />
          <Field label="Email" value={settings.email} onChange={(value) => updateCompany("email", value)} />
          <Field label="Ünvan" value={settings.address} onChange={(value) => updateCompany("address", value)} full />
        </div>
        <button className="primary-btn" onClick={onSaveSettings}>
          <Check size={16} />
          Yadda saxla
        </button>
      </Panel>

      <Panel>
        <PanelHeader title="Bildiriş Tənzimləmələri" subtitle="Kanallar və avtomatik xəbərdarlıqlar" />
        <div className="toggle-list">
          <Toggle label="Push bildirişlər" checked={settings.toggles.push} onChange={() => toggleSetting("push")} />
          <Toggle label="SMS bildirişlər" checked={settings.toggles.sms} onChange={() => toggleSetting("sms")} />
          <Toggle label="Email bildirişlər" checked={settings.toggles.email} onChange={() => toggleSetting("email")} />
          <Toggle
            label="Kredit ödəniş xəbərdarlığı"
            checked={settings.toggles.creditWarnings}
            onChange={() => toggleSetting("creditWarnings")}
          />
          <Toggle
            label="Anbar stok aşağı həddi"
            checked={settings.toggles.lowStock}
            onChange={() => toggleSetting("lowStock")}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="İnteqrasiyalar" subtitle="Aktiv servis bağlantıları" />
        <div className="integration-list">
          {integrations.map(([name, desc, status]) => (
            <div className="integration-row" key={name}>
              <TwoLine title={name} subtitle={desc} />
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="settings-security-panel">
        <PanelHeader title="İstifadəçilər & Login" subtitle="İstifadəçi yaradın, rol bağlayın və real permission görünüşünü yoxlayın" icon={UserCog} />
        <form className="user-create-form" onSubmit={submitUser}>
          <label>
            <span>Ad Soyad</span>
            <input
              value={userDraft.name}
              onChange={(event) => setUserDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Yeni istifadəçi"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={userDraft.email}
              onChange={(event) => setUserDraft((current) => ({ ...current, email: event.target.value }))}
              placeholder="user@sirket.az"
            />
          </label>
          {requiresPassword && (
            <label>
              <span>İlkin parol</span>
              <input
                type="password"
                minLength="8"
                value={userDraft.password}
                onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))}
                placeholder="Minimum 8 simvol"
                required
              />
            </label>
          )}
          <label>
            <span>Rol</span>
            <select
              value={userDraft.role}
              onChange={(event) => changeDraftRole(event.target.value)}
            >
              {roles.map((role) => (
                <option key={role.name}>{role.name}</option>
              ))}
            </select>
          </label>
          <div className="user-module-picker">
            <span>Modul icazələri</span>
            <div className="module-access-grid compact">
              {modulePermissionCatalog.map((module) => (
                <label key={`draft-${module.id}`} className="module-access-check">
                  <input
                    type="checkbox"
                    checked={(userDraft.moduleAccess || []).includes(module.id)}
                    onChange={() => toggleDraftModule(module.id)}
                  />
                  <span>{module.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="primary-btn" type="submit">
            <Plus size={16} />
            İstifadəçi yarat
          </button>
        </form>
        <DataTable
          columns={["İstifadəçi", "Rol", "Scope", "Modullar", "Status", "Əməliyyat"]}
          rows={users.map((user) => {
            const role = roles.find((item) => item.name === user.role);
            const isCurrent = user.id === settings.sessionUserId;
            const userModuleAccess = normalizeUserModuleAccess(user, roles);
            const isSuperAdmin = user.role === "Super Admin";

            return [
              <TwoLine title={user.name} subtitle={user.email} />,
              <StatusBadge status={user.role} />,
              role?.scope || "Scope yoxdur",
              <div className="module-access-grid">
                {modulePermissionCatalog.map((module) => (
                  <label key={`${user.id}-${module.id}`} className="module-access-check">
                    <input
                      type="checkbox"
                      checked={isSuperAdmin || userModuleAccess.includes(module.id)}
                      disabled={isSuperAdmin}
                      onChange={() => onToggleUserModule(user.id, module.id)}
                    />
                    <span>{module.label}</span>
                  </label>
                ))}
              </div>,
              <StatusBadge status={isCurrent ? "Aktiv sessiya" : user.status} />,
              <button
                className={`text-btn ${user.status === "Aktiv" ? "danger" : ""}`}
                disabled={isCurrent}
                onClick={() => onUpdateUserStatus(user.id, user.status === "Aktiv" ? "Bloklanıb" : "Aktiv")}
              >
                {user.status === "Aktiv" ? "Blokla" : "Aktiv et"}
              </button>,
            ];
          })}
        />
      </Panel>

      <Panel className="settings-security-panel">
        <PanelHeader title="Rollar & İcazələr" subtitle="Modul səviyyəli girişlər" />
        <label className="role-selector">
          <span>Aktiv rol</span>
          <select value={currentRole?.name || ""} onChange={(event) => onChangeRole(event.target.value)}>
            {roles.map((role) => (
              <option key={role.name}>{role.name}</option>
            ))}
          </select>
        </label>
        <DataTable
          columns={["Rol", "İstifadəçi", "Scope", "Real permission"]}
          rows={roles.map((role) => [
            <TwoLine title={role.name} subtitle={role.name === currentRole?.name ? "Aktiv rol" : "Passiv"} />,
            role.users,
            role.scope,
            <div className="permission-chip-list">
              {permissionCatalog.map((permission) => (
                <span
                  key={`${role.name}-${permission.key}`}
                  className={role.permissions?.includes(permission.key) ? "permission-chip allowed" : "permission-chip"}
                >
                  {role.permissions?.includes(permission.key) ? "✓" : "—"} {permission.label}
                </span>
              ))}
            </div>,
          ])}
        />
      </Panel>

      <Panel className="settings-security-panel system-health-panel">
        <PanelHeader
          title="Sistem Sağlamlığı & Backup"
          subtitle="DB bütövlüyü, schema versiyası, backup/export və bərpa əməliyyatları"
          icon={ShieldCheck}
        />
        <section className="metric-grid four">
          <MetricCard
            label="Integrity score"
            value={`${shownIntegrity.score ?? 100}%`}
            trend={shownIntegrity.status || "Yoxlanmayıb"}
            icon={ShieldCheck}
            tone={shownIntegrity.critical > 0 ? "danger" : shownIntegrity.warnings > 0 ? "warning" : "success"}
          />
          <MetricCard label="Kritik siqnal" value={shownIntegrity.critical || 0} icon={CircleAlert} tone={shownIntegrity.critical > 0 ? "danger" : "success"} />
          <MetricCard label="Xəbərdarlıq" value={shownIntegrity.warnings || 0} icon={Bell} tone={shownIntegrity.warnings > 0 ? "warning" : "info"} />
          <MetricCard label="Schema" value={`v${dbMeta.schemaVersion || localDbSchemaVersion}`} trend={formatAuditDate(shownIntegrity.checkedAt)} icon={Database} tone="primary" />
        </section>
        <div className="backup-toolbar">
          <button type="button" className="primary-btn" onClick={onRunIntegrityCheck}>
            <ShieldCheck size={16} />
            Integrity yoxla
          </button>
          <button type="button" className="secondary-btn" onClick={onExportBackup}>
            <Download size={16} />
            Backup export
          </button>
          <label className="secondary-btn file-import-btn">
            <Upload size={16} />
            Backup import
            <input
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImportBackup(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <DataTable
          columns={["Sahə", "Siqnal", "Detal", "Təklif", "Səviyyə"]}
          rows={integrityIssues.slice(0, 8).map((issue) => [
            issue.area,
            <strong>{issue.title}</strong>,
            issue.detail,
            issue.fix,
            <StatusBadge status={issue.severity} />,
          ])}
        />
      </Panel>

      <Panel className="settings-security-panel go-live-panel">
        <PanelHeader
          title="Real Mühitə Çıxış"
          subtitle="Production ERP üçün blokerlər, nəzarət maddələri və deploy öncəsi yoxlama"
          icon={Database}
        />
        <section className="metric-grid four">
          <MetricCard
            label="Go-live score"
            value={`${shownGoLive.score ?? 0}%`}
            trend={shownGoLive.status || "Yoxlanmayıb"}
            icon={ShieldCheck}
            tone={shownGoLive.blockers > 0 ? "danger" : shownGoLive.watch > 0 ? "warning" : "success"}
          />
          <MetricCard label="Bloker" value={shownGoLive.blockers || 0} icon={CircleAlert} tone={shownGoLive.blockers > 0 ? "danger" : "success"} />
          <MetricCard label="Nəzarətdə" value={shownGoLive.watch || 0} icon={Bell} tone={shownGoLive.watch > 0 ? "warning" : "success"} />
          <MetricCard label="Hazır qat" value={shownGoLive.ready || 0} icon={Check} tone="success" />
        </section>
        <div className="backup-toolbar">
          <button type="button" className="primary-btn" onClick={onRunGoLiveCheck}>
            <ShieldCheck size={16} />
            Go-live yoxla
          </button>
          <StatusBadge status={shownGoLive.status || "Yoxlanmayıb"} />
          <span className="module-action-note">
            Son yoxlama: {formatAuditDate(shownGoLive.checkedAt)}
          </span>
        </div>
        <DataTable
          columns={["Qat", "Tələb", "Status", "Risk", "Növbəti addım"]}
          rows={goLiveItems.map((item) => [
            <strong>{item.area}</strong>,
            item.requirement,
            <StatusBadge status={item.status} />,
            <StatusBadge status={item.risk} />,
            item.next,
          ])}
        />
      </Panel>

      <Panel className="settings-security-panel">
        <PanelHeader title="Backend DB & Audit Log" subtitle="Bütün əsas əməliyyatlar qalıcı local DB və audit reyestrinə yazılır" icon={ShieldCheck} />
        <div className="db-status-grid">
          <div>
            <span>Provider</span>
            <strong>{dbMeta.provider || "Local persistent DB"}</strong>
          </div>
          <div>
            <span>Runtime</span>
            <strong>{dbMeta.runtime || "browser"}</strong>
          </div>
          <div>
            <span>Target DB</span>
            <strong>{targetDbProvider}</strong>
          </div>
          <div>
            <span>Storage key</span>
            <strong>{localDbKey}</strong>
          </div>
          <div>
            <span>Son yazılış</span>
            <strong>{formatAuditDate(dbMeta.lastWriteAt)}</strong>
          </div>
          <div>
            <span>Audit sayı</span>
            <strong>{auditLog.length}</strong>
          </div>
        </div>
        <div className="audit-list">
          {auditLog.slice(0, 8).map((entry) => (
            <article className="audit-row" key={entry.id}>
              <div>
                <strong>{entry.action}</strong>
                <span>{entry.module} · {entry.detail}</span>
              </div>
              <TwoLine title={entry.role} subtitle={formatAuditDate(entry.date)} />
              <StatusBadge status={entry.status} />
            </article>
          ))}
          {auditLog.length === 0 && <EmptyState title="Audit qeydi hələ yoxdur" />}
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({ label, value, trend, icon: Icon, tone = "primary" }) {
  return (
    <article className="metric-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {trend && <small>{trend}</small>}
      </div>
      <div className={`metric-icon ${tone}`}>
        <Icon size={20} />
      </div>
    </article>
  );
}

function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function PanelHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {Icon && <Icon size={18} />}
    </div>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState title="Axtarışa uyğun məlumat tapılmadı" />}
    </div>
  );
}

function StatusBadge({ status }) {
  const className = `status ${statusClass(status)}`;
  return <span className={className}>{status}</span>;
}

function statusClass(status) {
  const text = normalize(status);
  if (text.includes("kritik") || text.includes("bloker") || text.includes("yüksək")) return "danger";
  if (text.includes("xəbərdarlıq") || text.includes("nəzarət") || text.includes("hazırlanır") || text.includes("orta")) return "warning";
  if (text.includes("sağlam") || text.includes("test ok") || text.includes("hazır") || text.includes("aşağı")) return "ok";
  if (text.includes("ödənilib")) return "ok";
  if (text.includes("kredit satış")) return "warning";
  if (text.includes("təsdiq edildi") || text.includes("aktiv") || text.includes("platin") || text.includes("canlı")) return "ok";
  if (text.includes("təhvil verilib") || text.includes("imzalanıb") || text.includes("tamamlandı")) return "ok";
  if (text.includes("gecik") || text.includes("imtina") || text.includes("aşağı") || text.includes("sürücü yoxdur")) return "danger";
  if (text.includes("gözləyir") || text.includes("hazır") || text.includes("risk") || text.includes("prioritet") || text.includes("yaxınlaşır")) return "warning";
  if (text.includes("yoldadır") || text.includes("push") || text.includes("sms") || text.includes("planlı") || text.includes("baza")) return "info";
  return "neutral";
}

function TwoLine({ title, subtitle }) {
  return (
    <div className="two-line">
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

function AvatarLine({ initials, title, subtitle }) {
  return (
    <div className="avatar-line">
      <span className="small-avatar">{initials}</span>
      <TwoLine title={title} subtitle={subtitle} />
    </div>
  );
}

function ProgressRow({ label, value, caption, compact = false }) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress-row ${compact ? "compact" : ""}`}>
      {label && (
        <div className="progress-meta">
          <span>{label}</span>
          {caption && <small>{caption}</small>}
        </div>
      )}
      <progress className="progress-track" value={bounded} max="100" aria-label={label || caption || "Progress"} />
    </div>
  );
}

function WorkflowSteps({ activeStage, compact = false }) {
  const activeIndex = stages.indexOf(activeStage);
  return (
    <div className={`workflow-steps ${compact ? "compact" : ""}`}>
      {stages.map((stage, index) => (
        <div
          key={stage}
          className={`workflow-step ${index <= activeIndex ? "done" : ""} ${index === activeIndex ? "current" : ""}`}
        >
          <span>{index + 1}</span>
          <small>{stage}</small>
        </div>
      ))}
    </div>
  );
}

function TaskItem({ tone, title, value, label }) {
  return (
    <div className={`task-item ${tone}`}>
      <div>
        <strong>{title}</strong>
        <span>{label}</span>
      </div>
      <b>{value}</b>
    </div>
  );
}

function EmptyState({ title }) {
  return (
    <div className="empty-state">
      <Filter size={20} />
      <span>{title}</span>
    </div>
  );
}

function Field({ label, value, onChange, full = false }) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button className="toggle-row" onClick={onChange}>
      <span>{label}</span>
      <span className={`switch ${checked ? "on" : ""}`}>
        <i />
      </span>
    </button>
  );
}

function WarehouseFormModal({ mode, warehouse, onClose, onSubmit }) {
  const [values, setValues] = useState({
    code: warehouse?.code || "",
    name: warehouse?.name || "",
    city: warehouse?.city || "",
    address: warehouse?.address || "",
    manager: warehouse?.manager || "",
    type: warehouse?.type || "Regional",
    capacity: warehouse?.capacity || 100,
    status: warehouse?.status || "Aktiv",
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>{mode === "edit" ? "Anbarı redaktə et" : "Yeni anbar yarat"}</h2>
            <p>Anbar adı, kodu, ünvanı, məsul şəxsi və tutum məlumatlarını daxil edin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label>
            <span>Anbar kodu</span>
            <input
              value={values.code}
              required
              onChange={(event) => updateValue("code", event.target.value)}
            />
          </label>
          <label>
            <span>Anbar adı</span>
            <input
              value={values.name}
              required
              onChange={(event) => updateValue("name", event.target.value)}
            />
          </label>
          <label>
            <span>Şəhər</span>
            <input
              value={values.city}
              required
              onChange={(event) => updateValue("city", event.target.value)}
            />
          </label>
          <label>
            <span>Məsul şəxs</span>
            <input
              value={values.manager}
              required
              onChange={(event) => updateValue("manager", event.target.value)}
            />
          </label>
          <label>
            <span>Növ</span>
            <select value={values.type} onChange={(event) => updateValue("type", event.target.value)}>
              <option>Mərkəzi</option>
              <option>Regional</option>
              <option>Təhvil</option>
              <option>Servis</option>
            </select>
          </label>
          <label>
            <span>Tutum</span>
            <input
              type="number"
              min="0"
              value={values.capacity}
              required
              onChange={(event) => updateValue("capacity", event.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select value={values.status} onChange={(event) => updateValue("status", event.target.value)}>
              <option>Aktiv</option>
              <option>Passiv</option>
              <option>Təmir</option>
            </select>
          </label>
          <label className="full">
            <span>Ünvan</span>
            <input
              value={values.address}
              required
              onChange={(event) => updateValue("address", event.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Ləğv et
            </button>
            <button type="submit" className="primary-btn">
              {mode === "edit" ? "Yadda saxla" : "Anbar yarat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductFormModal({ product, onClose, onSubmit }) {
  const [values, setValues] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "Elektronika",
    unit: product?.unit || "ədəd",
    costPrice: product?.costPrice || 0,
    salePrice: product?.salePrice || 0,
    reorderLevel: product?.reorderLevel || 0,
    serialTracked: product?.serialTracked ? "Bəli" : "Xeyr",
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>{product ? "Məhsulu redaktə et" : "Yeni məhsul"}</h2>
            <p>SKU, qiymət, minimum stok və serial izləmə qaydasını təyin edin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label>
            <span>Məhsul adı</span>
            <input value={values.name} required onChange={(event) => updateValue("name", event.target.value)} />
          </label>
          <label>
            <span>SKU</span>
            <input value={values.sku} required onChange={(event) => updateValue("sku", event.target.value)} />
          </label>
          <label>
            <span>Kateqoriya</span>
            <select value={values.category} onChange={(event) => updateValue("category", event.target.value)}>
              <option>Elektronika</option>
              <option>Məişət texnikası</option>
              <option>Aksesuar</option>
              <option>Xidmət</option>
              <option>Digər</option>
            </select>
          </label>
          <label>
            <span>Ölçü vahidi</span>
            <select value={values.unit} onChange={(event) => updateValue("unit", event.target.value)}>
              <option>ədəd</option>
              <option>qutu</option>
              <option>kg</option>
              <option>metr</option>
              <option>litr</option>
            </select>
          </label>
          <label>
            <span>Minimum stok</span>
            <input type="number" min="0" value={values.reorderLevel} onChange={(event) => updateValue("reorderLevel", event.target.value)} />
          </label>
          <label>
            <span>Alış qiyməti</span>
            <input type="number" min="0" step="0.01" value={values.costPrice} onChange={(event) => updateValue("costPrice", event.target.value)} />
          </label>
          <label>
            <span>Satış qiyməti</span>
            <input type="number" min="0" step="0.01" value={values.salePrice} onChange={(event) => updateValue("salePrice", event.target.value)} />
          </label>
          <label className="full">
            <span>IMEI / serial izləmə</span>
            <select value={values.serialTracked} onChange={(event) => updateValue("serialTracked", event.target.value)}>
              <option>Bəli</option>
              <option>Xeyr</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
            <button type="submit" className="primary-btn">
              <Check size={16} />
              {product ? "Yadda saxla" : "Məhsul yarat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HrEmployeeModal({ employee = null, employees = [], departments: departmentRecords = [], onClose, onSubmit }) {
  const existingManager = employee ? getEmployeeManager(employee, employees) : null;
  const savedDocumentsComplete =
    employee?.documentReviewRequired || employee?.hrStatus === "Məlumat gözləyir"
      ? Number(employee.documentsComplete || 0)
      : 100;
  const departments = [...new Set([
    ...employees.map((employee) => employee.department),
    ...departmentRecords.map((department) => department.name),
  ].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );
  const parentDepartments = [...new Set([
    ...departments,
    ...employees.map((employee) => getDepartmentParentName(employee)),
    ...departmentRecords.map((department) => department.parentDepartment),
  ].filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "az"),
  );
  const [values, setValues] = useState({
    name: employee?.name || "",
    position: employee?.position || "",
    department: employee?.department || "",
    departmentParent: employee ? getDepartmentParentName(employee) : "",
    managerId: existingManager ? getEmployeeKey(existingManager) : "",
    level: employee ? getEmployeeLevel(employee) : "Komanda üzvü",
    salary: employee?.salary ?? "",
    kpi: employee?.kpi ?? "85",
    hireDate: employee?.hireDate || currentBusinessDate,
    workMode: employee?.workMode || "Ofis",
    shift: employee?.shift || "09:00-18:00",
    employmentType: employee?.employmentType || "Tam ştat",
    leaveBalance: employee?.leaveBalance ?? "0",
    documentsComplete: String(savedDocumentsComplete),
    hrStatus: employee?.hrStatus === "Məlumat gözləyir" ? "Məlumat gözləyir" : "Stabil",
    skills: Array.isArray(employee?.skills) ? employee.skills.join(", ") : "",
  });
  const managerOptions = employees.filter((item) => getEmployeeKey(item) !== getEmployeeKey(employee || {}));

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...values, documentsComplete: Number(values.documentsComplete || 0) });
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card hr-employee-modal">
        <div className="modal-head">
          <div>
            <h2>{employee ? "Əməkdaşı redaktə et" : "Yeni əməkdaş"}</h2>
            <p>{employee ? "Əməkdaşın şəxsi, iş və tabeçilik məlumatlarını yeniləyin." : "Şöbə və tabeçilik məlumatını daxil edin."}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <label><span>Ad Soyad</span><input value={values.name} required onChange={(event) => updateValue("name", event.target.value)} /></label>
          <label><span>Vəzifə</span><input value={values.position} required onChange={(event) => updateValue("position", event.target.value)} /></label>
          <label>
            <span>Şöbə</span>
            <input value={values.department} list="employee-departments" required onChange={(event) => updateValue("department", event.target.value)} />
            <datalist id="employee-departments">{departments.map((department) => <option key={department} value={department} />)}</datalist>
          </label>
          <label>
            <span>Üst şöbə</span>
            <input value={values.departmentParent} list="employee-parent-departments" onChange={(event) => updateValue("departmentParent", event.target.value)} />
            <datalist id="employee-parent-departments"><option value="" />{parentDepartments.map((department) => <option key={department} value={department} />)}</datalist>
          </label>
          <label>
            <span>Kimə tabedir</span>
            <select value={values.managerId} onChange={(event) => updateValue("managerId", event.target.value)}>
              <option value="">Birbaşa rəhbərlik</option>
              {managerOptions.map((manager) => <option key={getEmployeeKey(manager)} value={getEmployeeKey(manager)}>{manager.name} · {manager.position}</option>)}
            </select>
          </label>
          <label>
            <span>Səviyyə</span>
            <select value={values.level} onChange={(event) => updateValue("level", event.target.value)}>{hrLevelOptions.map((level) => <option key={level}>{level}</option>)}</select>
          </label>
          <label><span>Maaş</span><input type="number" min="0" value={values.salary} required onChange={(event) => updateValue("salary", event.target.value)} /></label>
          <label><span>KPI</span><input type="number" min="0" value={values.kpi} onChange={(event) => updateValue("kpi", event.target.value)} /></label>
          <label><span>Sənəd uyğunluğu, %</span><input type="number" min="0" max="100" value={values.documentsComplete} onChange={(event) => updateValue("documentsComplete", event.target.value)} /></label>
          <label><span>HR statusu</span><select value={values.hrStatus} onChange={(event) => updateValue("hrStatus", event.target.value)}><option>Stabil</option><option>Məlumat gözləyir</option></select></label>
          <label><span>İşə qəbul tarixi</span><input type="date" value={values.hireDate} onChange={(event) => updateValue("hireDate", event.target.value)} /></label>
          <label><span>İş rejimi</span><select value={values.workMode} onChange={(event) => updateValue("workMode", event.target.value)}><option>Ofis</option><option>Hybrid</option><option>Sahə</option><option>Uzaqdan</option></select></label>
          <label><span>Növbə</span><input value={values.shift} onChange={(event) => updateValue("shift", event.target.value)} /></label>
          <label><span>Məşğulluq tipi</span><select value={values.employmentType} onChange={(event) => updateValue("employmentType", event.target.value)}><option>Tam ştat</option><option>Yarım ştat</option><option>Müqaviləli</option><option>Sınaq müddəti</option></select></label>
          <label><span>Məzuniyyət balansı</span><input type="number" min="0" value={values.leaveBalance} onChange={(event) => updateValue("leaveBalance", event.target.value)} /></label>
          <label className="full"><span>Bacarıqlar</span><input value={values.skills} onChange={(event) => updateValue("skills", event.target.value)} /></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button><button type="submit" className="primary-btn">{employee ? <Check size={16} /> : <Plus size={16} />}{employee ? "Yadda saxla" : "Əməkdaş yarat"}</button></div>
        </form>
      </div>
    </div>
  );
}

function HrDepartmentModal({ employees = [], departments = [], onClose, onSubmit }) {
  const parentDepartments = [...new Set([
    ...employees.map((employee) => employee.department),
    ...employees.map((employee) => getDepartmentParentName(employee)),
    ...departments.map((department) => department.name),
    ...departments.map((department) => department.parentDepartment),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b, "az"));
  const [values, setValues] = useState({ name: "", parentDepartment: "", description: "", status: "Aktiv" });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card hr-department-modal">
        <div className="modal-head">
          <div>
            <h2>Yeni şöbə</h2>
            <p>Şöbəni struktur ağacına əlavə edin və istəsəniz onu üst şöbəyə bağlayın.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          <label><span>Şöbə adı</span><input value={values.name} required autoFocus onChange={(event) => updateValue("name", event.target.value)} /></label>
          <label>
            <span>Üst şöbə</span>
            <input value={values.parentDepartment} list="new-department-parents" onChange={(event) => updateValue("parentDepartment", event.target.value)} />
            <datalist id="new-department-parents"><option value="" />{parentDepartments.map((department) => <option key={department} value={department} />)}</datalist>
          </label>
          <label className="full"><span>Qısa izah</span><textarea value={values.description} onChange={(event) => updateValue("description", event.target.value)} /></label>
          <label><span>Status</span><select value={values.status} onChange={(event) => updateValue("status", event.target.value)}><option>Aktiv</option><option>Planlanır</option><option>Passiv</option></select></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button><button type="submit" className="primary-btn"><Plus size={16} /> Şöbə əlavə et</button></div>
        </form>
      </div>
    </div>
  );
}

function HrEmployeeDeleteModal({ employee, employees = [], onClose, onConfirm }) {
  const employeeId = getEmployeeKey(employee);
  const directReports = employees.filter(
    (item) => item.managerId === employeeId || (!item.managerId && item.managerName === employee.name),
  );
  const directReportIds = new Set(directReports.map((item) => getEmployeeKey(item)));
  const replacementOptions = employees.filter(
    (item) => getEmployeeKey(item) !== employeeId && !directReportIds.has(getEmployeeKey(item)),
  );
  const currentManager = getEmployeeManager(employee, employees);
  const [replacementManagerId, setReplacementManagerId] = useState(
    currentManager ? getEmployeeKey(currentManager) : "",
  );

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card hr-delete-modal">
        <div className="modal-head">
          <div>
            <h2>Əməkdaşı sil</h2>
            <p>Bu əməliyyat əməkdaşı HR reyestrindən silir və audit izini saxlayır.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <div className="hr-delete-summary">
          <AvatarLine initials={employee.initials} title={employee.name} subtitle={`${employee.position} · ${employee.department}`} />
          <span>{directReports.length ? `${directReports.length} əməkdaş bu şəxsə tabedir` : "Birbaşa tabe əməkdaş yoxdur"}</span>
        </div>
        {directReports.length > 0 && (
          <label className="hr-delete-reassignment">
            <span>Tabe əməkdaşların yeni rəhbəri</span>
            <select value={replacementManagerId} onChange={(event) => setReplacementManagerId(event.target.value)}>
              <option value="">Birbaşa rəhbərlik</option>
              {replacementOptions.map((manager) => <option key={getEmployeeKey(manager)} value={getEmployeeKey(manager)}>{manager.name} · {manager.position}</option>)}
            </select>
            <small>{directReports.map((report) => report.name).join(", ")}</small>
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
          <button type="button" className="secondary-btn danger-outline" onClick={() => onConfirm(replacementManagerId)}><Trash2 size={16} /> Sil</button>
        </div>
      </div>
    </div>
  );
}

function HrLeaveRequestModal({ employees = [], onClose, onSubmit }) {
  const [values, setValues] = useState({
    employeeId: employees[0] ? getEmployeeKey(employees[0]) : "",
    type: "İllik məzuniyyət",
    from: currentBusinessDate,
    to: currentBusinessDate,
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card hr-operation-modal">
        <div className="modal-head">
          <div>
            <h2>Məzuniyyət qeydi</h2>
            <p>Əməkdaş, məzuniyyət növü və tarix aralığını qeyd edin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
          <label><span>Əməkdaş</span><select value={values.employeeId} required onChange={(event) => updateValue("employeeId", event.target.value)}><option value="">Əməkdaş seçin</option>{employees.map((employee) => <option key={getEmployeeKey(employee)} value={getEmployeeKey(employee)}>{employee.name} · {employee.department}</option>)}</select></label>
          <label><span>Məzuniyyət növü</span><select value={values.type} onChange={(event) => updateValue("type", event.target.value)}><option>İllik məzuniyyət</option><option>Ödənişsiz məzuniyyət</option><option>Xəstəlik vərəqəsi</option><option>Ezamiyyət</option></select></label>
          <label><span>Başlanğıc tarixi</span><input type="date" value={values.from} required onChange={(event) => updateValue("from", event.target.value)} /></label>
          <label><span>Bitmə tarixi</span><input type="date" value={values.to} required onChange={(event) => updateValue("to", event.target.value)} /></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button><button type="submit" className="primary-btn"><CalendarClock size={16} /> Qeyd yarat</button></div>
        </form>
      </div>
    </div>
  );
}

function HrVacancyModal({ employees = [], departments = [], onClose, onSubmit }) {
  const departmentOptions = [...new Set([
    ...employees.map((employee) => employee.department),
    ...departments.map((department) => department.name),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b, "az"));
  const [values, setValues] = useState({
    role: "",
    department: departmentOptions[0] || "",
    owner: "HR",
    targetDate: currentBusinessDate,
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card hr-operation-modal">
        <div className="modal-head">
          <div>
            <h2>Yeni vakansiya</h2>
            <p>Rol, şöbə və hədəf tarixi qeyd etməklə recruitment pipeline başlayın.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
          <label><span>Rol</span><input value={values.role} required autoFocus onChange={(event) => updateValue("role", event.target.value)} /></label>
          <label><span>Şöbə</span><input value={values.department} list="vacancy-departments" required onChange={(event) => updateValue("department", event.target.value)} /><datalist id="vacancy-departments">{departmentOptions.map((department) => <option key={department} value={department} />)}</datalist></label>
          <label><span>Owner</span><input value={values.owner} required onChange={(event) => updateValue("owner", event.target.value)} /></label>
          <label><span>Hədəf tarixi</span><input type="date" value={values.targetDate} onChange={(event) => updateValue("targetDate", event.target.value)} /></label>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button><button type="submit" className="primary-btn"><Plus size={16} /> Vakansiya yarat</button></div>
        </form>
      </div>
    </div>
  );
}

function FinanceAccountModal({ account, onClose, onSubmit }) {
  const [values, setValues] = useState({
    name: account?.name || "",
    code: account?.code || "",
    type: account?.type || "Kassa",
    currency: account?.currency || "AZN",
    openingBalance: account?.openingBalance || 0,
    status: account?.status || "Aktiv",
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>{account ? "Hesabı redaktə et" : "Yeni maliyyə hesabı"}</h2>
            <p>Kassa və bank açılış balansını düzgün qeyd edin; bu dəyər maliyyə hesabatlarına daxil olur.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label>
            <span>Hesab adı</span>
            <input value={values.name} required onChange={(event) => updateValue("name", event.target.value)} />
          </label>
          <label>
            <span>Hesab kodu</span>
            <input value={values.code} required onChange={(event) => updateValue("code", event.target.value)} />
          </label>
          <label>
            <span>Tip</span>
            <select value={values.type} onChange={(event) => updateValue("type", event.target.value)}>
              <option>Kassa</option>
              <option>Bank</option>
              <option>POS</option>
            </select>
          </label>
          <label>
            <span>Valyuta</span>
            <select value={values.currency} onChange={(event) => updateValue("currency", event.target.value)}>
              <option>AZN</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
          <label>
            <span>Açılış balansı</span>
            <input type="number" min="0" step="0.01" value={values.openingBalance} onChange={(event) => updateValue("openingBalance", event.target.value)} />
          </label>
          <label>
            <span>Status</span>
            <select value={values.status} onChange={(event) => updateValue("status", event.target.value)}>
              <option>Aktiv</option>
              <option>Passiv</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
            <button type="submit" className="primary-btn"><Check size={16} /> Yadda saxla</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockIntakeModal({ warehouses, products = [], onClose, onSubmit }) {
  const [values, setValues] = useState({
    warehouseId: warehouses[0]?.id || "",
    product: "",
    qty: 1,
    price: 0,
  });

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>İlkin mədaxil</h2>
            <p>İlk məhsulu seçilmiş anbara daxil edin. Məhsul avtomatik ümumi stokda da görünəcək.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label className="full">
            <span>Anbar</span>
            <select
              value={values.warehouseId}
              required
              onChange={(event) => updateValue("warehouseId", event.target.value)}
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} · {warehouse.city}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            <span>Məhsul adı</span>
            {products.length > 0 ? (
              <select
                value={values.product}
                required
                onChange={(event) => {
                  const selected = products.find((product) => product.name === event.target.value);
                  setValues((current) => ({
                    ...current,
                    product: event.target.value,
                    price: selected?.salePrice ?? current.price,
                  }));
                }}
              >
                <option value="">Məhsul seçin</option>
                {products.filter((product) => product.status !== "Passiv").map((product) => (
                  <option key={product.id} value={product.name}>{product.sku} · {product.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={values.product}
                required
                onChange={(event) => updateValue("product", event.target.value)}
              />
            )}
          </label>
          <label>
            <span>Miqdar</span>
            <input
              type="number"
              min="1"
              value={values.qty}
              required
              onChange={(event) => updateValue("qty", event.target.value)}
            />
          </label>
          <label>
            <span>Satış qiyməti</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              required
              onChange={(event) => updateValue("price", event.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Ləğv et
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={16} />
              Mədaxil et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WarehouseImportModal({ warehouses, onClose, onImport }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState({ rows: [], errors: [] });
  const [isReading, setIsReading] = useState(false);

  async function readFile(file) {
    if (!file) return;
    setIsReading(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      setAnalysis(parseWarehouseImportCsv(text, warehouses));
    } catch {
      setAnalysis({ rows: [], errors: ["CSV faylı oxunmadı."] });
    } finally {
      setIsReading(false);
    }
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card warehouse-import-card">
        <div className="modal-head">
          <div>
            <h2>Toplu stok importu</h2>
            <p>CSV faylından anbar qalıqlarını əlavə edin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla"><X size={18} /></button>
        </div>

        <div className="warehouse-import-actions">
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept=".csv,text/csv"
            aria-label="CSV faylı seçin"
            onChange={(event) => readFile(event.target.files?.[0])}
          />
          <button type="button" className="primary-btn" disabled={isReading} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> {isReading ? "Oxunur..." : "CSV seçin"}
          </button>
          <button type="button" className="secondary-btn" onClick={downloadWarehouseImportTemplate}>
            <Download size={16} /> Şablon CSV
          </button>
          {fileName && <span>{fileName}</span>}
        </div>

        {(analysis.rows.length > 0 || analysis.errors.length > 0) && (
          <>
            <div className="warehouse-import-summary">
              <strong>{analysis.rows.length} etibarlı sətir</strong>
              <span>{analysis.errors.length} xəta</span>
            </div>
            {analysis.rows.length > 0 && (
              <DataTable
                columns={["Məhsul", "SKU", "Anbar", "Miqdar", "Satış", "Maya", "Minimum"]}
                rows={analysis.rows.slice(0, 8).map((row) => [
                  <strong>{row.product}</strong>,
                  row.sku || "Avtomatik",
                  row.warehouseName,
                  row.qty,
                  row.salePrice === null ? "—" : money(row.salePrice),
                  row.costPrice === null ? "—" : money(row.costPrice),
                  row.reorderLevel === null ? "—" : row.reorderLevel,
                ])}
              />
            )}
            {analysis.errors.length > 0 && (
              <div className="warehouse-import-errors">
                {analysis.errors.slice(0, 5).map((error) => <span key={error}>{error}</span>)}
                {analysis.errors.length > 5 && <span>və daha {analysis.errors.length - 5} xəta</span>}
              </div>
            )}
          </>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
          <button type="button" className="primary-btn" disabled={analysis.rows.length === 0 || isReading} onClick={() => onImport(analysis.rows)}>
            <Upload size={16} /> İmport et
          </button>
        </div>
      </div>
    </div>
  );
}

function SalesOperationModal({ order, orderOptions, onClose, onSubmit }) {
  const customers = orderOptions.customers || [];
  const stock = orderOptions.stock || [];
  const warehouses = orderOptions.warehouses || [];
  const warehouseStock = orderOptions.warehouseStock || {};
  const sellers = orderOptions.sellers || [];
  const delivered = order.status === "Təhvil verilib";
  const firstWarehouseId = order.warehouseId || warehouses[0]?.id || "";
  const firstSeller = sellers[0] || { name: "" };

  const getStockOptions = (targetWarehouseId) => {
    const rows = warehouseStock[targetWarehouseId]?.length ? warehouseStock[targetWarehouseId] : stock;
    const byProduct = new Map(rows.map((item) => [item.product, item]));
    (order.productLines || []).forEach((line) => {
      if (!byProduct.has(line.product)) {
        byProduct.set(line.product, {
          product: line.product,
          total: Number(line.qty || 0),
          reserved: Number(line.qty || 0),
          price: Number(line.price || 0),
        });
      }
    });
    return [...byProduct.values()];
  };

  const [warehouseId, setWarehouseId] = useState(firstWarehouseId);
  const availableStock = getStockOptions(warehouseId);
  const firstProduct = availableStock[0] || { product: "", price: 0 };
  const [customerFin, setCustomerFin] = useState(order.fin || customers[0]?.fin || "");
  const [customerName, setCustomerName] = useState(order.customer || customers.find((customer) => customer.fin === order.fin)?.name || "");
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod || "Nağd");
  const [creditMonths, setCreditMonths] = useState(order.creditMonths || 12);
  const [initialPayment, setInitialPayment] = useState(order.initialPayment ?? order.paid ?? 0);
  const [paid, setPaid] = useState(order.paid ?? order.amount ?? 0);
  const [amount, setAmount] = useState(order.amount ?? calculateOrderLineTotal(order.productLines || []));
  const [date, setDate] = useState(order.date || currentBusinessDate);
  const [status, setStatus] = useState(order.status || stages[0]);
  const [address, setAddress] = useState(order.address || "");
  const [note, setNote] = useState(order.note || "");
  const [productRows, setProductRows] = useState(() => {
    const rows = normalizeOrderProductLines(order.productLines || []);
    return (rows.length > 0 ? rows : [{ product: firstProduct.product, qty: 1, price: firstProduct.price }]).map((row) => ({
      id: crypto.randomUUID(),
      ...row,
    }));
  });
  const [sellerRows, setSellerRows] = useState(() => {
    const rows = getOrderSellerBonuses(order);
    return (rows.length > 0 ? rows : [{ seller: firstSeller.name, bonus: 0 }]).map((row) => ({
      id: crypto.randomUUID(),
      ...row,
    }));
  });

  const selectedCustomer = customers.find((customer) => customer.fin === customerFin);
  const lineTotal = calculateOrderLineTotal(productRows);
  const paymentPreview = paymentMethod === "Kredit" ? Number(initialPayment || 0) : Number(paid || 0);
  const bonusRate = sellerRows.reduce((sum, row) => sum + Number(row.bonus || 0), 0);
  const canSubmit = Boolean(customerName && warehouseId && productRows.some((row) => row.product) && Number(amount || 0) > 0);

  function changeCustomer(fin) {
    const customer = customers.find((item) => item.fin === fin);
    setCustomerFin(fin);
    if (customer) setCustomerName(customer.name);
  }

  function changeWarehouse(nextWarehouseId) {
    const nextStock = getStockOptions(nextWarehouseId);
    const nextFirst = nextStock[0] || { product: "", price: 0 };
    setWarehouseId(nextWarehouseId);
    setProductRows((rows) =>
      rows.map((row) => {
        const match = nextStock.find((item) => item.product === row.product) || nextFirst;
        return {
          ...row,
          product: match.product,
          price: match.price ?? row.price,
          serials: [],
        };
      }),
    );
  }

  function changeProduct(rowId, field, value) {
    setProductRows((rows) =>
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "product") {
          const match = availableStock.find((item) => item.product === value);
          return { ...row, product: value, price: match?.price ?? row.price, serials: [] };
        }
        return { ...row, [field]: value };
      }),
    );
  }

  function addProductRow() {
    setProductRows((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        product: firstProduct.product,
        qty: 1,
        price: firstProduct.price,
        serials: [],
      },
    ]);
  }

  function removeProductRow(rowId) {
    setProductRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId)));
  }

  function changeSeller(rowId, field, value) {
    setSellerRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  }

  function addSellerRow() {
    if (sellerRows.length >= 3) return;
    const used = new Set(sellerRows.map((row) => row.seller));
    const nextSeller = sellers.find((seller) => !used.has(seller.name)) || firstSeller;
    setSellerRows((rows) => [...rows, { id: crypto.randomUUID(), seller: nextSeller.name, bonus: 0 }]);
  }

  function removeSellerRow(rowId) {
    setSellerRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId)));
  }

  function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      customer: customerName,
      fin: customerFin,
      warehouseId,
      productLines: productRows,
      sellers: sellerRows,
      amount: Number(amount || lineTotal),
      paid,
      paymentMethod,
      creditMonths,
      initialPayment,
      date,
      status,
      address,
      note,
      bonusTotal: (paymentPreview * bonusRate) / 100,
    });
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card order-modal-card">
        <div className="modal-head order-modal-head">
          <div>
            <h2>Satış əməliyyatını redaktə et</h2>
            <p>{order.id} üzrə müştəri, ödəniş, bonus və rezerv məlumatlarını yeniləyin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="order-modal-form">
          <section className="order-section">
            <label className="order-label">MÜŞTƏRİ VƏ ÖDƏNİŞ</label>
            <div className="order-two-col">
              <select value={customerFin} onChange={(event) => changeCustomer(event.target.value)}>
                {customers.map((customer) => (
                  <option key={customer.fin} value={customer.fin}>
                    {customer.name} — {customer.fin}
                  </option>
                ))}
                {!customers.some((customer) => customer.fin === customerFin) && <option value={customerFin}>{customerName}</option>}
              </select>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option>Nağd</option>
                <option>Kart</option>
                <option>Köçürmə</option>
                <option>Kredit</option>
              </select>
            </div>
            <div className="order-two-col">
              <label className="order-sub-field">
                <span>Müştəri adı</span>
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
              </label>
              <label className="order-sub-field">
                <span>Tarix</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
            </div>
            <label className="order-sub-field">
              <span>ANBAR</span>
              <select value={warehouseId} onChange={(event) => changeWarehouse(event.target.value)} disabled={delivered}>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} — {warehouse.city}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="order-section">
            <div className="section-title-row">
              <span className="order-label">MƏHSULLAR</span>
              <button type="button" className="secondary-btn" onClick={addProductRow} disabled={delivered}>
                <Plus size={16} />
                Sətr əlavə et
              </button>
            </div>
            <div className="order-lines">
              {productRows.map((row) => (
                <div className="order-line-grid" key={row.id}>
                  <select value={row.product} onChange={(event) => changeProduct(row.id, "product", event.target.value)} disabled={delivered}>
                    {availableStock.map((item) => (
                      <option key={item.product} value={item.product}>
                        {item.product} — {getAvailableQuantity(item)} satış üçün
                      </option>
                    ))}
                  </select>
                  <input type="number" min="1" value={row.qty} onChange={(event) => changeProduct(row.id, "qty", event.target.value)} disabled={delivered} />
                  <input type="number" min="0" value={row.price} onChange={(event) => changeProduct(row.id, "price", event.target.value)} disabled={delivered} />
                  <button type="button" className="line-delete" onClick={() => removeProductRow(row.id)} disabled={delivered} aria-label="Məhsul sətrini sil">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            <div className="order-total edit-order-total">
              <span>Sətir cəmi: {money(lineTotal)}</span>
              <label>
                <span>Yekun məbləğ</span>
                <input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </label>
            </div>
          </section>

          {paymentMethod === "Kredit" ? (
            <section className="order-section credit-order-section">
              <span className="order-label">
                <CreditCard size={16} />
                KREDİT ŞƏRTLƏRİ
              </span>
              <div className="credit-order-grid">
                <label className="order-sub-field">
                  <span>Müddət</span>
                  <select value={creditMonths} onChange={(event) => setCreditMonths(Number(event.target.value))}>
                    {creditTermOptions.map((month) => (
                      <option key={month} value={month}>{month} ay</option>
                    ))}
                  </select>
                </label>
                <label className="order-sub-field">
                  <span>İlkin ödəniş</span>
                  <input type="number" min="0" max={amount} value={initialPayment} onChange={(event) => setInitialPayment(event.target.value)} />
                </label>
              </div>
            </section>
          ) : (
            <section className="order-section">
              <label className="order-sub-field">
                <span>Daxil olan</span>
                <input type="number" min="0" max={amount} value={paid} onChange={(event) => setPaid(event.target.value)} />
              </label>
            </section>
          )}

          <section className="order-section">
            <div className="section-title-row">
              <span className="order-label seller-title">
                <Users size={16} />
                SATICI BONUSLARI
              </span>
              <button type="button" className="secondary-btn" disabled={sellerRows.length >= 3} onClick={addSellerRow}>
                <Plus size={16} />
                Satıcı əlavə et
              </button>
            </div>
            <div className="order-lines">
              {sellerRows.map((row) => (
                <div className="seller-line-grid" key={row.id}>
                  <select value={row.seller} onChange={(event) => changeSeller(row.id, "seller", event.target.value)}>
                    {sellers.map((seller) => (
                      <option key={seller.name} value={seller.name}>{seller.name}</option>
                    ))}
                    {row.seller && !sellers.some((seller) => seller.name === row.seller) && <option value={row.seller}>{row.seller}</option>}
                  </select>
                  <label className="bonus-input">
                    <input type="number" min="0" max="100" value={row.bonus} onChange={(event) => changeSeller(row.id, "bonus", event.target.value)} />
                    <span>% bonus</span>
                  </label>
                  <button type="button" className="line-delete" onClick={() => removeSellerRow(row.id)} aria-label="Satıcı sətrini sil">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="order-section">
            <div className="order-two-col">
              <label className="order-sub-field">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  {stages
                    .filter((stage) => delivered || stage !== "Təhvil verilib")
                    .map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                </select>
              </label>
              <label className="order-sub-field">
                <span>Ünvan</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} />
              </label>
            </div>
            <label className="order-sub-field">
              <span>Qeyd</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
          </section>

          <div className="modal-actions order-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
            <button type="submit" className="primary-btn" disabled={!canSubmit}>Yadda saxla</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseOperationModal({ expense, onClose, onSubmit }) {
  const [values, setValues] = useState({
    description: expense.description || "",
    category: expense.category || "",
    date: expense.date || currentBusinessDate,
    amount: expense.amount || 0,
    status: expense.status || "Təsdiq gözləyir",
    note: expense.note || "",
  });

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>Xərc əməliyyatını redaktə et</h2>
            <p>{expense.id} üzrə məbləğ, kateqoriya və statusu yeniləyin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          <label className="full">
            <span>Təsvir</span>
            <input value={values.description} onChange={(event) => updateValue("description", event.target.value)} required />
          </label>
          <label>
            <span>Kateqoriya</span>
            <input value={values.category} onChange={(event) => updateValue("category", event.target.value)} required />
          </label>
          <label>
            <span>Tarix</span>
            <input type="date" value={values.date} onChange={(event) => updateValue("date", event.target.value)} />
          </label>
          <label>
            <span>Məbləğ</span>
            <input type="number" min="0" value={values.amount} onChange={(event) => updateValue("amount", event.target.value)} required />
          </label>
          <label>
            <span>Status</span>
            <select value={values.status} onChange={(event) => updateValue("status", event.target.value)}>
              <option>Təsdiq gözləyir</option>
              <option>Təsdiq edildi</option>
              <option>İmtina edildi</option>
            </select>
          </label>
          <label className="full">
            <span>Qeyd</span>
            <textarea value={values.note} onChange={(event) => updateValue("note", event.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
            <button type="submit" className="primary-btn">Yadda saxla</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OperationDeleteModal({ title, description, warning, onClose, onConfirm }) {
  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card operation-delete-modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <div className="operation-delete-warning">
          <CircleAlert size={18} />
          <span>{warning}</span>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>Ləğv et</button>
          <button type="button" className="secondary-btn danger-outline" onClick={onConfirm}>
            <Trash2 size={16} />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

function SalesOrderModal({ type, onClose, onCreate, orderOptions, defaults = {} }) {
  const customers = orderOptions.customers;
  const stock = orderOptions.stock;
  const sellers = orderOptions.sellers;
  const warehouses = orderOptions.warehouses || [];
  const warehouseStock = orderOptions.warehouseStock || {};
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const availableStock = warehouseStock[warehouseId]?.length ? warehouseStock[warehouseId] : stock;
  const firstProduct = availableStock[0] || stock[0] || { product: "", price: 0 };
  const firstSeller = sellers[0] || { name: "" };
  const [customerFin, setCustomerFin] = useState(customers[0]?.fin || "");
  const [paymentMethod, setPaymentMethod] = useState(defaults.paymentMethod || "Nağd");
  const [creditMonths, setCreditMonths] = useState(12);
  const [initialPayment, setInitialPayment] = useState(0);
  const [productRows, setProductRows] = useState([
    {
      id: crypto.randomUUID(),
      product: firstProduct.product,
      qty: 1,
      price: firstProduct.price,
      serials: getAvailableSerialsForProduct(warehouseStock, warehouseId, firstProduct.product).slice(0, 1),
    },
  ]);
  const [sellerRows, setSellerRows] = useState([
    { id: crypto.randomUUID(), seller: firstSeller.name, bonus: 3 },
  ]);
  const [note, setNote] = useState("");

  const selectedCustomer = customers.find((customer) => customer.fin === customerFin) || customers[0];
  const orderTotal = productRows.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
    0,
  );
  const creditPlan = buildCreditPlan({
    total: orderTotal,
    initialPayment,
    months: creditMonths,
  });
  const paidAmount = paymentMethod === "Kredit" ? creditPlan.initialPayment : orderTotal;
  const bonusRate = sellerRows.reduce((sum, item) => sum + Number(item.bonus || 0), 0);
  const bonusTotal = (paidAmount * bonusRate) / 100;
  const selectedSerials = productRows.flatMap((row) => row.serials || []);
  const canCreateOrder = Boolean(selectedCustomer && warehouseId && availableStock.length > 0 && orderTotal > 0);

  function getRowSerialOptions(row) {
    const allSerials = getAvailableSerialsForProduct(warehouseStock, warehouseId, row.product);
    const rowSerials = new Set(row.serials || []);
    const usedOutsideRow = new Set(selectedSerials.filter((serial) => !rowSerials.has(serial)));
    return allSerials.filter((serial) => !usedOutsideRow.has(serial) || rowSerials.has(serial));
  }

  function normalizeRowSerials(product, qty, currentSerials = []) {
    const amount = Math.max(1, Math.round(Number(qty || 1)));
    const options = getAvailableSerialsForProduct(warehouseStock, warehouseId, product);
    if (options.length === 0) return [];
    const next = [...currentSerials.filter((serial) => options.includes(serial))];

    for (const serial of options) {
      if (next.length >= amount) break;
      if (!selectedSerials.includes(serial) && !next.includes(serial)) next.push(serial);
    }

    return next.slice(0, amount);
  }

  function changeWarehouse(nextWarehouseId) {
    const nextStock = warehouseStock[nextWarehouseId]?.length
      ? warehouseStock[nextWarehouseId]
      : stock;
    const nextFirstProduct = nextStock[0] || { product: "", price: 0 };
    setWarehouseId(nextWarehouseId);
    setProductRows((rows) =>
      rows.map((row) => {
        const match = nextStock.find((item) => item.product === row.product) || nextFirstProduct;
        return {
          ...row,
          product: match.product,
          price: match.price,
          serials: getAvailableSerialsForProduct(warehouseStock, nextWarehouseId, match.product).slice(0, Math.max(1, Number(row.qty || 1))),
        };
      }),
    );
  }

  function changeProduct(rowId, field, value) {
    setProductRows((rows) =>
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "product") {
          const match = availableStock.find((item) => item.product === value);
          return {
            ...row,
            product: value,
            price: match?.price || row.price,
            serials: normalizeRowSerials(value, row.qty, []),
          };
        }
        if (field === "qty") {
          return {
            ...row,
            qty: value,
            serials: normalizeRowSerials(row.product, value, row.serials),
          };
        }
        return { ...row, [field]: value };
      }),
    );
  }

  function changeRowSerial(rowId, index, value) {
    setProductRows((rows) =>
      rows.map((row) => {
        if (row.id !== rowId) return row;
        const serials = [...(row.serials || [])];
        serials[index] = value;
        return { ...row, serials };
      }),
    );
  }

  function addProductRow() {
    setProductRows((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        product: firstProduct.product,
        qty: 1,
        price: firstProduct.price,
        serials: getAvailableSerialsForProduct(warehouseStock, warehouseId, firstProduct.product).slice(0, 1),
      },
    ]);
  }

  function removeProductRow(rowId) {
    setProductRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId)));
  }

  function changeSeller(rowId, field, value) {
    setSellerRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function addSellerRow() {
    if (sellerRows.length >= 3) return;
    const used = new Set(sellerRows.map((row) => row.seller));
    const nextSeller = sellers.find((seller) => !used.has(seller.name)) || firstSeller;
    setSellerRows((rows) => [
      ...rows,
      { id: crypto.randomUUID(), seller: nextSeller.name, bonus: 1 },
    ]);
  }

  function removeSellerRow(rowId) {
    setSellerRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== rowId)));
  }

  function submit(event) {
    event.preventDefault();
    if (!canCreateOrder) return;
    onCreate(type, {
      customer: selectedCustomer?.name || "",
      fin: selectedCustomer?.fin || "",
      paymentMethod,
      warehouseId,
      creditMonths,
      initialPayment,
      products: productRows.map((row) => ({
        ...row,
        serials: normalizeRowSerials(row.product, row.qty, row.serials),
      })),
      sellers: sellerRows,
      orderTotal,
      bonusTotal,
      note,
    });
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card order-modal-card">
        <div className="modal-head order-modal-head">
          <div>
            <h2>Yeni Satış Sifarişi</h2>
            <p>Müştəri, məhsul və satıcı bonus faizlərini daxil edin.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="order-modal-form">
          <section className="order-section">
            <label className="order-label" htmlFor="order-customer">
              MÜŞTƏRİ
            </label>
            <div className="order-two-col">
              <select
                id="order-customer"
                value={customerFin}
                onChange={(event) => setCustomerFin(event.target.value)}
              >
                {customers.map((customer) => (
                  <option key={customer.fin} value={customer.fin}>
                    {customer.name} — {customer.fin}
                  </option>
                ))}
              </select>
              <select
                aria-label="Ödəniş tipi"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option>Nağd</option>
                <option>Kredit</option>
              </select>
            </div>
            <label className="order-sub-field">
              <span>ANBAR</span>
              <select
                aria-label="Rezerv anbarı"
                value={warehouseId}
                onChange={(event) => changeWarehouse(event.target.value)}
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} — {warehouse.city}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="order-section">
            <div className="section-title-row">
              <span className="order-label">MƏHSULLAR</span>
              <button type="button" className="secondary-btn" onClick={addProductRow}>
                <Plus size={16} />
                Sətr əlavə et
              </button>
            </div>
            <div className="order-lines">
              {productRows.map((row) => (
                <div className="order-line-grid" key={row.id}>
                  <select
                    aria-label="Məhsul seç"
                    value={row.product}
                    onChange={(event) => changeProduct(row.id, "product", event.target.value)}
                  >
                    {availableStock.map((item) => (
                      <option key={item.product} value={item.product}>
                        {item.product} — {item.total - item.reserved} satış üçün
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Miqdar"
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={(event) => changeProduct(row.id, "qty", event.target.value)}
                  />
                  <input
                    aria-label="Qiymət"
                    type="number"
                    min="0"
                    value={row.price}
                    onChange={(event) => changeProduct(row.id, "price", event.target.value)}
                  />
                  <button
                    type="button"
                    className="line-delete"
                    onClick={() => removeProductRow(row.id)}
                    aria-label="Məhsul sətrini sil"
                  >
                    <Trash2 size={17} />
                  </button>
                  {getRowSerialOptions(row).length > 0 && (
                    <div className="serial-pick-list">
                      {Array.from({ length: Math.max(1, Number(row.qty || 1)) }).map((_, index) => (
                        <label key={`${row.id}-serial-${index}`}>
                          <span>IMEI #{index + 1}</span>
                          <select
                            value={row.serials?.[index] || ""}
                            onChange={(event) => changeRowSerial(row.id, index, event.target.value)}
                          >
                            <option value="">Serial seç</option>
                            {getRowSerialOptions(row).map((serial) => (
                              <option key={serial} value={serial}>
                                {serial}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Ümumi:</span>
              <strong>{money(orderTotal)}</strong>
            </div>
          </section>

          {paymentMethod === "Kredit" && (
            <section className="order-section credit-order-section">
              <div className="section-title-row">
                <span className="order-label">
                  <CreditCard size={16} />
                  KREDİT ŞƏRTLƏRİ
                </span>
              </div>
              <div className="credit-order-grid">
                <label className="order-sub-field">
                  <span>MÜDDƏT</span>
                  <select
                    aria-label="Kredit müddəti"
                    value={creditMonths}
                    onChange={(event) => setCreditMonths(Number(event.target.value))}
                  >
                    {creditTermOptions.map((month) => (
                      <option key={month} value={month}>
                        {month} ay
                      </option>
                    ))}
                  </select>
                </label>
                <label className="order-sub-field">
                  <span>İLKİN ÖDƏNİŞ</span>
                  <input
                    aria-label="İlkin ödəniş"
                    type="number"
                    min="0"
                    max={orderTotal}
                    value={initialPayment}
                    onChange={(event) => setInitialPayment(event.target.value)}
                  />
                </label>
              </div>
              <div className="credit-plan-summary">
                <div>
                  <span>Kredit məbləği</span>
                  <strong>{money(creditPlan.total)}</strong>
                </div>
                <div>
                  <span>Qalıq</span>
                  <strong>{money(creditPlan.balance)}</strong>
                </div>
                <div>
                  <span>{creditPlan.months > 1 ? `${creditPlan.months - 1} ay` : "Aylıq"}</span>
                  <strong>{money(creditPlan.monthly)}</strong>
                </div>
                <div>
                  <span>Son ay</span>
                  <strong>{money(creditPlan.lastPayment)}</strong>
                </div>
              </div>
              <p className="credit-plan-example">
                Bölgü: {creditPlan.months > 1 ? `${creditPlan.months - 1} ay ${money(creditPlan.monthly)}, ` : ""}
                sonuncu ay {money(creditPlan.lastPayment)}.
              </p>
            </section>
          )}

          <section className="order-section">
            <div className="section-title-row">
              <span className="order-label seller-title">
                <Users size={16} />
                SATICILAR (MAX. 3) — HƏR BİRİ ÖZ BONUS %
              </span>
              <button
                type="button"
                className="secondary-btn"
                disabled={sellerRows.length >= 3}
                onClick={addSellerRow}
              >
                <Plus size={16} />
                Satıcı əlavə et
              </button>
            </div>
            <div className="order-lines">
              {sellerRows.map((row) => (
                <div className="seller-line-grid" key={row.id}>
                  <select
                    aria-label="Satıcı seç"
                    value={row.seller}
                    onChange={(event) => changeSeller(row.id, "seller", event.target.value)}
                  >
                    {sellers.map((seller) => (
                      <option key={seller.name} value={seller.name}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                  <label className="bonus-input">
                    <input
                      aria-label="Bonus faizi"
                      type="number"
                      min="0"
                      max="100"
                      value={row.bonus}
                      onChange={(event) => changeSeller(row.id, "bonus", event.target.value)}
                    />
                    <span>% bonus</span>
                  </label>
                  <button
                    type="button"
                    className="line-delete"
                    onClick={() => removeSellerRow(row.id)}
                    aria-label="Satıcı sətrini sil"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            <p className="bonus-note">
              Nümunə: müştəri {money(paidAmount || 100)} ödəyərsə, bu sifariş üzrə cəmi{" "}
              <strong>{bonusRate}%</strong> = <strong>{money(bonusTotal || bonusRate)}</strong> bonus paylanacaq.
            </p>
          </section>

          <section className="order-section">
            <label className="order-label" htmlFor="order-note">
              QEYD
            </label>
            <textarea
              id="order-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Çatdırılma şərtləri, xüsusi istəklər..."
            />
          </section>

          <div className="modal-actions order-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Ləğv et
            </button>
            <button type="submit" className="primary-btn" disabled={!canCreateOrder}>
              Sifarişi yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateModal({
  type,
  mode,
  config,
  warehouse,
  product,
  employee,
  financeAccount,
  salesOrder,
  expense,
  contract,
  companySettings,
  orderOptions,
  salesDefaults,
  onClose,
  onCreate,
  onUpdateWarehouse,
  onReceiveStock,
  onImportWarehouseStock,
  onUpdateProduct,
  onSaveFinanceAccount,
  onUpdateSalesOrder,
  onDeleteSalesOrder,
  onUpdateExpense,
  onDeleteExpense,
  onSaveEmployee,
  onCreateDepartment,
  onDeleteEmployee,
  onCreateLeaveRequest,
  onCreateVacancy,
}) {
  if (type === "warehouse") {
    return (
      <WarehouseFormModal
        mode={mode}
        warehouse={warehouse}
        onClose={onClose}
        onSubmit={(values) => {
          if (mode === "edit" && warehouse) {
            onUpdateWarehouse(warehouse.id, values);
            return;
          }
          onCreate("warehouse", values);
        }}
      />
    );
  }

  if (type === "stockIntake") {
    return (
      <StockIntakeModal
        warehouses={orderOptions.warehouses}
        products={orderOptions.products}
        onClose={onClose}
        onSubmit={onReceiveStock}
      />
    );
  }

  if (type === "warehouseImport") {
    return <WarehouseImportModal warehouses={orderOptions.warehouses} onClose={onClose} onImport={onImportWarehouseStock} />;
  }

  if (type === "hr") {
    return (
      <HrEmployeeModal
        employee={employee}
        employees={orderOptions.employees}
        departments={orderOptions.departments}
        onClose={onClose}
        onSubmit={(values) => {
          if (employee) {
            onSaveEmployee(getEmployeeKey(employee), values);
            return;
          }
          onCreate("hr", values);
        }}
      />
    );
  }

  if (type === "department") {
    return <HrDepartmentModal employees={orderOptions.employees} departments={orderOptions.departments} onClose={onClose} onSubmit={onCreateDepartment} />;
  }

  if (type === "leaveRequest") {
    return <HrLeaveRequestModal employees={orderOptions.employees} onClose={onClose} onSubmit={onCreateLeaveRequest} />;
  }

  if (type === "vacancy") {
    return <HrVacancyModal employees={orderOptions.employees} departments={orderOptions.departments} onClose={onClose} onSubmit={onCreateVacancy} />;
  }

  if (type === "employeeDelete" && employee) {
    return <HrEmployeeDeleteModal employee={employee} employees={orderOptions.employees} onClose={onClose} onConfirm={(replacementManagerId) => onDeleteEmployee(getEmployeeKey(employee), replacementManagerId)} />;
  }

  if (type === "product") {
    return (
      <ProductFormModal
        product={product}
        onClose={onClose}
        onSubmit={(values) => {
          if (mode === "edit" && product) {
            onUpdateProduct(product.id, values);
            return;
          }
          onCreate("product", values);
        }}
      />
    );
  }

  if (type === "financeAccount") {
    return (
      <FinanceAccountModal
        account={financeAccount}
        onClose={onClose}
        onSubmit={(values) => onSaveFinanceAccount(financeAccount?.id, values)}
      />
    );
  }

  if (type === "contractPrint" && contract) {
    return <ContractPrintModal contract={contract} settings={companySettings} onClose={onClose} />;
  }

  if (type === "salesOperation" && salesOrder) {
    return (
      <SalesOperationModal
        order={salesOrder}
        orderOptions={orderOptions}
        onClose={onClose}
        onSubmit={(values) => onUpdateSalesOrder(salesOrder.id, values)}
      />
    );
  }

  if (type === "salesOperationDelete" && salesOrder) {
    return (
      <OperationDeleteModal
        title="Satış əməliyyatını sil"
        description={`${salesOrder.id} · ${salesOrder.customer} · ${money(salesOrder.amount)}`}
        warning="Təhvil verilməyibsə rezerv açılacaq. Kreditli satışdırsa bağlı kredit, müqavilə və kassa daxilolmaları da təmizlənəcək."
        onClose={onClose}
        onConfirm={() => onDeleteSalesOrder(salesOrder.id)}
      />
    );
  }

  if (type === "expenseOperation" && expense) {
    return (
      <ExpenseOperationModal
        expense={expense}
        onClose={onClose}
        onSubmit={(values) => onUpdateExpense(expense.id, values)}
      />
    );
  }

  if (type === "expenseOperationDelete" && expense) {
    return (
      <OperationDeleteModal
        title="Xərc əməliyyatını sil"
        description={`${expense.id} · ${expense.description} · ${money(expense.amount)}`}
        warning="Bu xərc ledger, P&L və cash balans hesablamalarından çıxarılacaq."
        onClose={onClose}
        onConfirm={() => onDeleteExpense(expense.id)}
      />
    );
  }

  if (type === "sales" || type === "dashboard") {
    return (
      <SalesOrderModal
        type={type}
        orderOptions={orderOptions}
        defaults={salesDefaults}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
  }

  return (
    <GenericCreateModal
      type={type}
      config={config}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}

function GenericCreateModal({ type, config, onClose, onCreate }) {
  const [values, setValues] = useState(
    Object.fromEntries(config.fields.map((field) => [field.name, field.value || ""])),
  );

  function submit(event) {
    event.preventDefault();
    onCreate(type, values);
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Pəncərəni bağla">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          {config.fields.map((field) => (
            <label key={field.name} className={field.full ? "full" : ""}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={values[field.name]}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name]}
                  required={field.required}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
            </label>
          ))}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Ləğv et
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={16} />
              Əlavə et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.variant}`}>
          <Check size={16} />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

const createConfig = {
  dashboard: {
    title: "Yeni sifariş",
    subtitle: "Sifariş satış, anbar və təhvil moduluna düşəcək.",
    fields: [
      { name: "customer", label: "Müştəri", required: true },
      { name: "fin", label: "FİN" },
      { name: "products", label: "Məhsul", required: true, full: true },
      { name: "amount", label: "Məbləğ", type: "number", required: true },
      { name: "paid", label: "Daxil olan", type: "number", value: "0" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: stages,
      },
    ],
  },
  crm: {
    title: "Yeni müştəri",
    subtitle: "FİN kodu və kredit limiti ilə müştəri açılışı.",
    fields: [
      { name: "name", label: "Ad Soyad", required: true },
      { name: "fin", label: "FİN", required: true },
      { name: "phone", label: "Telefon", required: true },
      {
        name: "category",
        label: "Kateqoriya",
        type: "select",
        options: ["Gümüş", "Qızıl", "Platin"],
      },
      { name: "limit", label: "Kredit limiti", type: "number" },
      { name: "debt", label: "Cari borc", type: "number", value: "0" },
    ],
  },
  sales: {
    title: "Yeni sifariş",
    subtitle: "Satıcı bölgüsü və ödəniş məlumatı ilə sifariş yaradın.",
    fields: [
      { name: "customer", label: "Müştəri", required: true },
      { name: "fin", label: "FİN" },
      { name: "products", label: "Məhsul", required: true, full: true },
      { name: "seller", label: "Satıcı bölgüsü" },
      { name: "amount", label: "Məbləğ", type: "number", required: true },
      { name: "paid", label: "Daxil olan", type: "number", value: "0" },
    ],
  },
  finance: {
    title: "Yeni xərc",
    subtitle: "Xərc avtomatik təsdiq gözləyir statusu ilə açılır.",
    fields: [
      { name: "description", label: "Təsvir", required: true },
      { name: "category", label: "Kateqoriya", required: true },
      { name: "date", label: "Tarix", type: "date", value: currentBusinessDate },
      { name: "amount", label: "Məbləğ", type: "number", required: true },
    ],
  },
  credits: {
    title: "Yeni kredit",
    subtitle: "Aylıq ödəniş cədvəli avtomatik hesablanır.",
    fields: [
      { name: "customer", label: "Müştəri", required: true },
      { name: "contractId", label: "Müqavilə №", value: `MQ-${currentBusinessDate.slice(0, 4)}-` },
      { name: "product", label: "Cihaz", required: true },
      { name: "total", label: "Ümumi məbləğ", type: "number", required: true },
      { name: "initialPayment", label: "İlkin ödəniş", type: "number", value: "0" },
      {
        name: "months",
        label: "Müddət",
        type: "select",
        value: "12",
        options: creditTermOptions.map((month) => `${month}`),
      },
      { name: "next", label: "Növbəti tarix", value: formatPaymentDate(addDays(parsePaymentDate(currentBusinessDate), 30)) },
    ],
  },
  vendors: {
    title: "Yeni vendor",
    subtitle: "Vendor kvota cədvəlinə əlavə olunacaq.",
    fields: [
      { name: "name", label: "Vendor adı", required: true },
      { name: "country", label: "Ölkə", required: true },
      { name: "sku", label: "SKU sayı", type: "number", required: true },
      { name: "quota", label: "Kvota", type: "number", required: true },
    ],
  },
  hr: {
    title: "Yeni əməkdaş",
    subtitle: "HR reyestrinə əməkdaş əlavə edin.",
    fields: [
      { name: "name", label: "Ad Soyad", required: true },
      { name: "position", label: "Vəzifə", required: true },
      { name: "department", label: "Şöbə", required: true },
      { name: "departmentParent", label: "Üst şöbə" },
      { name: "managerName", label: "Rəhbər adı" },
      {
        name: "level",
        label: "Səviyyə",
        type: "select",
        value: "Komanda üzvü",
        options: hrLevelOptions,
      },
      { name: "salary", label: "Maaş", type: "number", required: true },
      { name: "kpi", label: "KPI", type: "number", value: "85" },
      { name: "hireDate", label: "İşə qəbul tarixi", type: "date", value: currentBusinessDate },
      {
        name: "workMode",
        label: "İş rejimi",
        type: "select",
        value: "Ofis",
        options: ["Ofis", "Hybrid", "Sahə", "Uzaqdan"],
      },
      { name: "shift", label: "Növbə", value: "09:00-18:00" },
      {
        name: "employmentType",
        label: "Məşğulluq tipi",
        type: "select",
        value: "Tam ştat",
        options: ["Tam ştat", "Yarım ştat", "Müqaviləli", "Sınaq müddəti"],
      },
      { name: "leaveBalance", label: "Məzuniyyət balansı", type: "number", value: "0" },
      { name: "documentsComplete", label: "Sənədlər, %", type: "number", value: "100" },
      { name: "skills", label: "Bacarıqlar (vergüllə)", full: true },
    ],
  },
  contracts: {
    title: "Yeni müqavilə",
    subtitle: "Şablon əsasında müqavilə hazırlanacaq.",
    fields: [
      { name: "customer", label: "Müştəri", required: true },
      { name: "fin", label: "FİN" },
      { name: "product", label: "Məhsul", required: true },
      { name: "amount", label: "Məbləğ", type: "number", required: true },
    ],
  },
};

export default App;
