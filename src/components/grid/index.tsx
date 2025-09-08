import clsx from 'clsx'

// Base Grid Component
function Grid(props: React.ComponentProps<'ul'>) {
  return (
    <ul {...props} className={clsx('grid grid-flow-row gap-4', props.className)}>
      {props.children}
    </ul>
  )
}

// Grid Item Component
function GridItem(props: React.ComponentProps<'li'>) {
  return (
    <li {...props} className={clsx('aspect-square transition-opacity', props.className)}>
      {props.children}
    </li>
  )
}

Grid.Item = GridItem

export default Grid

// Export all grid components
export { ThreeItemGrid } from './three-item'
export { ProductGrid } from './product-grid'
export { GridTileImage } from './tile'
