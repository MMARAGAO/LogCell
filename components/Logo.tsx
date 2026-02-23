"use client";

import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  className = "",
  width = 333,
  height = 338,
}: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Função para verificar o tema
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Verificar inicialmente
    checkTheme();

    // Observar mudanças no tema
    const observer = new MutationObserver(checkTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const secondaryColor = isDark ? "#615A5A" : "#FFFFFF";

  return (
    <svg
      className={className}
      fill="none"
      height={height}
      style={{ color: "hsl(var(--heroui-primary))" }}
      viewBox="0 0 333 338"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M48.8982 46.3072C46.0619 36.3103 53.359 26.3043 63.7444 25.9495L157.711 22.7398C171.924 22.2542 184.645 31.5023 188.567 45.1724L257.973 287.08C260.832 297.047 253.601 307.059 243.241 307.479L148.772 311.306C134.454 311.886 121.605 302.578 117.694 288.793L48.8982 46.3072Z"
        fill="black"
        opacity="0.74"
      />
      <path
        d="M51.8242 48.2879C48.9675 38.2849 56.266 28.2587 66.6629 27.9036L155.744 24.8607C169.939 24.3758 182.648 33.6005 186.587 47.2476L255.124 284.752C257.989 294.683 250.828 304.685 240.503 305.171L151.239 309.372C136.87 310.048 123.923 300.75 119.973 286.919L51.8242 48.2879Z"
        fill={secondaryColor}
        opacity="0.74"
      />
      <path
        d="M42.2853 58.815C41.5769 56.3067 41.1233 53.7072 41.3594 51.1114C42.2616 41.1924 47.2912 34.8605 54.8328 28.8972C53.4999 29.9777 46.5536 34.9397 48.926 46.5165L116.663 286.214C123.866 305.449 131.68 310.853 151.886 311.216L241.143 307.55C250.139 307.779 255.171 302.856 258.081 295.571C256.561 303.271 251.246 309.991 243.865 314.848C241.114 316.658 237.832 317.403 234.54 317.486L150.516 319.605C128.373 320.468 119.452 315.909 109.921 298.285L42.2853 58.815Z"
        fill="url(#paint0_linear_44_14)"
      />
      <path
        d="M49.7049 34.179C48.2354 37.0747 47.3129 41.1351 48.4362 46.6166L48.4401 46.6351L48.4451 46.6527L116.182 286.35L116.188 286.369L116.195 286.389C119.807 296.036 123.606 302.312 129.11 306.201C134.614 310.09 141.744 311.534 151.877 311.716L151.892 311.716L151.907 311.716L241.147 308.05C245.738 308.164 249.355 306.962 252.199 304.774C253.579 303.713 254.766 302.424 255.793 300.958C253.356 306.214 249.061 310.83 243.59 314.43C240.94 316.175 237.757 316.906 234.528 316.987L150.503 319.105L150.497 319.105C139.448 319.535 131.791 318.607 125.72 315.435C119.67 312.273 115.123 306.842 110.385 298.093L42.7661 58.679C42.066 56.2001 41.6286 53.667 41.8569 51.1569C42.5046 44.036 45.3133 38.7966 49.7049 34.179Z"
        stroke="url(#paint1_linear_44_14)"
        strokeOpacity="0.31"
      />
      <path
        d="M20.0143 180.086C13.9962 173.564 15.2828 163.135 22.8025 158.421L33.8023 151.526C49.0894 141.943 68.9998 144.066 81.8925 156.687C108.992 183.217 128.744 203.703 146.607 233.729C204.264 116.701 253.665 72.9852 312.741 35.7876C316.539 33.396 320.608 38.1082 317.76 41.5776C253.461 119.916 209.652 178.899 179.878 284.491C175.364 300.498 164.055 313.855 148.672 320.176L137.842 324.627C129.012 328.255 118.828 322.829 115.235 313.985C101.829 280.981 67.401 231.447 20.0143 180.086Z"
        fill="currentColor"
      />
      <rect
        fill="#231D1D"
        fillOpacity="0.82"
        height="12.2333"
        rx="6.11667"
        transform="rotate(-1.84097 94.0312 32.4849)"
        width="43.1528"
        x="94.0312"
        y="32.4849"
      />
      <rect
        fill="#A9A0A0"
        fillOpacity="0.82"
        height="3.69022"
        rx="1.84511"
        transform="rotate(74.46 52.9092 73.5734)"
        width="11.6982"
        x="52.9092"
        y="73.5734"
      />
      <rect
        fill="#595555"
        fillOpacity="0.82"
        height="3.69022"
        rx="1.84511"
        transform="rotate(74.46 57.5059 89.8812)"
        width="15.4172"
        x="57.5059"
        y="89.8812"
      />
      <rect
        fill="#595555"
        fillOpacity="0.82"
        height="3.69022"
        rx="1.84511"
        transform="rotate(74.46 62.2598 106.642)"
        width="15.4172"
        x="62.2598"
        y="106.642"
      />

      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_44_14"
          x1="170.186"
          x2="126.145"
          y1="47.7303"
          y2="317.489"
        >
          <stop stopColor="#212020" />
          <stop offset="1" stopColor="#423D3D" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_44_14"
          x1="170.186"
          x2="126.145"
          y1="47.7303"
          y2="317.489"
        >
          <stop offset="0.158654" stopColor="#9A9696" />
          <stop offset="0.307692" stopColor="#333333" />
          <stop offset="0.591346" stopColor="#4D4D4D" />
          <stop offset="0.826923" stopColor="#8F8C8C" />
          <stop offset="0.980769" stopColor="#333333" />
        </linearGradient>
      </defs>
    </svg>
  );
}
