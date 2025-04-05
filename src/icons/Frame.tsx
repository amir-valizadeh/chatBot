import type { SVGProps } from "react";
const SvgFrame = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={21}
    fill="none"
    role="img"
    {...props}
  >
    <path
      stroke="#F4F4F4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.333}
      d="M10 17.5v-14M3 10.5l7-7 7 7"
    />
  </svg>
);
export default SvgFrame;
