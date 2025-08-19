# Proposed UX Improvements

This document outlines a plan to improve the user experience of the Cutia expense tracker application.

## 1. Simplify the Dashboard

The current dashboard is comprehensive but can be overwhelming. The goal is to simplify the layout and prioritize key information.

*   **Prioritize Key Information:** Redesign the dashboard to highlight the most critical information, such as "Balanço Mensal" (Monthly Balance) and "Orçamento Restante" (Remaining Budget).
*   **Use Tabs:** Organize the charts and tables into tabs (e.g., "Visão Geral", "Rendas", "Despesas") to reduce cognitive load.
*   **Improve Visual Hierarchy:** Use spacing, font sizes, and colors to create a clearer visual hierarchy and guide the user's eye.
*   **Historical Data Viewing:** Add a date filter to the dashboard to allow users to see stats for previous months.

## 2. Enhance Forms

The forms for adding and editing expenses and incomes can be more user-friendly and consistent.

*   **Standardize Form Handling:** Refactor the `expense-form.tsx` to use `react-hook-form` and `zod` for consistency with `income-form.tsx`. This will improve validation and make the code easier to maintain.
*   **Improve Date Picker:** The current date picker is functional, but we can improve the user experience by adding presets (e.g., "Today", "Yesterday", "Last Week") to make date selection faster.
*   **Add "Add Another" option:** After successfully adding an expense or income, provide an "Add Another" button to streamline the process of adding multiple entries.

## 3. Advanced Features

Adding these advanced features will make the app more powerful and personalized.

*   **Recurring Transactions:** Allow users to set up recurring expenses and incomes to automate data entry.
*   **Per-Category Budgets:** Allow users to set budgets for specific categories. This could be enhanced with a "smart budget" feature that suggests a budget based on the user's average spending.
*   **Customizable Categories:** Allow users to create, edit, and delete their own expense and income categories.

## 4. Improve Onboarding and Empty States

A better onboarding experience and clearer empty states will help users get started and understand the application's features.

*   **Welcome Message:** Show a welcome message to new users with a brief tour of the main features.
*   **Empty State for Charts:** Add empty states to the income and expense charts to provide guidance when there's no data to display.

## 5. Month Picker Improvements ✅ COMPLETED

Enhanced the month picker component to provide a better user experience for navigating between different months:

*   **Streamlined Layout:** Redesigned from a bulky card-based layout to a compact, horizontal inline component that integrates seamlessly with the dashboard header.
*   **Intuitive Navigation:** Added arrow buttons for easy month-to-month navigation (previous/next month).
*   **Dropdown Selectors:** Replaced the calendar popup with dedicated dropdowns for month and year selection, making it more accessible and user-friendly.
*   **"Este mês" Button:** Added a "Este mês" (This month) button that appears when viewing historical data, allowing users to quickly return to the current month.
*   **Responsive Design:** 
  - Mobile-first approach with optimal layout for small screens
  - Intelligent reordering of elements on mobile vs desktop
  - Proper spacing and sizing for touch interfaces
  - Full-width layout on mobile, compact on desktop
*   **Better Visual Design:** 
  - Clean, minimal design that doesn't compete with content
  - Consistent button sizing and spacing
  - Proper text sizing for readability
  - No unnecessary visual weight
*   **Improved Dashboard Integration:** 
  - Perfect integration with dashboard header
  - Responsive layout that adapts to different screen sizes
  - No longer takes up excessive vertical space
  - Better visual hierarchy with the main content

The new month picker is much more compact and user-friendly, fixing the previous clunky layout issues while maintaining all the navigation functionality.

## 6. Dashboard Tab Consistency ✅ COMPLETED

Updated the dashboard tab triggers to match the styling and design patterns used in the expenses and incomes sections for better consistency across the application:

*   **Grid Layout:** Changed from default tab layout to full-width grid layout (`grid w-full grid-cols-3`) matching other sections
*   **Icon Integration:** Added meaningful icons to each tab:
  - Visão Geral: Eye icon (overview/visibility)
  - Análise Mensal: Calendar icon (monthly analysis)
  - Análise Geral: Activity icon (general analytics)
*   **Responsive Text:** Implemented responsive text display:
  - Full text on larger screens (`hidden sm:inline`)
  - Abbreviated text on mobile (`sm:hidden`) for better mobile experience
*   **Consistent Styling:** Now uses the same `flex items-center gap-2` pattern as other tab sections
*   **Better Mobile Experience:** Shorter text labels on mobile screens (Visão, Mensal, Geral) save space while maintaining clarity

The dashboard tabs now have a cohesive look and feel that matches the rest of the application's interface design patterns.
