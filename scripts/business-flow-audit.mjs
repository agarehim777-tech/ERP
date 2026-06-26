import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5174/";
const storageKey = "erpaz.local.backend.v1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function collectErrors(page, errors) {
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
}

async function createFlowPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();
  const errors = [];
  collectErrors(page, errors);
  await page.addInitScript(() => localStorage.clear());
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  return { context, page, errors };
}

async function selectModule(page, index) {
  await page.locator(".nav-item").nth(index).click();
  await page.locator(".page-header h1").waitFor();
}

async function readState(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
}

function stockTotal(state, warehouseId, product) {
  return (state.warehouseStock?.[warehouseId] || [])
    .filter((item) => item.product === product)
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
}

function stockReserved(state, warehouseId, product) {
  return (state.warehouseStock?.[warehouseId] || [])
    .filter((item) => item.product === product)
    .reduce((sum, item) => sum + Number(item.reserved || 0), 0);
}

async function createWarehouseWithStock(page) {
  await selectModule(page, 3);
  await page.locator(".page-header .primary-btn").click();
  let modal = page.locator('[role="dialog"]');
  const suffix = Date.now().toString().slice(-6);
  await modal.locator("input").nth(0).fill(`WH-QA-${suffix}`);
  await modal.locator("input").nth(1).fill("QA Warehouse");
  await modal.locator("input").nth(2).fill("Baku");
  await modal.locator("input").nth(3).fill("QA Admin");
  await modal.locator("input").nth(4).fill("100");
  await modal.locator("input").nth(5).fill("QA Address");
  await modal.locator('button[type="submit"]').click();

  await page.locator(".warehouse-action-menu .primary-btn").click();
  await page.locator(".warehouse-action-menu-popover button").first().click();
  modal = page.locator('[role="dialog"]');
  await modal.locator("input").nth(0).fill("QA Device");
  await modal.locator("input").nth(1).fill("5");
  await modal.locator("input").nth(2).fill("1200");
  await modal.locator('button[type="submit"]').click();

  const state = await readState(page);
  const warehouse = state.warehouses.find((item) => item.name === "QA Warehouse");
  assert(warehouse, "Warehouse seed was not created");
  assert(stockTotal(state, warehouse.id, "QA Device") === 5, "Warehouse intake did not create the seed stock");
  assert(state.products?.some((item) => item.name === "QA Device"), "Warehouse intake did not create the product catalog record");
  return warehouse;
}

async function createCustomer(page) {
  await selectModule(page, 1);
  await page.locator(".page-header .primary-btn").click();
  const modal = page.locator('[role="dialog"]');
  const fin = `QA${Date.now().toString().slice(-7)}`;
  await modal.locator("input").nth(0).fill("QA Customer");
  await modal.locator("input").nth(1).fill(fin);
  await modal.locator("input").nth(2).fill("0500000000");
  await modal.locator('button[type="submit"]').click();
  return fin;
}

async function createCreditSale(page) {
  const warehouse = await createWarehouseWithStock(page);
  const fin = await createCustomer(page);
  await selectModule(page, 2);
  const before = await readState(page);
  await page.locator(".page-header .primary-btn").click();
  const modal = page.locator('[role="dialog"]');
  await modal.locator("select").nth(1).selectOption({ index: 1 });
  await modal.locator(".order-modal-form button[type=submit]").click();
  await page.waitForTimeout(100);
  const after = await readState(page);
  const order = after.orders?.[0];
  const credit = after.credits?.find((item) => item.id === order?.creditId);
  const contract = after.contracts?.find((item) => item.id === order?.contractId);
  const line = order?.productLines?.[0];

  assert(order?.paymentMethod === "Kredit", "Credit sale did not create a credit order");
  assert(order.fin === fin, "Credit sale did not use the new customer");
  assert(credit?.orderId === order.id, "Credit record is not linked to the sales order");
  assert(contract?.orderId === order.id, "Contract is not linked to the sales order");
  assert(line?.product, "Credit order has no reserved product line");
  assert(
    stockReserved(after, warehouse.id, line.product) === stockReserved(before, warehouse.id, line.product) + Number(line.qty),
    "Warehouse reservation did not increase for the credit sale",
  );

  return { before, after, order, credit, contract, line, warehouse };
}

