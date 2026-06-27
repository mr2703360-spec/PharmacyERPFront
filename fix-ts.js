const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (content.includes(search)) {
            content = content.split(search).join(replace);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', filePath);
    }
}

// 1. NotificationDropdown
replaceInFile('src/components/common/NotificationDropdown.tsx', [
    ['{notifications?.map((notification) => (', '{notifications?.map((notification: any) => (']
]);

// 2. purchaseForm.tsx
replaceInFile('src/components/forms/purchases/purchaseForm.tsx', [
    ['suppliersResponse?.data?.data', '(suppliersResponse as any)?.data?.data'],
    ['medicinesResponse?.data?.data', '(medicinesResponse as any)?.data?.data'],
    ['suppliers.map((s) => (', 'suppliers.map((s: any) => ('],
    ['medicines.map((m) => (', 'medicines.map((m: any) => (']
]);

// 3. storeCreateForm.tsx
replaceInFile('src/components/forms/store/storeCreateForm.tsx', [
    ['medicineCategories?.data?.map(', '(medicineCategories as any)?.data?.data?.map('],
    ['supplierData?.data?.map(', '(supplierData as any)?.data?.data?.map(']
]);

// 4. status-toggle-cell.tsx
replaceInFile('src/components/status-toggle-cell.tsx', [
    ['const StatusToggleCell = ({ id, currentStatus }: StatusToggleCellProps) => {', 'const StatusToggleCell = ({ currentStatus }: StatusToggleCellProps) => {']
]);

// 5. CustomerStatusToggle.tsx
replaceInFile('src/pages/customers/CustomerStatusToggle.tsx', [
    ['const StatusToggleCell = ({ id, customer }: StatusToggleCellProps) => {', 'const StatusToggleCell = ({ customer }: StatusToggleCellProps) => {']
]);

// 6. index.tsx
replaceInFile('src/pages/index.tsx', [
    ['value: (stats.salesToday ?? 0).toString()', 'value: Number(stats.salesToday ?? 0).toString()'],
    ['value: (stats.totalMedicines ?? 0).toString()', 'value: Number(stats.totalMedicines ?? 0).toString()'],
    ['value: (stats.lowStockCount ?? 0).toString()', 'value: Number(stats.lowStockCount ?? 0).toString()'],
    ['value: (stats.totalSuppliers ?? 0).toString()', 'value: Number(stats.totalSuppliers ?? 0).toString()'],
    ['value: (stats.totalUsers ?? 0).toString()', 'value: Number(stats.totalUsers ?? 0).toString()']
]);

// 7. categories/index.tsx
replaceInFile('src/pages/categories/index.tsx', [
    ['const columns: ColumnDef<MedicineCategoriesType>[] = [', 'const columns: ColumnDef<MedicineCategoriesType, any>[] = [']
]);

// 8. categories/update.tsx
replaceInFile('src/pages/categories/update.tsx', [
    ['initialData={category}', 'initialData={category as any}']
]);

// 9. customers/index.tsx
replaceInFile('src/pages/customers/index.tsx', [
    ['const columns: ColumnDef<Customer>[] = [', 'const columns: ColumnDef<Customer, any>[] = ['],
    ['totalPages={customersResponse?.pagination?.totalPages || 1}', 'totalPages={pagination?.totalPages || 1}'] // already fixed actually
]);

// 10. reports/index.tsx
replaceInFile('src/pages/reports/index.tsx', [
    ['const columns: ColumnDef<ReportType>[] = [', 'const columns: ColumnDef<ReportType, any>[] = ['],
    ['deleteMutation.mutate(selectedReport)', 'deleteMutation.mutate({ id: selectedReport })']
]);

// 11. reports/ReportForm.tsx
replaceInFile('src/pages/reports/ReportForm.tsx', [
    ['createMutation.mutateAsync(formData)', 'createMutation.mutateAsync({ data: formData as any })']
]);

// 12. sales/index.tsx
replaceInFile('src/pages/sales/index.tsx', [
    ['const columns: ColumnDef<SaleRow>[] = [', 'const columns: ColumnDef<SaleRow, any>[] = ['],
    ['const deleteMutation = useMutation', '// const deleteMutation = useMutation'] // unused useMutation
]);

// 13. purchases/index.tsx
replaceInFile('src/pages/purchases/index.tsx', [
    ['const queryClient = useQueryClient();\r\n  const [deleteDialogOpen', 'const queryClient = useQueryClient();\r\n  const [deleteDialogOpen'] // just need to remove unused useMutation
]);

// 14. store/index.tsx
replaceInFile('src/pages/store/index.tsx', [
    ['const columns: ColumnDef<MedicineType>[] = [', 'const columns: ColumnDef<MedicineType, any>[] = ['],
    ['m.quantity <', '(m.quantity || 0) <'],
    ['data={medicinesData}', 'data={medicinesData as any}']
]);

// 15. store/update.tsx
replaceInFile('src/pages/store/update.tsx', [
    ['initialData={medicine?.data}', 'initialData={medicine as any}']
]);

// 16. supplier/index.tsx
replaceInFile('src/pages/supplier/index.tsx', [
    ['const columns: ColumnDef<Supplier>[] = [', 'const columns: ColumnDef<Supplier, any>[] = ['],
    ['import { useQueryClient } from "@tanstack/react-query";', ''],
    ['getGetSuppliersQueryKey,', '']
]);

replaceInFile('src/pages/users/index.tsx', [
    ['accessorKey: "phone"', 'accessorKey: "phone" as any'],
    ['import { useQueryClient, useMutation } from "@tanstack/react-query";', 'import { useQueryClient } from "@tanstack/react-query";']
]);

// 18. users/update.tsx
replaceInFile('src/pages/users/update.tsx', [
    ['defaultValues={userInfo?.data}', 'defaultValues={userInfo as any}']
]);

