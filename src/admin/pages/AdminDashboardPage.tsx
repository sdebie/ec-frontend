import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/shared/ui/primitives'

import { ProductStatCards } from './products/components/ProductStatCards'

export function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-(--c-text)">Dashboard</h1>
        <p className="mt-1 text-sm text-(--c-text-muted)">Overview of your store</p>
      </div>

      <Card as="section" variant="bordered">
        <Card.Body className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-(--c-text-muted)" />
              <h2 className="text-base font-semibold text-(--c-text)">Product Overview</h2>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-(--c-accent) hover:underline"
            >
              View all products →
            </Link>
          </div>
          <ProductStatCards />
        </Card.Body>
      </Card>
    </div>
  )
}
