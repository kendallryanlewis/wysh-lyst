import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Spark runtime exists in Spark-hosted environments only.
// On public static hosts (e.g. GitHub Pages), skip it gracefully.
void import("@github/spark/spark").catch(() => {
  // No-op outside Spark.
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