async function auditCreditSale(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    const sale = await createCreditSale(page);
    assert(errors.length === 0, `Credit sale produced browser errors: ${errors.join(" | ")}`);
    return { id: sale.order.id, creditId: sale.credit.id, contractId: sale.contract.id, product: sale.line.product };
  } finally {
    await context.close();
  }
}

async function auditSalesAndExpenseMutations(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    const sale = await createCreditSale(page);
    const originalReserved = stockReserved(sale.before, sale.warehouse.id, sale.line.product);

    await page.locator(".sales-order-card .operation-row-actions button").first().click();
    let modal = page.locator('[role="dialog"]');
    await modal.locator(".edit-order-total input").fill("1300");
    await modal.locator(".credit-order-section input").fill("100");
    await modal.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    let state = await readState(page);
    let editedOrder = state.orders.find((item) => item.id === sale.order.id);
    let editedCredit = state.credits.find((item) => item.id === editedOrder?.creditId);
    assert(editedOrder?.amount === 1300, "Sales edit did not update order amount");
    assert(editedOrder?.initialPayment === 100, "Sales edit did not update initial payment");
    assert(editedCredit?.total === 1300, "Sales edit did not sync credit total");
    assert(editedCredit?.initialPayment === 100, "Sales edit did not sync credit initial payment");

    await page.locator(".sales-order-card .operation-row-actions .danger-outline").click();
    modal = page.locator('[role="dialog"]');
    await modal.locator(".danger-outline").click();
    await page.waitForTimeout(100);

    state = await readState(page);
    assert(!state.orders.some((item) => item.id === sale.order.id), "Sales delete did not remove order");
    assert(!state.credits.some((item) => item.id === sale.credit.id), "Sales delete did not remove linked credit");
    assert(stockReserved(state, sale.warehouse.id, sale.line.product) === originalReserved, "Sales delete did not release reservation");

    await selectModule(page, 5);
    await page.locator(".page-header .primary-btn").click();
    modal = page.locator('[role="dialog"]');
    await modal.locator("input").nth(0).fill("QA Expense");
    await modal.locator("input").nth(1).fill("QA Ops");
    await modal.locator("input").nth(3).fill("300");
    await modal.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    state = await readState(page);
    const expense = state.expenses.find((item) => item.description === "QA Expense");
    assert(expense, "Expense create did not add finance expense");

    const expenseRow = page.locator("tr", { hasText: "QA Expense" }).first();
    await expenseRow.getByText("Redaktə").click();
    modal = page.locator('[role="dialog"]');
    await modal.locator('input[type="number"]').fill("450");
    await modal.locator('button[type="submit"]').click();
    await page.waitForTimeout(100);

    state = await readState(page);
    assert(state.expenses.find((item) => item.id === expense.id)?.amount === 450, "Expense edit did not update amount");

    await page.locator("tr", { hasText: "QA Expense" }).first().getByText("Sil").click();
    modal = page.locator('[role="dialog"]');
    await modal.locator(".danger-outline").click();
    await page.waitForTimeout(100);

    state = await readState(page);
    assert(!state.expenses.some((item) => item.id === expense.id), "Expense delete did not remove expense");
    assert(errors.length === 0, `Mutation flow produced browser errors: ${errors.join(" | ")}`);

    return { editedOrder: sale.order.id, editedCredit: sale.credit.id, expense: expense.id };
  } finally {
    await context.close();
  }
}

