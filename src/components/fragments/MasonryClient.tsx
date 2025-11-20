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
    600: 1,
  };
  return (
    <Masonry
      breakpointCols={breakpoints}
      className="flex gap-4"
      columnClassName="masonry-column"
    >
      {children}
    </Masonry>
  );
}
