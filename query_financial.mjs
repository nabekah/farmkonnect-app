import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmkonnect_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('='.repeat(80));
console.log('FARMKONNECT FINANCIAL DASHBOARD DATA');
console.log('='.repeat(80));

// Query 1: Overall Summary
console.log('\n1. FINANCIAL SUMMARY\n');
const [summary] = await connection.query(`
  SELECT 
    'EXPENSES' as Category,
    COUNT(*) as Records,
    ROUND(SUM(amount), 2) as Total,
    ROUND(AVG(amount), 2) as Average
  FROM expenses
  UNION ALL
  SELECT 
    'REVENUE' as Category,
    COUNT(*) as Records,
    ROUND(SUM(amount), 2) as Total,
    ROUND(AVG(amount), 2) as Average
  FROM revenue
`);
console.table(summary);

// Query 2: Expense Breakdown
console.log('\n2. EXPENSE BREAKDOWN BY CATEGORY\n');
const [expenses] = await connection.query(`
  SELECT 
    expenseType as Category,
    COUNT(*) as Count,
    ROUND(SUM(amount), 2) as Total,
    ROUND(AVG(amount), 2) as Average,
    ROUND(MIN(amount), 2) as Min,
    ROUND(MAX(amount), 2) as Max
  FROM expenses
  GROUP BY expenseType
  ORDER BY SUM(amount) DESC
`);
console.table(expenses);

// Query 3: Revenue Breakdown
console.log('\n3. REVENUE BREAKDOWN BY TYPE\n');
const [revenue] = await connection.query(`
  SELECT 
    revenueType as Type,
    COUNT(*) as Count,
    ROUND(SUM(amount), 2) as Total,
    ROUND(AVG(amount), 2) as Average,
    ROUND(MIN(amount), 2) as Min,
    ROUND(MAX(amount), 2) as Max
  FROM revenue
  GROUP BY revenueType
  ORDER BY SUM(amount) DESC
`);
console.table(revenue);

// Query 4: Recent Expenses
console.log('\n4. RECENT EXPENSES (Last 10)\n');
const [recentExpenses] = await connection.query(`
  SELECT 
    id,
    description,
    ROUND(amount, 2) as Amount,
    expenseType as Category,
    DATE(expenseDate) as Date,
    paymentStatus as Status
  FROM expenses
  ORDER BY expenseDate DESC
  LIMIT 10
`);
console.table(recentExpenses);

// Query 5: Recent Revenue
console.log('\n5. RECENT REVENUE (Last 10)\n');
const [recentRevenue] = await connection.query(`
  SELECT 
    id,
    description,
    ROUND(amount, 2) as Amount,
    revenueType as Type,
    DATE(revenueDate) as Date,
    paymentStatus as Status
  FROM revenue
  ORDER BY revenueDate DESC
  LIMIT 10
`);
console.table(recentRevenue);

// Query 6: Net Profit
console.log('\n6. NET PROFIT CALCULATION\n');
const [profit] = await connection.query(`
  SELECT 
    ROUND((SELECT COALESCE(SUM(amount), 0) FROM revenue), 2) as TotalRevenue,
    ROUND((SELECT COALESCE(SUM(amount), 0) FROM expenses), 2) as TotalExpenses,
    ROUND((SELECT COALESCE(SUM(amount), 0) FROM revenue) - (SELECT COALESCE(SUM(amount), 0) FROM expenses), 2) as NetProfit
`);
console.table(profit);

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80));

await connection.end();
