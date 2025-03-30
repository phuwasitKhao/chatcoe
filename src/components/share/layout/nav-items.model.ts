import React from "react";

export interface NavItemModel {
  url: string;
  label: string | React.ReactNode;
  short_label?: string;
  icon?: React.JSX.Element;
}