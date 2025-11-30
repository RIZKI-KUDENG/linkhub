"use client";

import Masonry from "react-masonry-css";

export default function MasonryClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const breakpoints = {
    default: 3,
    1200: 3,
    900: 2,
    600: 2, 
    400: 2
  };
  return (
    <Masonry
      breakpointCols={breakpoints}
      className="flex gap-4 w-full"
      columnClassName="masonry-column"
    >
      {children}
    </Masonry>
  );
}
