# Settings Hooks - Usage Examples

## Available Hooks

The settings system provides four powerful hooks for accessing and using application settings:

1. `useSettings()` - Get all settings at once
2. `useSetting(key)` - Get a specific setting
3. `useCurrencyFormatter()` - Format currency based on settings
4. `useDateFormatter()` - Format dates based on settings

## Import

```typescript
import { 
  useSettings, 
  useSetting, 
  useCurrencyFormatter, 
  useDateFormatter 
} from '../hooks'
```

## Examples

### 1. Using `useSettings()` Hook

Get all settings at once with loading and error states:

```typescript
import { useSettings } from '../hooks'

function MyComponent() {
  const { settings, loading, error, refetch, getSetting } = useSettings()

  if (loading) {
    return <div>Loading settings...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h2>Current Settings</h2>
      <p>Language: {settings?.default_language}</p>
      <p>Timezone: {settings?.default_timezone}</p>
      <p>Currency: {settings?.default_currency}</p>
      <p>Date Format: {settings?.date_format}</p>
      
      <button onClick={refetch}>Refresh Settings</button>
      
      {/* Or use getSetting helper */}
      <p>Currency Symbol: {getSetting('currency_symbol')}</p>
    </div>
  )
}
```

### 2. Using `useSetting(key)` Hook

Get a single setting value:

```typescript
import { useSetting } from '../hooks'

function CurrencyDisplay() {
  const currency = useSetting('default_currency')
  
  return (
    <div>
      Default Currency: {currency || 'ARS'}
    </div>
  )
}
```

### 3. Using `useCurrencyFormatter()` Hook

Format amounts with the configured currency:

```typescript
import { useCurrencyFormatter } from '../hooks'

function PaymentCard({ amount }: { amount: number }) {
  const formatCurrency = useCurrencyFormatter()
  
  return (
    <div className="payment-card">
      <h3>Payment Amount</h3>
      <p className="amount">{formatCurrency(amount)}</p>
      {/* Displays: $1,234.56 (depending on currency settings) */}
    </div>
  )
}

// Example with multiple amounts
function FinancialSummary() {
  const formatCurrency = useCurrencyFormatter()
  
  const revenue = 50000
  const expenses = 32000
  const profit = revenue - expenses
  
  return (
    <div>
      <div>Revenue: {formatCurrency(revenue)}</div>
      <div>Expenses: {formatCurrency(expenses)}</div>
      <div>Profit: {formatCurrency(profit)}</div>
    </div>
  )
}
```

### 4. Using `useDateFormatter()` Hook

Format dates according to the configured format:

```typescript
import { useDateFormatter } from '../hooks'

function EventCard({ eventDate }: { eventDate: string }) {
  const formatDate = useDateFormatter()
  
  return (
    <div className="event-card">
      <h3>Event Date</h3>
      <p>{formatDate(eventDate)}</p>
      {/* Displays: 31/12/2025 or 12/31/2025 depending on settings */}
    </div>
  )
}

// Example with current date
function DateDisplay() {
  const formatDate = useDateFormatter()
  
  return (
    <div>
      Today is: {formatDate(new Date())}
    </div>
  )
}
```

### 5. Complete Example - Payment List Component

Combining multiple hooks:

```typescript
import { useCurrencyFormatter, useDateFormatter, useSettings } from '../hooks'

interface Payment {
  id: string
  amount: number
  date: string
  description: string
}

function PaymentList({ payments }: { payments: Payment[] }) {
  const formatCurrency = useCurrencyFormatter()
  const formatDate = useDateFormatter()
  const { settings, loading } = useSettings()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="payment-list">
      <div className="header">
        <h2>Payments</h2>
        <p className="meta">
          Currency: {settings?.default_currency} | 
          Timezone: {settings?.default_timezone}
        </p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.description}</td>
              <td>{formatDate(payment.date)}</td>
              <td className="amount">{formatCurrency(payment.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="total">
        Total: {formatCurrency(
          payments.reduce((sum, p) => sum + p.amount, 0)
        )}
      </div>
    </div>
  )
}
```

### 6. Dashboard Stats with Formatted Values

```typescript
import { useCurrencyFormatter } from '../hooks'

function DashboardStats() {
  const formatCurrency = useCurrencyFormatter()
  
  const stats = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    netProfit: 40000,
    averageRent: 2500
  }
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p className="value">{formatCurrency(stats.totalRevenue)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Total Expenses</h3>
        <p className="value">{formatCurrency(stats.totalExpenses)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Net Profit</h3>
        <p className="value">{formatCurrency(stats.netProfit)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Average Rent</h3>
        <p className="value">{formatCurrency(stats.averageRent)}</p>
      </div>
    </div>
  )
}
```

### 7. Conditional Rendering Based on Settings

```typescript
import { useSettings } from '../hooks'

function LanguageSpecificContent() {
  const { settings } = useSettings()
  
  return (
    <div>
      {settings?.default_language === 'es' ? (
        <p>Contenido en español</p>
      ) : (
        <p>Content in English</p>
      )}
    </div>
  )
}
```

### 8. Real-time Settings Refresh

```typescript
import { useSettings } from '../hooks'
import { useEffect } from 'react'

function SettingsMonitor() {
  const { settings, refetch } = useSettings()
  
  // Refresh settings every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [refetch])
  
  return (
    <div>
      <h3>Live Settings Monitor</h3>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
      <button onClick={refetch}>Refresh Now</button>
    </div>
  )
}
```

## Best Practices

### 1. Use Appropriate Hook for Your Needs

- Use `useSettings()` when you need multiple settings
- Use `useSetting(key)` for a single setting
- Use formatters for consistent data display

### 2. Handle Loading States

```typescript
const { settings, loading } = useSettings()

if (loading) return <LoadingSpinner />
```

### 3. Provide Fallback Values

```typescript
const currency = getSetting('default_currency') || 'ARS'
```

### 4. Memoize Expensive Operations

```typescript
import { useMemo } from 'react'

function ExpensiveComponent() {
  const formatCurrency = useCurrencyFormatter()
  
  const formattedValues = useMemo(() => {
    return largeArray.map(item => ({
      ...item,
      formattedAmount: formatCurrency(item.amount)
    }))
  }, [largeArray, formatCurrency])
  
  return <div>{/* render formatted values */}</div>
}
```

### 5. Combine with Other Hooks

```typescript
import { useSettings } from '../hooks'
import { useTranslation } from 'react-i18next'

function InternationalizedComponent() {
  const { settings } = useSettings()
  const { i18n } = useTranslation()
  
  // Sync i18n with settings
  useEffect(() => {
    if (settings?.default_language && 
        settings.default_language !== i18n.language) {
      i18n.changeLanguage(settings.default_language)
    }
  }, [settings, i18n])
  
  return <div>Content</div>
}
```

## Performance Tips

1. **Avoid unnecessary re-renders**: The hooks use React state, so components will re-render when settings change
2. **Use `useSetting()` for single values**: More efficient than `useSettings()` when you only need one setting
3. **Memoize formatted values**: If formatting large datasets, use `useMemo()`
4. **Refetch sparingly**: Only call `refetch()` when necessary

## TypeScript Support

All hooks are fully typed:

```typescript
interface AppSettings {
  default_language: string
  default_timezone: string
  default_currency: string
  date_format: string
  currency_symbol: string
}

interface UseSettingsReturn {
  settings: AppSettings | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getSetting: (key: keyof AppSettings) => string | undefined
}
```

