# Modern CSS Design System - Usage Guide

## Overview

A comprehensive modern design system has been created based on the HomePage styling. This guide shows you how to apply modern styles throughout the application.

## 🎨 Color Palette

### Brand Colors
```css
brand-red: #FF385C
brand-pink: #EC4899
brand-purple: #A855F7
```

### Primary Colors (Red Scale)
```css
primary-50 to primary-900
Example: bg-primary-500 (red), text-primary-600
```

## 🔘 Button Styles

### Primary Button (Gradient)
```jsx
<button className="btn-primary">
  Save Changes
</button>
// Red to pink gradient with hover effects
```

### Secondary Button
```jsx
<button className="btn-secondary">
  Cancel
</button>
// White with border, subtle hover
```

### Outline Button
```jsx
<button className="btn-outline">
  Learn More
</button>
// Red border, transparent bg
```

### Ghost Button
```jsx
<button className="btn-ghost">
  View Details
</button>
// No background, subtle hover
```

## 📦 Card Styles

### Modern Card (Default)
```jsx
<div className="card-modern p-6">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
// White with modern shadow, hover lift
```

### Gradient Card
```jsx
<div className="card-gradient bg-gradient-primary">
  <h3 className="text-white">Stat: 92%</h3>
</div>
// Gradient background with scale hover
```

### Flat Card
```jsx
<div className="card-flat p-6">
  <p>Simple content</p>
</div>
// Minimal shadow, subtle hover
```

## 📊 Stats Cards

### Stats Card
```jsx
<div className="stat-card">
  <div className="flex items-center justify-between mb-4">
    <HomeIcon className="w-8 h-8 text-red-500" />
    <span className="text-sm text-gray-500">This Month</span>
  </div>
  <div className="text-3xl font-bold text-gray-900">$45,000</div>
  <p className="text-gray-600 mt-2">Total Revenue</p>
</div>
```

### Gradient Stats Card
```jsx
<div className="stat-card-gradient bg-gradient-to-br from-purple-500 to-pink-500">
  <TrendingUpIcon className="w-12 h-12 mb-4" />
  <div className="text-4xl font-bold">35%</div>
  <div className="text-purple-100">Growth Rate</div>
</div>
```

## 🎯 Icon Containers

### Standard Icon Container
```jsx
<div className="icon-container bg-red-100">
  <BuildingIcon className="w-6 h-6 text-red-600" />
</div>
```

### Gradient Icon Container
```jsx
<div className="icon-container-gradient bg-gradient-to-br from-red-500 to-pink-600">
  <UsersIcon className="w-7 h-7 text-white" />
</div>
```

## 📝 Form Elements

### Modern Input
```jsx
<input 
  type="text" 
  placeholder="Enter name"
  className="input-modern"
/>
```

### Modern Select
```jsx
<select className="select-modern">
  <option>Select option</option>
  <option>Option 1</option>
</select>
```

### Form Group
```jsx
<div className="form-group">
  <label className="form-label">
    Email Address
  </label>
  <input type="email" className="input-modern" />
  <p className="form-hint">We'll never share your email</p>
</div>
```

### Required Field
```jsx
<label className="form-label form-label-required">
  Full Name
</label>
// Automatically adds red asterisk
```

## 🔔 Badges

### Success Badge
```jsx
<span className="badge-success">Active</span>
```

### Warning Badge
```jsx
<span className="badge-warning">Pending</span>
```

### Error Badge
```jsx
<span className="badge-error">Overdue</span>
```

### Info Badge
```jsx
<span className="badge-info">New</span>
```

## 🎭 Modals

### Modal Structure
```jsx
<div className="modal-backdrop">
  <div className="modal-content">
    <div className="modal-header">
      <h2 className="text-xl font-semibold">Modal Title</h2>
      <button>
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
    <div className="p-6">
      Modal content...
    </div>
    <div className="p-6 border-t border-gray-200 actions-row">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

## 📊 Tables

### Modern Table
```jsx
<table className="table-modern">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td><span className="badge-success">Active</span></td>
      <td>
        <button className="btn-ghost">View</button>
      </td>
    </tr>
  </tbody>
</table>
```

## 🎨 Gradients

### Gradient Backgrounds
```jsx
<div className="bg-gradient-primary p-6 rounded-2xl">
  Content
