import type { SVGProps } from "react";
const SvgVector = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={17}
    fill="none"
    role="img"
    {...props}
  >
    <path
      fill="#5D5D5D"
      fillRule="evenodd"
      d="M7 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11M0 7a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 0 7"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgVector;
