/**
 * Logo Icon Component
 * 
 * SVG logo icon with customizable styling
 * and watercolor artist aesthetic.
 */

import clsx from 'clsx'

interface LogoIconProps extends React.ComponentProps<'svg'> {
  className?: string
}

export function LogoIcon({ className, ...props }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UConstruction logo"
      viewBox="0 0 32 28"
      {...props}
      className={clsx('h-4 w-4 fill-current', className)}
    >
      <path d="M21.5758 9.75769L16 0L0 28H11.6255L21.5758 9.75769Z" />
      <path d="M26.2381 17.9167L20.7382 28H32L26.2381 17.9167Z" />
    </svg>
  )
}

export default LogoIcon
