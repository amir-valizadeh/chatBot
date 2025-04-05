import type { SVGProps } from "react";
const SvgExploreIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={13}
    fill="none"
    role="img"
    {...props}
  >
    <circle cx={10} cy={3} r={2.375} stroke="#5D5D5D" strokeWidth={1.25} />
    <circle cx={3} cy={3} r={2.375} stroke="#5D5D5D" strokeWidth={1.25} />
    <circle cx={10} cy={10} r={2.375} stroke="#5D5D5D" strokeWidth={1.25} />
    <circle cx={3} cy={10} r={2.375} stroke="#5D5D5D" strokeWidth={1.25} />
  </svg>
);
export default SvgExploreIcon;