async function auditCreditPayment(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    await createCreditSale(page);
    await selectModule(page, 9);
    const before = await readState(page);
    await page.locator(".credit-table-actions .icon-btn").first().click();
    await page.locator(".credit-detail-modal-card .credit-payment-form").waitFor({ state: "visible" });
    await page.locator(".credit-detail-modal-card .credit-payment-form button[type=submit]").click();
    await page.waitForTimeout(100);
    const after = await readState(page);
    const cashEntry = after.cashEntries?.[0];
    const linkedOrder = after.orders?.find((order) => order.id === cashEntry?.orderId);
    const previousOrder = before.orders?.find((order) => order.id === cashEntry?.orderId);

    assert(after.cashEntries.length === before.cashEntries.length + 1, "Credit payment did not create a cash entry");
    assert(cashEntry?.creditId && Number(cashEntry.amount) > 0, "Cash entry is missing credit payment data");
    assert(linkedOrder && previousOrder && Number(linkedOrder.paid) > Number(previousOrder.paid), "Credit payment did not update the linked order");
    assert(errors.length === 0, `Credit payment produced browser errors: ${errors.join(" | ")}`);
    return { creditId: cashEntry.creditId, cashAmount: cashEntry.amount, orderId: cashEntry.orderId };
  } finally {
    await context.close();
  }
}

async function auditWarehouseDelivery(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    const sale = await createCreditSale(page);
    const before = await readState(page);
    await selectModule(page, 3);
    await page.locator(".warehouse-operations-drawer > summary").click();
    const orderRow = page.locator("tr").filter({ hasText: sale.order.id });
    await orderRow.locator("button.text-btn").click();
    await page.waitForTimeout(100);
    const after = await readState(page);
    const deliveredOrder = after.orders?.find((item) => item.id === sale.order.id);

    assert(deliveredOrder?.status === "Təhvil verilib", "Warehouse delivery did not complete the order");
    assert(
      stockTotal(after, sale.warehouse.id, sale.line.product) === stockTotal(before, sale.warehouse.id, sale.line.product) - Number(sale.line.qty),
      "Warehouse delivery did not reduce physical stock",
    );
    assert(
      stockReserved(after, sale.warehouse.id, sale.line.product) === stockReserved(before, sale.warehouse.id, sale.line.product) - Number(sale.line.qty),
      "Warehouse delivery did not release the reservation",
    );
    assert(errors.length === 0, `Warehouse delivery produced browser errors: ${errors.join(" | ")}`);
    return { orderId: sale.order.id, product: sale.line.product, qty: sale.line.qty, warehouseId: sale.warehouse.id };
  } finally {
    await context.close();
  }
}

async function auditPurchaseOrder(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    const warehouse = await createWarehouseWithStock(page);
    await selectModule(page, 11);
    await page.locator(".page-header .primary-btn").click();
    const vendorModal = page.locator('[role="dialog"]');
    await vendorModal.locator("input").nth(0).fill("QA Vendor");
    await vendorModal.locator("input").nth(1).fill("Azerbaijan");
    await vendorModal.locator("input").nth(2).fill("1");
    await vendorModal.locator("input").nth(3).fill("100");
    await vendorModal.locator('button[type="submit"]').click();

    const before = await readState(page);
    await page.locator(".procurement-panel button.text-btn").first().click();
    await page.waitForTimeout(75);
    const created = await readState(page);
    const po = created.purchaseOrders?.[0];
    assert(po?.status === "Təsdiq gözləyir", "Purchase order was not created as pending");

    await page.locator(".po-action-panel button.text-btn").first().click();
    await page.waitForTimeout(100);
    const after = await readState(page);
    const approvedPo = after.purchaseOrders?.find((item) => item.id === po.id);

    assert(approvedPo?.status === "Təsdiq edildi", "Purchase order was not approved");
    assert(
      stockTotal(after, po.warehouseId, po.product) === stockTotal(before, po.warehouseId, po.product) + Number(po.qty),
      "Approved purchase order did not increase warehouse stock",
    );
    assert(after.expenses.length === before.expenses.length + 1, "Approved purchase order did not create a finance expense");
    assert(errors.length === 0, `Purchase order produced browser errors: ${errors.join(" | ")}`);
    return { poId: po.id, product: po.product, qty: po.qty, warehouseId: warehouse.id };
  } finally {
    await context.close();
  }
}

