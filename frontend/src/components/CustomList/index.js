import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PropTypes from "prop-types";

function CustomList({ items, renderItem }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [items]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <Box display="flex" alignItems="center" position="relative">
      {showLeft && (
        <Box
          sx={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              color: "black",
              "&:hover": {
                background: "rgba(0,0,0,0.1)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      )}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2, // ✅ khoảng cách giữa các item
          overflowX: "auto",
          scrollBehavior: "smooth",
          px: 1, // ✅ padding ngang để tránh item sát mép
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item) => (
          <Box key={item.id} sx={{ flex: "0 0 auto", minWidth: 220 }}>
            {renderItem(item)}
          </Box>
        ))}
      </Box>
      {showRight && (
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(6px)",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <IconButton
            onClick={() => scroll("right")}
            sx={{
              color: "black",
              "&:hover": {
                background: "rgba(0,0,0,0.1)",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

CustomList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default CustomList;
