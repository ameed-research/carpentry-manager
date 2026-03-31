const fs = require('fs');

function replaceFile(path, oldText, newText) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content);
    console.log('Fixed', path);
  } else {
    console.log('Failed to find exact match in', path);
  }
}

// 1. Customers.tsx
replaceFile('./src/pages/Customers.tsx',
  `import { customerService, Customer } from '../services/customerService';`,
  `import { customerService } from '../services/customerService';\nimport type { Customer } from '../services/customerService';`
);

// 2. Documents.tsx
replaceFile('./src/pages/Documents.tsx',
  `  Chip,\n`,
  ``
);
replaceFile('./src/pages/Documents.tsx',
  `import { documentService, CarpentryDocument } from '../services/documentService';`,
  `import { documentService } from '../services/documentService';\nimport type { CarpentryDocument } from '../services/documentService';`
);

// 3. Expenses.tsx
replaceFile('./src/pages/Expenses.tsx',
  `import { expenseService, Expense } from '../services/expenseService';`,
  `import { expenseService } from '../services/expenseService';\nimport type { Expense } from '../services/expenseService';`
);

// 4. Inventory.tsx
replaceFile('./src/pages/Inventory.tsx',
  `import { inventoryService, Item } from '../services/inventoryService';
import { categoryService, Category } from '../services/categoryService';
import { supplierService, Supplier } from '../services/supplierService';
import { useNotification } from '../hooks/useNotification';
import { InventoryHistory } from '../types';`,
  `import { inventoryService } from '../services/inventoryService';
import type { Item } from '../services/inventoryService';
import { categoryService } from '../services/categoryService';
import type { Category } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import type { Supplier } from '../services/supplierService';
import { useNotification } from '../hooks/useNotification';
import type { InventoryHistory } from '../types';`
);

// 5. Suppliers.tsx
replaceFile('./src/pages/Suppliers.tsx',
  `import { supplierService, Supplier } from '../services/supplierService';`,
  `import { supplierService } from '../services/supplierService';\nimport type { Supplier } from '../services/supplierService';`
);

// 6. Reports.tsx
replaceFile('./src/pages/Reports.tsx',
  `  Divider,\n`,
  ``
);

// 7. inventoryService.ts
replaceFile('./src/services/inventoryService.ts',
  `import { InventoryHistory } from '../types';`,
  `import type { InventoryHistory } from '../types';`
);

// 8. authSlice.ts
replaceFile('./src/store/authSlice.ts',
  `import { createSlice, PayloadAction } from '@reduxjs/toolkit';`,
  `import { createSlice } from '@reduxjs/toolkit';\nimport type { PayloadAction } from '@reduxjs/toolkit';`
);

// 9. notificationSlice.ts
replaceFile('./src/store/notificationSlice.ts',
  `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\nimport { Notification } from '../types';`,
  `import { createSlice } from '@reduxjs/toolkit';\nimport type { PayloadAction } from '@reduxjs/toolkit';\nimport type { Notification } from '../types';`
);

// Fix the ID issue in notificationSlice.ts
let notifContent = fs.readFileSync('./src/store/notificationSlice.ts', 'utf8');
notifContent = notifContent.replace(`n.id === action.id`, `n.id === action.payload`);
fs.writeFileSync('./src/store/notificationSlice.ts', notifContent);
console.log('Fixed n.id in notificationSlice.ts');


// 10. types/index.ts
replaceFile('./src/types/index.ts',
  `import { Item } from '../services/inventoryService';`,
  `import type { Item } from '../services/inventoryService';`
);
