import { Icon } from "@via-ds/icons";

export function WandIcon(props) {
  return <Icon glyph="Sparkle" size={14} {...props} />;
}

export function WizardIcon(props) {
  return <Icon glyph="Wizard" size={14} {...props} />;
}

export function SearchIcon(props) {
  return <Icon glyph="MagnifyingGlass" size={15} {...props} />;
}

export function GearIcon(props) {
  return <Icon glyph="Settings" size={14} {...props} />;
}

export function HistoryIcon(props) {
  return <Icon glyph="Clock" size={15} {...props} />;
}

export function ProfileIcon(props) {
  return <Icon glyph="Person" size={15} {...props} />;
}

export function OrdersIcon(props) {
  return <Icon glyph="Package" size={15} {...props} />;
}

export function LogoutIcon(props) {
  return <Icon glyph="LogOut" size={15} {...props} />;
}

//Not able to find a cart ico from leafygreen ui
export function CartIcon(props) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function TrashIcon(props) {
  return <Icon glyph="Trash" size={15} {...props} />;
}

export function CheckIcon(props) {
  return <Icon glyph="Checkmark" size={26} {...props} />;
}

export function ChevronRightIcon(props) {
  return <Icon glyph="ChevronRight" size={16} {...props} />;
}