async function auditWarehouseImport(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    await selectModule(page, 3);
    await page.locator(".page-header .primary-btn").click();
    const warehouseModal = page.locator('[role="dialog"]');
    const suffix = Date.now().toString().slice(-6);
    const warehouseName = `QA Import ${suffix}`;
    await warehouseModal.locator("input").nth(0).fill(`IMP-${suffix}`);
    await warehouseModal.locator("input").nth(1).fill(warehouseName);
    await warehouseModal.locator("input").nth(2).fill("Baku");
    await warehouseModal.locator("input").nth(3).fill("QA Admin");
    await warehouseModal.locator("input").nth(4).fill("100");
    await warehouseModal.locator("input").nth(5).fill("QA Address");
    await warehouseModal.locator('button[type="submit"]').click();

    await page.locator(".warehouse-action-menu .primary-btn").click();
    await page.locator(".warehouse-action-menu-popover button").nth(1).click();
    const importModal = page.locator('[role="dialog"]');
    const sku = `IMP-${suffix}-001`;
    const csv = [
      "Product;SKU;Warehouse;Quantity;Sale Price;Cost Price;Category;Minimum;Unit;Serial",
      `Imported Device;${sku};${warehouseName};7;900;600;Electronics;2;piece;Bəli`,
    ].join("\n");
    await importModal.locator('input[type="file"]').setInputFiles({
      name: "warehouse-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv, "utf8"),
    });
    await importModal.locator(".warehouse-import-summary").waitFor();
    await importModal.locator(".modal-actions .primary-btn").click();

    const state = await readState(page);
    const warehouse = state.warehouses.find((item) => item.name === warehouseName);
    const product = state.products.find((item) => item.sku === sku);
    const item = state.warehouseStock?.[warehouse?.id || ""]?.find((row) => row.product === "Imported Device");
    assert(warehouse, "Warehouse import test could not create the target warehouse");
    assert(product?.costPrice === 600 && product?.serialTracked === true, "Import did not persist product metadata");
    assert(Number(item?.total || 0) === 7, "Import did not increase warehouse stock");
    assert(errors.length === 0, `Warehouse import produced browser errors: ${errors.join(" | ")}`);
    return { warehouseId: warehouse.id, sku: product.sku, quantity: item.total };
  } finally {
    await context.close();
  }
}

async function createHrEmployee(page, values) {
  await page.locator(".page-header .primary-btn").click();
  const modal = page.locator('[role="dialog"]');
  const inputs = modal.locator("input");
  await inputs.nth(0).fill(values.name);
  await inputs.nth(1).fill(values.position);
  await inputs.nth(2).fill(values.department);
  await inputs.nth(3).fill(values.departmentParent || "");
  await modal.locator("select").nth(0).selectOption({ index: values.managerIndex || 0 });
  await modal.locator("select").nth(1).selectOption({ index: values.levelIndex || 0 });
  await inputs.nth(4).fill(String(values.salary));
  await modal.locator('button[type="submit"]').click();
  await page.locator('[role="dialog"]').waitFor({ state: "hidden" });
}

