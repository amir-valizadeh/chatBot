import type { SVGProps } from "react";
const SvgNewChatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={18}
    fill="none"
    role="img"
    {...props}
  >
    <path
      stroke="#5D5D5D"
      strokeWidth={1.5}
      d="m6.258 8.874 6.844-6.844c.11-.068.415-.23.82-.249.393-.017.966.097 1.63.761.665.665.779 1.238.762 1.631a1.76 1.76 0 0 1-.249.82l-6.844 6.844a.25.25 0 0 1-.11.064l-3.601.992a.25.25 0 0 1-.308-.308l.992-3.6a.25.25 0 0 1 .064-.111Z"
    />
    <path
      stroke="#5D5D5D"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.5 2H5a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-2.429"
    />
  </svg>
);
export default SvgNewChatIcon;