</div>
// Available: bg-gradient-primary, bg-gradient-secondary, 
// bg-gradient-success, bg-gradient-warning, bg-gradient-info
```

### Gradient Text
```jsx
<h1 className="text-gradient-primary text-4xl font-bold">
  Amazing Title
</h1>

<h2 className="text-gradient-dark text-3xl font-bold">
  Subtitle
</h2>
```

## 🌟 Special Effects

### Glass Effect
```jsx
<div className="glass p-6 rounded-2xl">
  Frosted glass effect
</div>
```

### Hover Lift
```jsx
<div className="card-modern hover-lift p-6">
  Lifts up on hover
</div>
```

### Hover Scale
```jsx
<button className="hover-scale">
  Scales up on hover
</button>
```

## 📱 Page Layout

### Standard Page
```jsx
<div className="page-container">
  <div className="section-header">
    <h1 className="section-title">Page Title</h1>
    <p className="section-subtitle">Page description</p>
  </div>
  
  {/* Page content */}
</div>
```

## 🔄 Notifications

### Success Notification
```jsx
<div className="notification-success">
  Changes saved successfully!
</div>
```

### Error Notification
```jsx
<div className="notification-error">
  An error occurred
</div>
```

### Info Notification
```jsx
<div className="notification-info">
  New update available
</div>
```

## 🎪 Empty States

```jsx
<div className="empty-state">
  <UsersIcon className="empty-state-icon" />
  <p className="empty-state-text">No residents found</p>
  <p className="text-gray-400">Add your first resident to get started</p>
  <button className="btn-primary mt-4">Add Resident</button>
</div>
```

## 📏 Dividers

### Standard Divider
```jsx
<div className="divider"></div>
```

### Gradient Divider
```jsx
<div className="divider-gradient"></div>
```

## 🎯 Complete Examples

### Dashboard Stats Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="stat-card">
    <div className="icon-container bg-red-100 mb-4">
      <BuildingIcon className="w-6 h-6 text-red-600" />
    </div>
    <div className="text-3xl font-bold text-gray-900">156</div>
    <p className="text-gray-600 mt-2">Total Units</p>
  </div>
  
  <div className="stat-card-gradient bg-gradient-to-br from-green-500 to-emerald-500">
    <CurrencyDollarIcon className="w-8 h-8 mb-3" />
    <div className="text-3xl font-bold">$125K</div>
    <p className="text-green-100 mt-2">Revenue</p>
  </div>
</div>
```

### Modern Form
```jsx
<form className="card-modern p-6 space-y-6">
  <div className="form-group">
    <label className="form-label form-label-required">
      Full Name
    </label>
    <input type="text" className="input-modern" />
  </div>
  
  <div className="form-group">
    <label className="form-label">Building</label>
    <select className="select-modern">
      <option>Select building</option>
    </select>
  </div>
  
  <div className="divider"></div>
  
  <div className="actions-row">
    <button type="button" className="btn-secondary">Cancel</button>
    <button type="submit" className="btn-primary">Save</button>
  </div>
</form>
```

### Data List with Modern Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="card-modern hover-lift p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {item.name}
        </h3>
        <span className="badge-success">Active</span>
      </div>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <button className="btn-outline w-full">View Details</button>
    </div>
  ))}
</div>
```

### Feature Section
```jsx
<section className="py-20 bg-gradient-to-b from-white to-gray-50">
  <div className="page-container">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gradient-dark mb-4">
        Our Features
      </h2>
      <p className="text-xl text-gray-600">
        Everything you need in one place
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div className="card-modern hover-lift p-8">
          <div className="icon-container-gradient bg-gradient-primary mb-6">
            <feature.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

## 🎬 Animations

### Fade In
```jsx
<div className="animate-fade-in">
  Fades in smoothly
</div>
```

### Slide Up
```jsx
<div className="animate-slide-up">
  Slides up from bottom
</div>
```

### Scale In
```jsx
<div className="animate-scale-in">
  Scales in from 95% to 100%
</div>
```

## 🛠️ Utilities

### Hide Scrollbar
```jsx
<div className="overflow-y-auto scrollbar-hide">
  Content with hidden scrollbar
</div>
```

### Text Shadow
```jsx
<h1 className="text-shadow text-4xl">
  Subtle text shadow
</h1>
```

