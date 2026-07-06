import React from "react";
import { Box, Checkbox, Typography } from "@strapi/design-system";

export default function ReceiverItem({ item, tokens, removeToken, addToken }) {
  const { label, value } = item;
  const isIn = () => tokens.includes(value);
  const manageChange = () => {
    if (isIn()) {
      removeToken(value);
    } else {
      addToken(value);
    }
  };
  return (
    <Box paddingBottom={2}>
      <div style={{ display: "flex" }}>
        <Checkbox
          aria-label={label}
          name={label}
          onCheckedChange={manageChange}
          checked={isIn()}
        />
        <div style={{ marginLeft: 6 }}>
          <div style={{ fontWeight: isIn() ? "700" : "400" }}>
            <Typography variant="omega">{label}</Typography>
          </div>
        </div>
      </div>
    </Box>
  );
}