async function auditHrStructure(browser) {
  const { context, page, errors } = await createFlowPage(browser);
  try {
    await selectModule(page, 14);
    await createHrEmployee(page, {
      name: "QA Director",
      position: "Direktor",
      department: "İcraçı rəhbərlik",
      salary: 3000,
    });
    await createHrEmployee(page, {
      name: "QA Sales Manager",
      position: "Satış rəhbəri",
      department: "Satış",
      departmentParent: "İcraçı rəhbərlik",
      managerIndex: 1,
      levelIndex: 1,
      salary: 2200,
    });
    await createHrEmployee(page, {
      name: "QA B2B Specialist",
      position: "B2B mütəxəssisi",
      department: "B2B satış",
      departmentParent: "Satış",
      managerIndex: 1,
      levelIndex: 3,
      salary: 1300,
    });

    const state = await readState(page);
    const employees = state.employees || [];
    assert(employees.length === 3, "HR employee creation did not persist all employees");
    assert(
      employees.every((employee) => employee.hrStatus === "Stabil" && Number(employee.documentsComplete) === 100),
      "New employee was incorrectly marked as awaiting information",
    );
    assert(
      employees.find((employee) => employee.name === "QA B2B Specialist")?.managerId ===
        employees.find((employee) => employee.name === "QA Sales Manager")?.id,
      "Employee manager relationship was not stored by ID",
    );

    const salesNode = page.locator(".hr-org-card").filter({ hasText: "QA Sales Manager" });
    await salesNode.waitFor();
    const b2bNode = page.locator(".hr-org-card").filter({ hasText: "QA B2B Specialist" });
    await b2bNode.waitFor();
    await salesNode.click();
    await b2bNode.waitFor({ state: "hidden" });
    await salesNode.click();
    await b2bNode.waitFor();

    const reportingPanel = page.locator(".hr-reporting-panel");
    await reportingPanel.locator(".hr-employee-node").filter({ hasText: "QA B2B Specialist" }).click();
    await page.locator(".hr-profile-head").filter({ hasText: "QA B2B Specialist" }).waitFor();
    await page.locator(".hr-profile-edit").click();
    const editModal = page.locator('[role="dialog"]');
    await editModal.locator("input").nth(1).fill("Senior B2B Specialist");
    await editModal.locator("input").nth(4).fill("1750");
    await editModal.locator('button[type="submit"]').click();
    await editModal.waitFor({ state: "hidden" });
    const updatedState = await readState(page);
    const updatedEmployee = updatedState.employees.find((employee) => employee.name === "QA B2B Specialist");
    assert(updatedEmployee?.position === "Senior B2B Specialist", "Employee edit did not persist the new position");
    assert(Number(updatedEmployee?.salary) === 1750, "Employee edit did not persist the new salary");
    assert(
      updatedState.auditLog?.some((row) => row.action === "Əməkdaş redaktə edildi"),
      "Employee edit did not create an audit log entry",
    );
    await page.locator(".hr-person-row").filter({ hasText: "QA Sales Manager" }).click();
    await page.locator(".hr-profile-head").filter({ hasText: "QA Sales Manager" }).waitFor();
    await page.locator(".hr-profile-edit").click();
    const managerEditModal = page.locator('[role="dialog"]');
    await managerEditModal.locator("input").nth(0).fill("QA Sales Lead");
    await managerEditModal.locator('button[type="submit"]').click();
    await managerEditModal.waitFor({ state: "hidden" });
    const renamedState = await readState(page);
    const renamedManager = renamedState.employees.find((employee) => employee.name === "QA Sales Lead");
    assert(
      renamedState.employees.find((employee) => employee.name === "QA B2B Specialist")?.managerName === "QA Sales Lead",
      "Employee rename did not update direct reports' manager names",
    );
    await page.locator(".hr-structure-actions .secondary-btn").click();
    const departmentModal = page.locator('[role="dialog"]');
    await departmentModal.locator("input").nth(0).fill("QA New Department");
    await departmentModal.locator("textarea").fill("QA department for hierarchy validation");
    await departmentModal.locator('button[type="submit"]').click();
    await departmentModal.waitFor({ state: "hidden" });
    const departmentState = await readState(page);
    assert(
      departmentState.departments?.some((department) => department.name === "QA New Department"),
      "Department creation did not persist the new department",
    );
    await page.locator(".hr-org-card").filter({ hasText: "QA New Department" }).waitFor();

    await page.locator(".hr-person-row").filter({ hasText: "QA Sales Lead" }).click();
    await page.locator(".hr-profile-head").filter({ hasText: "QA Sales Lead" }).waitFor();
    await page.locator(".hr-profile-delete").click();
    const deleteModal = page.locator('[role="dialog"]');
    await deleteModal.locator(".hr-delete-reassignment select").selectOption({ index: 1 });
    await deleteModal.locator(".danger-outline").click();
    await deleteModal.waitFor({ state: "hidden" });
    const deletedState = await readState(page);
    assert(!deletedState.employees.some((employee) => employee.name === "QA Sales Lead"), "Employee delete did not remove the employee");
    assert(
      deletedState.employees.find((employee) => employee.name === "QA B2B Specialist")?.managerName === "QA Director",
      "Employee delete did not reassign direct reports",
    );
    assert(
      deletedState.auditLog?.some((row) => row.action === "Əməkdaş silindi"),
      "Employee delete did not create an audit log entry",
    );
    assert(
      deletedState.departments?.some((department) => department.name === renamedManager?.department),
      "Deleting the last employee removed the department from the structure",
    );

    const hrTabs = page.locator(".hr-platform-toolbar .tabs button");
    await hrTabs.nth(2).click();
    await page.locator(".hr-operation-toolbar .secondary-btn").click();
    const leaveModal = page.locator('[role="dialog"]');
    await leaveModal.locator("select").first().selectOption({ index: 1 });
    await leaveModal.locator('button[type="submit"]').click();
    await leaveModal.waitFor({ state: "hidden" });
    const leaveState = await readState(page);
    assert(leaveState.leaveRequests?.length === 1, "Leave request did not persist");

    await hrTabs.nth(4).click();
    await page.locator(".hr-operation-toolbar .secondary-btn").click();
    const vacancyModal = page.locator('[role="dialog"]');
    await vacancyModal.locator("input").nth(0).fill("QA Recruitment Role");
    await vacancyModal.locator("input").nth(1).fill("QA New Department");
    await vacancyModal.locator('button[type="submit"]').click();
    await vacancyModal.waitFor({ state: "hidden" });
    const vacancyState = await readState(page);
    assert(vacancyState.vacancies?.some((vacancy) => vacancy.role === "QA Recruitment Role"), "Vacancy creation did not persist");
    await page.locator(".hr-recruitment-card").filter({ hasText: "QA Recruitment Role" }).waitFor();

    await selectModule(page, 24);
    await page.getByRole("button", { name: "Integrity yoxla" }).click();
    await page.waitForTimeout(75);
    const integrityState = await readState(page);
    assert(integrityState.integritySnapshot, "Integrity check did not create a snapshot");
    assert(
      !integrityState.integritySnapshot.issues?.some((issue) => issue.area === "HR"),
      "Healthy HR structure produced an integrity warning",
    );
    const payrollExpense = integrityState.expenses?.find((expense) => expense.source === "HR Payroll");
    assert(payrollExpense?.cashImpact === false, "HR payroll expense should not affect real cash balance");
    assert(errors.length === 0, `HR structure produced browser errors: ${errors.join(" | ")}`);
    return { employees: employees.length, selectedEmployee: "QA B2B Specialist", updatedSalary: updatedEmployee.salary, department: "QA New Department" };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });
const report = { flows: [], failures: [] };

for (const [name, run] of [
  ["sales-credit-warehouse-reservation", auditCreditSale],
  ["sales-expense-edit-delete", auditSalesAndExpenseMutations],
  ["credit-payment-finance-cash", auditCreditPayment],
  ["warehouse-delivery-stock-release", auditWarehouseDelivery],
  ["purchase-order-warehouse-finance", auditPurchaseOrder],
  ["warehouse-csv-import-catalog-stock", auditWarehouseImport],
  ["hr-department-reporting-structure", auditHrStructure],
]) {
  try {
    report.flows.push({ name, result: await run(browser) });
  } catch (error) {
    report.failures.push({ name, error: error.message });
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

if (report.flows.length !== 7 || report.failures.length > 0) {
  process.exitCode = 1;
}