### Loading Spinner
```jsx
<div className="spinner w-8 h-8"></div>
```

## 📋 Best Practices

### 1. **Use Semantic Classes**
```jsx
// Good
<button className="btn-primary">Save</button>

// Avoid
<button className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-2.5...">
```

### 2. **Combine with Tailwind**
```jsx
<div className="card-modern p-6 mb-4">
  Combines custom class with Tailwind utilities
</div>
```

### 3. **Consistent Spacing**
```jsx
// Use consistent gap/spacing
<div className="grid gap-6">     // Good
<div className="grid gap-8">     // For larger sections
```

### 4. **Hover Effects**
```jsx
// Add hover effects to interactive elements
<div className="card-modern hover-lift cursor-pointer">
  Click me
</div>
```

## 🎯 Migration Examples

### Before (Old Style)
```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  Submit
</button>
```

### After (Modern Style)
```jsx
<button className="btn-primary">
  Submit
</button>
```

---

### Before (Old Style)
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  Content
</div>
```

### After (Modern Style)
```jsx
<div className="card-modern p-6">
  Content
</div>
```

---

### Before (Old Style)
```jsx
<input 
  type="text" 
  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
/>
```

### After (Modern Style)
```jsx
<input type="text" className="input-modern" />
```

## 🚀 Quick Start

### 1. Update a Simple Component

**Old Dashboard.tsx**:
```jsx
<div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
  <div className="bg-white rounded-lg shadow p-6">
    <p>Total: 100</p>
  </div>
</div>
```

**New Dashboard.tsx**:
```jsx
<div className="page-container">
  <div className="section-header">
    <h1 className="section-title">Dashboard</h1>
  </div>
  <div className="stat-card">
    <div className="text-3xl font-bold text-gray-900">100</div>
    <p className="text-gray-600 mt-2">Total Units</p>
  </div>
</div>
```

### 2. Update Buttons Throughout
Find and replace common button patterns:

```bash
# Old blue buttons → Modern primary
bg-blue-600 → btn-primary (and remove other classes)

# Old gray buttons → Modern secondary
bg-gray-100 → btn-secondary
```

### 3. Update Cards
```bash
# Old cards → Modern cards
bg-white rounded-lg shadow-sm → card-modern
```

## 🎨 Design Tokens Reference

### Spacing
- `gap-6` - Standard grid gap
- `gap-8` - Larger sections
- `p-6` - Standard padding
- `p-8` - Generous padding

### Rounded Corners
- `rounded-lg` - Small radius (8px)
- `rounded-xl` - Medium radius (12px)
- `rounded-2xl` - Large radius (16px)
- `rounded-3xl` - Extra large (24px)

### Shadows
- `shadow-modern` - Subtle elevation
- `shadow-modern-lg` - Medium elevation
- `shadow-modern-xl` - High elevation
- `shadow-glow-red` - Red glow effect
- `shadow-glow-pink` - Pink glow effect

## 💡 Pro Tips

1. **Combine gradient text with bold fonts**:
   ```jsx
   <h1 className="text-gradient-primary text-5xl font-bold">
     Title
   </h1>
   ```

2. **Layer shadows for depth**:
   ```jsx
   <div className="card-modern shadow-modern-lg hover:shadow-modern-xl">
   ```

3. **Use transitions everywhere**:
   ```jsx
   <div className="transition-all duration-300">
   ```

4. **Add hover effects to cards**:
   ```jsx
   <div className="card-modern hover-lift">
   ```

5. **Group related actions**:
   ```jsx
   <div className="actions-row">
     <button className="btn-secondary">Cancel</button>
     <button className="btn-primary">Save</button>
   </div>
   ```

## 📚 Component Examples

See these files for modern styling examples:
- `src/pages/HomePage.tsx` - Full modern design
- `src/pages/Settings.tsx` - Modern form layout
- `src/components/Layout/Header.tsx` - Modern navigation

## 🔧 Customization

To customize colors, edit `tailwind.config.js`:

```javascript
colors: {
  brand: {
    red: '#YOUR_COLOR',
    pink: '#YOUR_COLOR',
    purple: '#YOUR_COLOR',
  }
}
```

Then rebuild your styles:
```bash
npm run dev
```

---

**Happy Styling! 🎨**

