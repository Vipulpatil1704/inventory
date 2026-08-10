import { Badge } from '@/components/ui/badge'

const variantMap = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
}

export function StatusBadge({ status }) {
  return <Badge variant={variantMap[status] || 'secondary'}>{status}</Badge>
}
