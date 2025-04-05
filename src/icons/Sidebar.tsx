import type { SVGProps } from "react";
const SvgSidebar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={16}
    fill="none"
    role="img"
    {...props}
  >
    <path
      stroke="#5D5D5D"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M4 5h1M4 8h1"
    />
    <path stroke="#5D5D5D" strokeWidth={1.5} d="M8 1v14" />
    <rect
      width={16}
      height={14}
      x={1}
      y={1}
      stroke="#5D5D5D"
      strokeWidth={1.5}
      rx={4}
    />
  </svg>
);
export default SvgSidebar;
